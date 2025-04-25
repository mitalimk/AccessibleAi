// src/app/api/generate-caption/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, audienceType, customPrompt } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build the prompt based on audience type
    let promptText = "Generate 6 different creative captions for this image. Provide a mix of caption styles:\n";
    promptText += "- First 2 captions should be very short (2-3 words only)\n";
    promptText += "- Next 2 captions should be medium length (5-8 words)\n";
    promptText += "- Last 2 captions should be longer and more creative (10-15 words)\n\n";
    promptText += "These should be actual social media style captions someone would use with the image, not descriptions of what's in the image. Include hashtags in some of the longer captions. ";
    
    switch (audienceType) {
      case 'children':
        promptText += "Use simple, engaging language that children can easily understand. Make them fun and playful.";
        break;
      case 'experts':
        promptText += "Include relevant terminology that domain experts would appreciate. Make them professional but engaging.";
        break;
      case 'elderly':
        promptText += "Use clear, straightforward language with common terms. Avoid modern slang or complex jargon.";
        break;
      default: // general
        promptText += "Use language suitable for a general social media audience with a mix of casual and catchy phrases.";
    }

    // Add custom prompt if provided
    if (customPrompt) {
      promptText += ` Additional instructions: ${customPrompt}`;
    }

    // Format instructions for the captions
    promptText += " Format your response with each caption numbered from 1-6, with clear line breaks between them. Don't label them as 'short', 'medium', or 'long' - just provide the numbered captions.";

    // Prepare the image data
    const imageData = {
      inlineData: {
        data: image,
        mimeType: "image/jpeg", // Adjust based on actual image type if needed
      },
    };

    // Generate content with Gemini
    const result = await model.generateContent([promptText, imageData]);
    const response = await result.response;
    const caption = response.text();

    return NextResponse.json({ caption });
  } catch (error) {
    console.error('Error generating caption:', error);
    return NextResponse.json({ 
      error: 'Failed to generate caption',
      details: error.message
    }, { status: 500 });
  }
}