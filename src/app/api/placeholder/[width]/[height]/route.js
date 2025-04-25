// app/api/placeholder/[width]/[height]/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Extract width and height from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    
    // Make sure we extract the correct parts considering potential leading slashes
    let width, height;
    // Find "placeholder" in the path
    const placeholderIndex = pathParts.findIndex(part => part === 'placeholder');
    if (placeholderIndex >= 0 && placeholderIndex + 2 < pathParts.length) {
      width = pathParts[placeholderIndex + 1];
      height = pathParts[placeholderIndex + 2];
    } else {
      // Fallback to the original approach
      width = pathParts[pathParts.length - 2];
      height = pathParts[pathParts.length - 1];
    }
    
    // Ensure width and height are valid numbers
    width = parseInt(width) || 400;
    height = parseInt(height) || 300;
    
    // Get text from query parameters with sanitization
    let text = url.searchParams.get('text') || 'Image';
    // Sanitize text for SVG (prevent XSS)
    text = text.replace(/[<>&"']/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&apos;';
        default: return c;
      }
    });
    
    // Generate a random color based on text for visual variety
    const getColor = (text) => {
      const colors = ['#007BFF', '#28a745', '#dc3545', '#6610f2', '#fd7e14', '#20c997'];
      const hash = text.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };
    
    // Create a simple SVG image
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${getColor(text)}"/>
        <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">
          ${text}
        </text>
      </svg>
    `;
    
    // Return the SVG image with correct content type
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error generating placeholder image:', error);
    
    // Return a simple error SVG
    const errorSvg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#FF3333"/>
        <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
          Error: ${error.message || 'Unknown error'}
        </text>
      </svg>
    `;
    
    return new NextResponse(errorSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache'
      }
    });
  }
}