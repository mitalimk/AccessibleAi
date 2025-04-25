// app/api/generate-video/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const ffmpegStatic = require('ffmpeg-static');

// Directory paths
const dataDir = path.join(process.cwd(), 'data');
const videosDir = path.join(dataDir, 'videos');
const imagesDir = path.join(dataDir, 'images');
const audioDir = path.join(dataDir, 'audio');
const tempDir = path.join(dataDir, 'temp');
const simplifiedTextPath = path.join(dataDir, 'simplified-text.json');

// Ensure all required directories exist
function ensureDirectoriesExist() {
  [dataDir, videosDir, imagesDir, audioDir, tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Get audio duration using ffprobe
async function getAudioDuration(audioPath) {
  try {
    const { stdout } = await execPromise(`"${ffmpegStatic.replace('ffmpeg', 'ffprobe')}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`);
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return 60; // Default to 60 seconds if we can't determine
  }
}

// Generate subtitle file (SRT format)
async function generateSubtitles(text, audioDuration) {
  // Split text into sentences (simple approach)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const subtitlePath = path.join(tempDir, 'subtitles.srt');
  
  // Calculate time per sentence
  const timePerSentence = audioDuration / sentences.length;
  
  let subtitleContent = '';
  sentences.forEach((sentence, index) => {
    const startSeconds = index * timePerSentence;
    const endSeconds = (index + 1) * timePerSentence;
    
    // Format time as HH:MM:SS,mmm
    const startTime = formatSrtTime(startSeconds);
    const endTime = formatSrtTime(endSeconds);
    
    subtitleContent += `${index + 1}\n${startTime} --> ${endTime}\n${sentence.trim()}\n\n`;
  });
  
  fs.writeFileSync(subtitlePath, subtitleContent);
  return subtitlePath;
}

// Format time for SRT file (HH:MM:SS,mmm)
function formatSrtTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

export async function GET() {
  try {
    ensureDirectoriesExist();
    
    // Check if videos directory exists
    if (!fs.existsSync(videosDir)) {
      return NextResponse.json({ videos: [] }, { status: 200 });
    }
    
    // Get all video files
    const files = fs.readdirSync(videosDir);
    const videoFiles = files.filter(file => 
      file.endsWith('.mp4') || 
      file.endsWith('.webm') || 
      file.endsWith('.mov')
    );
    
    const videos = videoFiles.map(file => ({
      name: file,
      url: `/data/videos/${file}`,
      time: fs.statSync(path.join(videosDir, file)).mtime.getTime()
    })).sort((a, b) => b.time - a.time); // Sort by creation time (newest first)
    
    return NextResponse.json({ videos }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving videos:', error);
    return NextResponse.json({ error: 'Failed to retrieve videos' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    ensureDirectoriesExist();
    
    const { showSubtitles = false } = await req.json();
    
    // Get simplified text
    if (!fs.existsSync(simplifiedTextPath)) {
      return NextResponse.json({ error: 'No simplified text available' }, { status: 400 });
    }
    const textData = JSON.parse(fs.readFileSync(simplifiedTextPath, 'utf8'));
    const text = textData.text;
    
    if (!text) {
      return NextResponse.json({ error: 'No simplified text content found' }, { status: 400 });
    }
    
    // Get audio files
    const audioFiles = fs.readdirSync(audioDir).filter(file => 
      file.endsWith('.mp3') || file.endsWith('.wav')
    );
    
    if (audioFiles.length === 0) {
      return NextResponse.json({ error: 'No audio file available' }, { status: 400 });
    }
    
    // Get the most recent audio file
    const audioFile = audioFiles
      .map(file => ({
        name: file,
        path: path.join(audioDir, file),
        time: fs.statSync(path.join(audioDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time)[0];
    
    // Get images
    const imageFiles = fs.readdirSync(imagesDir).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.jpeg') || 
      file.endsWith('.png') || file.endsWith('.gif')
    );
    
    if (imageFiles.length === 0) {
      return NextResponse.json({ error: 'No images available' }, { status: 400 });
    }
    
    // Create video file name
    const timestamp = Date.now();
    const videoName = `video-${timestamp}.mp4`;
    const videoPath = path.join(videosDir, videoName);
    
    // Get audio duration
    const audioDuration = await getAudioDuration(audioFile.path);
    
    // Create a temporary file with FFmpeg commands for image slideshow
    const ffmpegInputsFile = path.join(tempDir, 'inputs.txt');
    const ffmpegCommands = [];
    
    // Calculate how many images to use and duration for each
    const imagesToUse = Math.min(imageFiles.length, 10); // Limit to 10 images max
    const imageDuration = audioDuration / imagesToUse;
    
    // Add each image as an input with the calculated duration
    for (let i = 0; i < imagesToUse; i++) {
      ffmpegCommands.push(`file '${path.join(imagesDir, imageFiles[i])}'`);
      ffmpegCommands.push(`duration ${imageDuration}`);
    }
    
    // Add the last image without duration (required by FFmpeg concat demuxer)
    ffmpegCommands.push(`file '${path.join(imagesDir, imageFiles[imagesToUse - 1])}'`);
    
    fs.writeFileSync(ffmpegInputsFile, ffmpegCommands.join('\n'));
    
    // Setup FFmpeg command
    let ffmpegCommand = `"${ffmpegStatic}" -y -f concat -safe 0 -i "${ffmpegInputsFile}" -i "${audioFile.path}"`;
    
    // Add subtitles if requested
    if (showSubtitles) {
      const subtitlePath = await generateSubtitles(text, audioDuration);
      ffmpegCommand += ` -vf subtitles="${subtitlePath.replace(/\\/g, '\\\\')}"`;
    }
    
    // Finalize the command with output settings
    ffmpegCommand += ` -c:v libx264 -pix_fmt yuv420p -r 30 -c:a aac -shortest "${videoPath}"`;
    
    console.log('Executing FFmpeg command:', ffmpegCommand);
    
    // Execute FFmpeg command
    await execPromise(ffmpegCommand);
    
    // Clean up temporary files
    if (fs.existsSync(ffmpegInputsFile)) {
      fs.unlinkSync(ffmpegInputsFile);
    }
    
    // Return success with video URL
    return NextResponse.json({ 
      success: true, 
      videoUrl: `/data/videos/${videoName}`
    });
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json({ error: 'Failed to generate video: ' + error.message }, { status: 500 });
  }
}