// app/api/static/[...path]/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req, { params }) {
  try {
    const { path: filePath } = params;
    const fullPath = path.join(process.cwd(), 'data', ...filePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(fullPath);
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (fullPath.endsWith('.mp3')) {
      contentType = 'audio/mpeg';
    } else if (fullPath.endsWith('.png')) {
      contentType = 'image/png';
    } else if (fullPath.endsWith('.jpg') || fullPath.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (fullPath.endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (fullPath.endsWith('.json')) {
      contentType = 'application/json';
    }
    
    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      }
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return new NextResponse('Error serving file', { status: 500 });
  }
}