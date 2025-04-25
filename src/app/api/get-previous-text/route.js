// app/api/get-previous-text/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the storage file
    const dataFilePath = path.join(process.cwd(), 'data', 'simplified-text.json');
    
    // Check if the file exists
    if (!fs.existsSync(dataFilePath)) {
      // Create directory if it doesn't exist
      const dirPath = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Create an empty file
      fs.writeFileSync(dataFilePath, JSON.stringify({ text: '' }));
      return NextResponse.json({ text: '' });
    }
    
    // Read the file
    const fileContent = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error('Error fetching previous text:', error);
    return NextResponse.json({ error: 'Failed to fetch previous text' }, { status: 500 });
  }
}