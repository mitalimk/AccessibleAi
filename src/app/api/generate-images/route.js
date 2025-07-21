import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const imagesDir = path.join(process.cwd(), 'data', 'images');
const simplifiedTextPath = path.join(process.cwd(), 'data', 'simplified-text.json');

// Create more meaningful prompts from text segments
function createImagePrompts(text, count = 4) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  let basePrompts = [];

  if (sentences.length === 0) {
    basePrompts = [
      `A photorealistic image of ${text}. High quality, detailed photograph, professional lighting`
    ];
  } else {
    basePrompts = sentences.map(sentence =>
      `A photorealistic image of ${sentence.trim()}. High quality, detailed photograph, professional lighting`
    );
  }
  // For longer texts, select distributed segments
  const finalPrompts = [];

  for (let i = 0; i < count; i++) {
    finalPrompts.push(basePrompts[i % basePrompts.length]);
  }

  return finalPrompts;
}


export async function POST(req) {
  try {
    // Get the ClipDrop API key from environment variables
    const clipDropApiKey = process.env.CLIP_DROP;
    
    if (!clipDropApiKey) {
      return NextResponse.json({ error: 'ClipDrop API key is missing' }, { status: 500 });
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Extract text and count from the request body
    const requestData = await req.json();
    let { text, count = 4 } = requestData;
    
    // If no text was provided, try to load from the simplified text file
    if (!text || text.trim() === '') {
      if (fs.existsSync(simplifiedTextPath)) {
        try {
          const textData = JSON.parse(fs.readFileSync(simplifiedTextPath, 'utf8'));
          text = textData.text;
        } catch (err) {
          return NextResponse.json({ error: 'Failed to read simplified text file' }, { status: 500 });
        }
      }
      
      if (!text || text.trim() === '') {
        return NextResponse.json({ error: 'No text provided for image generation' }, { status: 400 });
      }
    }
    
    // Ensure count is a number and within reasonable limits
    count = Math.min(Math.max(parseInt(count) || 4, 1), 30);
    
    // Create meaningful prompts from text segments
    const prompts = createImagePrompts(text, count);
    console.log(`Generated ${prompts.length} prompts from text`);
    
    // Generate images using ClipDrop API
    const imagePromises = prompts.map(async (prompt, index) => {
      try {
        const timestamp = Date.now();
        const imageName = `image-${timestamp}-${index}.png`;
        const imagePath = path.join(imagesDir, imageName);
        
        // Use ClipDrop API to generate an image
        const formData = new FormData();
        formData.append('prompt', prompt);
        
        console.log(`Sending request to ClipDrop API for prompt ${index+1}/${prompts.length}`);
        
        const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
          method: 'POST',
          headers: {
            'x-api-key': clipDropApiKey,
          },
          body: formData
        });
        
        if (!response.ok) {
          const responseText = await response.text();
          console.error(`ClipDrop API error: ${response.status} ${response.statusText}`);
          console.error(`Response body: ${responseText}`);
          throw new Error(`ClipDrop API error: ${response.status} ${response.statusText}`);
        }
        
        // Get image data as arrayBuffer
        const imageArrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer);
        
        // Save the image
        fs.writeFileSync(imagePath, imageBuffer);
        console.log(`Successfully saved image ${index+1}/${prompts.length}`);
        
        return {
          id: `image-${timestamp}-${index}`,
          url: `/data/images/${imageName}`,
          time: timestamp,
          prompt: prompt
        };
      } catch (error) {
        console.error(`Error generating image ${index+1}/${prompts.length}:`, error);
        
        // Return a partial result instead of null to prevent the whole batch from failing
        const timestamp = Date.now();
        return {
          id: `image-${timestamp}-${index}`,
          url: null, // Indicate no image was generated
          time: timestamp,
          prompt: prompt,
          error: error.message
        };
      }
    });
    
    // Wait for all image generation to complete
    const generatedImages = await Promise.all(imagePromises);
    const successImages = generatedImages.filter(img => img.url !== null);
    const failedImages = generatedImages.filter(img => img.url === null);
    
    return NextResponse.json({ 
      success: successImages.length > 0,
      images: successImages,
      failedImages: failedImages,
      totalRequested: prompts.length,
      totalSucceeded: successImages.length
    });
  } catch (error) {
    console.error('Error generating images:', error);
    return NextResponse.json({ error: 'Failed to generate images', details: error.message }, { status: 500 });
  }
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