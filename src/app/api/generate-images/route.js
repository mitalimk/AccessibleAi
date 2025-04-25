// app/api/generate-image/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in your .env file
});

const imagesDir = path.join(process.cwd(), 'data', 'images');
const simplifiedTextPath = path.join(process.cwd(), 'data', 'simplified-text.json');

// Extract keywords from text for image generation
function extractKeywords(text, maxKeywords = 5) {
  // Simple keyword extraction - in production you might want to use NLP
  // Remove common words and get unique meaningful words
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'through', 'over', 'before', 'between', 'after', 'since', 'without', 'under', 'within', 'along', 'following', 'across', 'behind', 'beyond', 'plus', 'except', 'but', 'up', 'out', 'around', 'down', 'off', 'above', 'near', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could', 'of', 'that', 'this', 'these', 'those', 'it', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how']);
  
  // Split by non-alphanumeric characters and filter
  const words = text.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  // Count word frequency
  const wordFrequency = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Sort by frequency and get top keywords
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(entry => entry[0]);
}

export async function GET() {
  try {
    // Check if the images directory exists
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Get all image files
    const files = fs.readdirSync(imagesDir);
    const imageFiles = files.filter(file => 
      file.endsWith('.jpg') || 
      file.endsWith('.jpeg') || 
      file.endsWith('.png') ||
      file.endsWith('.gif')
    );
    
    const images = imageFiles.map(file => ({
      id: file.split('.')[0],
      url: `/data/images/${file}`,
      time: fs.statSync(path.join(imagesDir, file)).mtime.getTime()
    })).sort((a, b) => b.time - a.time); // Sort by creation time (newest first)
    
    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving images:', error);
    return NextResponse.json({ error: 'Failed to retrieve images' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Load simplified text to use for image generation
    if (!fs.existsSync(simplifiedTextPath)) {
      return NextResponse.json({ error: 'No simplified text available for image generation' }, { status: 400 });
    }
    
    const textData = JSON.parse(fs.readFileSync(simplifiedTextPath, 'utf8'));
    const text = textData.text;
    
    if (!text) {
      return NextResponse.json({ error: 'Empty text content' }, { status: 400 });
    }
    
    // Extract keywords for prompts
    const keywords = extractKeywords(text);
    
    // Generate images for up to 5 keywords/concepts
    const imagePromises = keywords.map(async (keyword, index) => {
      try {
        // Create a descriptive prompt from the keyword
        const prompt = `A high-quality, educational illustration representing: ${keyword}. Clear, simple style suitable for learning content.`;
        
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json"
        });
        
        const imageData = response.data[0].b64_json;
        const timestamp = Date.now();
        const imageName = `image-${timestamp}-${index}.png`;
        const imagePath = path.join(imagesDir, imageName);
        
        // Save the image
        fs.writeFileSync(imagePath, Buffer.from(imageData, 'base64'));
        
        return {
          id: `image-${timestamp}-${index}`,
          url: `/data/images/${imageName}`,
          time: timestamp,
          keyword: keyword
        };
      } catch (error) {
        console.error(`Error generating image for keyword ${keyword}:`, error);
        return null;
      }
    });
    
    // Wait for all image generation to complete
    const generatedImages = (await Promise.all(imagePromises)).filter(img => img !== null);
    
    return NextResponse.json({ 
      success: true, 
      images: generatedImages
    });
  } catch (error) {
    console.error('Error generating images:', error);
    return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 });
  }
}