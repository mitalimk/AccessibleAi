// app/api/save-simplified-text/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the storage file
const dataFilePath = path.join(process.cwd(), 'data', 'simplified-text.json');
const dirPath = path.join(process.cwd(), 'data');

export async function GET() {
  try {
    // Check if the file exists
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ text: "" }, { status: 200 });
    }
    
    // Read the simplified text from the file
    const fileContent = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json({ text: data.text || "" }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving simplified text:', error);
    return NextResponse.json({ error: 'Failed to retrieve simplified text' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { text } = body;
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Save the text
    fs.writeFileSync(dataFilePath, JSON.stringify({ text }));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving simplified text:', error);
    return NextResponse.json({ error: 'Failed to save simplified text' }, { status: 500 });
  }
}