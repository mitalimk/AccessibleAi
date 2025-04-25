// app/api/save-images/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const imagesDir = path.join(process.cwd(), 'data', 'images');

export async function GET() {
  try {
    // Check if the directory exists
    if (!fs.existsSync(imagesDir)) {
      return NextResponse.json({ images: [] }, { status: 200 });
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
      name: file,
      url: `/data/images/${file}`,
      time: fs.statSync(path.join(imagesDir, file)).mtime.getTime()
    })).sort((a, b) => a.time - b.time); // Sort by creation time (oldest first)
    
    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving images:', error);
    return NextResponse.json({ error: 'Failed to retrieve images' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Handle both JSON with base64 images and FormData uploads
    if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
      const { imageBase64, filename = `image-${Date.now()}.png` } = await req.json();
      
      if (!imageBase64) {
        return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
      }
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      
      // Convert base64 to buffer and save
      const imageData = Buffer.from(imageBase64.split(',')[1], 'base64');
      const imagePath = path.join(imagesDir, filename);
      fs.writeFileSync(imagePath, imageData);
      
      return NextResponse.json({ 
        success: true, 
        imageUrl: `/data/images/${filename}` 
      });
    } else {
      const formData = await req.formData();
      const imageFiles = formData.getAll('images');
      
      if (!imageFiles || imageFiles.length === 0) {
        return NextResponse.json({ error: 'No image files provided' }, { status: 400 });
      }
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      
      const savedImages = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        const timestamp = new Date().getTime();
        const filename = `image-${timestamp}-${i}.png`;
        const imagePath = path.join(imagesDir, filename);
        
        // Convert the image file to buffer and save
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        fs.writeFileSync(imagePath, imageBuffer);
        
        savedImages.push({
          name: filename,
          url: `/data/images/${filename}`
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        images: savedImages
      });
    }
  } catch (error) {
    console.error('Error saving images:', error);
    return NextResponse.json({ error: 'Failed to save images' }, { status: 500 });
  }
}