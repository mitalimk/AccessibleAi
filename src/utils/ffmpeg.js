import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Check if FFmpeg is installed on the system
 */
export function checkFfmpegInstalled() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get the duration of an audio file in seconds
 */
export async function getAudioDuration(audioFilePath) {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFilePath}"`,
      { encoding: 'utf-8' }
    );
    return parseFloat(result.trim());
  } catch (error) {
    console.error('Error getting audio duration:', error);
    throw new Error('Failed to get audio duration');
  }
}

/**
 * Generate a video from images and audio
 */
export async function generateVideoFromImagesAndAudio(
  imagesDir,
  audioFile,
  outputFile,
  frameDuration = 4, // seconds per image
  srtFile = null
) {
  try {
    // Check if ffmpeg is installed
    if (!checkFfmpegInstalled()) {
      throw new Error('FFmpeg is not installed');
    }

    // Get list of image files
    const imageFiles = await fs.readdir(imagesDir);
    const sortedImageFiles = imageFiles
      .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
      .sort();

    if (sortedImageFiles.length === 0) {
      throw new Error('No image files found');
    }

    // Create a temporary file list for ffmpeg
    const tempFilePath = path.join(process.cwd(), 'temp_filelist.txt');
    let fileContent = '';
    
    for (const file of sortedImageFiles) {
      fileContent += `file '${path.join(imagesDir, file)}'\n`;
      fileContent += `duration ${frameDuration}\n`;
    }

    await fs.writeFile(tempFilePath, fileContent);

    // Build FFmpeg command
    let command = `ffmpeg -y -f concat -safe 0 -i "${tempFilePath}" -i "${audioFile}" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest`;
    
    // Add subtitles if provided
    if (srtFile) {
      command += ` -vf subtitles="${srtFile}"`;
    }
    
    command += ` "${outputFile}"`;

    // Execute command
    execSync(command, { stdio: 'inherit' });

    // Clean up temp file
    await fs.unlink(tempFilePath);

    return outputFile;
  } catch (error) {
    console.error('Error generating video:', error);
    throw new Error(`Failed to generate video: ${error.message}`);
  }
}

/**
 * Generate SRT subtitles file
 */
export async function generateSRT(
  transcription,
  outputSrtFile,
  wordTimestamps = false
) {
  try {
    let srtContent = '';
    let index = 1;

    if (wordTimestamps && Array.isArray(transcription)) {
      // Handle word-level timestamps
      for (let i = 0; i < transcription.length; i++) {
        const word = transcription[i];
        const start = formatSrtTime(word.start);
        const end = formatSrtTime(word.end);
        
        srtContent += `${index}\n${start} --> ${end}\n${word.text}\n\n`;
        index++;
      }
    } else if (Array.isArray(transcription)) {
      // Handle segment-level timestamps
      for (let i = 0; i < transcription.length; i++) {
        const segment = transcription[i];
        const start = formatSrtTime(segment.start);
        const end = formatSrtTime(segment.end);
        
        srtContent += `${index}\n${start} --> ${end}\n${segment.text}\n\n`;
        index++;
      }
    } else {
      // Simple case: just create captions with fixed timing
      const lines = transcription.split(/[.!?]+/).filter(Boolean);
      let currentTime = 0;
      
      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;
        
        const start = formatSrtTime(currentTime);
        currentTime += 3; // Assume 3 seconds per sentence
        const end = formatSrtTime(currentTime);
        
        srtContent += `${index}\n${start} --> ${end}\n${cleanLine}.\n\n`;
        index++;
      }
    }

    await fs.writeFile(outputSrtFile, srtContent);
    return outputSrtFile;
  } catch (error) {
    console.error('Error generating SRT:', error);
    throw new Error('Failed to generate subtitles');
  }
}

/**
 * Format seconds to SRT timestamp format (00:00:00,000)
 */
function formatSrtTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}