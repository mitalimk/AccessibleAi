// src/app/text-simplification/simplificationApi.js

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Simplifies text using Google's Gemini 1.5 model based on audience type
 * @param {string} text - The original text to simplify
 * @param {string} audienceType - Type of simplification (general, kids, elderly, emoji)
 * @returns {Promise<string>} - The simplified text
 */
 export async function simplifyTextWithGemini(text, audienceType, style = 'informative') {
  if (!text || !audienceType) {
    throw new Error("Text and audience type are required");
  }

  // Define prompts based on audience type
  // Define prompts based on audience type
const prompts = {
  general: `Please simplify the following text to make it more accessible and easier to understand for a general audience. Use plain language, shorter sentences, and explain complex terms. Keep the meaning intact but make it clearer:

${text}`,
  
  kids: `Please rewrite the following text for children aged 8-12. Use child-friendly vocabulary, simple sentence structure, concrete examples or analogies where helpful, and an engaging tone. Avoid complex terminology, and if needed, explain difficult concepts in ways kids can understand:

${text}`,
  
  elderly: `Please rewrite the following text to be more accessible for elderly readers. Use clear, straightforward language with an appropriate but not condescending tone. Avoid jargon, use slightly larger text organization with clear paragraphs, and provide context for specialized terms. Make the content respectful and easy to follow:

${text}`,
  
  emoji: `Please rewrite the following text in a simplified form with appropriate emojis to aid understanding. Use simpler language and add relevant emojis next to key concepts to make the content more visual and engaging:

${text}`
};

// Add style modifiers to the prompts
const styleModifiers = {
  informative: "Present the information in a clear, factual manner with proper explanations.",
  technical: "Maintain technical accuracy while explaining concepts. Include relevant technical terms with explanations when necessary.",
  short: "Keep the explanation very concise and to the point. Focus only on the most essential information.",
  educational: "Structure the content in an educational format with clear learning points. Use examples and explanations that aid understanding and retention."
};

// Modify the prompt to include the style
const styleModifier = styleModifiers[style] || styleModifiers.informative;
const finalPrompt = prompts[audienceType] + `\n\nAdditional instruction: ${styleModifier}`;

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: finalPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to simplify text. Please try again later.");
  }
}

// Function to detect text complexity and suggest simplification
export async function analyzeTextComplexity(text) {
  if (!text) return null;

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyze the reading level and complexity of the following text. Provide a brief assessment of:
                1. Reading level (elementary, middle school, high school, college, etc.)
                2. Complexity score on a scale of 1-10 (1 being very simple, 10 being very complex)
                3. Identify 2-3 specific aspects that make this text complex (jargon, sentence length, abstract concepts, etc.)
                
                Format your response in JSON:
                {
                  "readingLevel": "...",
                  "complexityScore": X,
                  "complexityFactors": ["factor1", "factor2", "factor3"]
                }
                
                Here's the text:
                ${text}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Could not parse complexity analysis response");
    }

  } catch (error) {
    console.error("Error analyzing text complexity:", error);
    return null;
  }
}