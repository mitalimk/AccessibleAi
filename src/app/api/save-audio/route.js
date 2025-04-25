// app/api/save-audio/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const audioDir = path.join(process.cwd(), 'data', 'audio');

export async function GET() {
  try {
    // Check if the directory exists
    if (!fs.existsSync(audioDir)) {
      return NextResponse.json({ audioUrl: null }, { status: 200 });
    }
    
    // Get the most recent audio file
    const files = fs.readdirSync(audioDir);
    if (files.length === 0) {
      return NextResponse.json({ audioUrl: null }, { status: 200 });
    }
    
    // Sort files by creation time (newest first)
    const sortedFiles = files
      .filter(file => file.endsWith('.mp3'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(audioDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    if (sortedFiles.length === 0) {
      return NextResponse.json({ audioUrl: null }, { status: 200 });
    }
    
    const audioUrl = `/data/audio/${sortedFiles[0].name}`;
    return NextResponse.json({ audioUrl }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving audio:', error);
    return NextResponse.json({ error: 'Failed to retrieve audio' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Ensure we're handling FormData for audio files
    if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
      const { audioBase64, filename = 'narration.mp3' } = await req.json();
      
      if (!audioBase64) {
        return NextResponse.json({ error: 'No audio data provided' }, { status: 400 });
      }
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      
      // Convert base64 to buffer and save
      const audioData = Buffer.from(audioBase64.split(',')[1], 'base64');
      const audioPath = path.join(audioDir, filename);
      fs.writeFileSync(audioPath, audioData);
      
      return NextResponse.json({ 
        success: true, 
        audioUrl: `/data/audio/${filename}` 
      });
    } else {
      const formData = await req.formData();
      const audioFile = formData.get('audio');
      
      if (!audioFile) {
        return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
      }
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      
      // Generate a unique filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `narration-${timestamp}.mp3`;
      const audioPath = path.join(audioDir, filename);
      
      // Convert the audio file to buffer and save
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      fs.writeFileSync(audioPath, audioBuffer);
      
      return NextResponse.json({ 
        success: true, 
        audioUrl: `/data/audio/${filename}` 
      });
    }
  } catch (error) {
    console.error('Error saving audio:', error);
    return NextResponse.json({ error: 'Failed to save audio' }, { status: 500 });
  }
}