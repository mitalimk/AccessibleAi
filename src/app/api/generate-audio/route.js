// app/api/generate-audio/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import gTTS from 'gtts';

const audioDir = path.join(process.cwd(), 'public', 'data', 'audio');

export async function POST(req) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    // Generate a unique filename with timestamp
    const timestamp = new Date().getTime();
    const filename = `narration-${timestamp}.mp3`;
    const audioPath = path.join(audioDir, filename);
    
    // Create gTTS instance (Google Text-to-Speech)
    const gtts = new gTTS(text, 'en');
    
    // Save the audio file
    await new Promise((resolve, reject) => {
      gtts.save(audioPath, (err) => {
        if (err) {
          console.error('TTS Error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    // Return the URL to the generated audio file
    return NextResponse.json({ 
      success: true, 
      audioUrl: `/data/audio/${filename}` 
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}