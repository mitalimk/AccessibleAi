
import { NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import say from 'say';
import util from 'util';

// Promisify the say.export function
const sayExport = util.promisify(say.export);

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { 
      text, 
      voice = 'Microsoft David Desktop', 
      rate = 1, 
      pitch = 1, 
      volume = 1,
      language = 'en-US'
    } = body;
    
    // Validate the request
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const filename = `${uuidv4()}.wav`;
    const outputPath = join(process.cwd(), 'public', 'audio', filename);
    
    // Ensure directory exists
    const fs = require('fs');
    const dir = join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create audio file using say.js
    await sayExport(text, voice, rate, outputPath);
    
    // Return the URL to the audio file
    const audioUrl = `/audio/${filename}`;
    
    return NextResponse.json({
      success: true,
      audioUrl,
      message: 'Text-to-speech conversion successful'
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}

// Optional: Add GET method for health check or documentation
export async function GET() {
  const defaultVoices = [
    'Microsoft David Desktop',
    'Microsoft Zira Desktop',
    'Microsoft Mark Desktop'
  ];
  
  return NextResponse.json({
    status: 'ok',
    message: 'Text-to-speech API is running',
    availableVoices: defaultVoices,
    usage: {
      method: 'POST',
      body: {
        text: 'Text to convert to speech',
        voice: 'Voice name (platform dependent)',
        rate: 'Speech rate (default: 1)',
        pitch: 'Speech pitch (not used in say.js but kept for API consistency)',
        volume: 'Speech volume (not used in say.js but kept for API consistency)',
        language: 'Speech language (default: en-US)'
      }
    }
  });
}