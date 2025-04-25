// utils/ffmpeg.js
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Check if ffmpeg is installed
export async function checkFfmpegInstalled() {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    
    ffmpeg.on('error', () => {
      resolve(false);
    });
    
    ffmpeg.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

// Get audio duration
export async function getAudioDuration(audioPath) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      audioPath
    ]);
    
    let output = '';
    
    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ffprobe.stderr.on('data', (data) => {
      console.error(`ffprobe stderr: ${data}`);
    });
    
    ffprobe.on('close', (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim());
        resolve(isNaN(duration) ? 60 : duration); // Default to 60 seconds if parsing fails
      } else {
        reject(new Error(`ffprobe exited with code ${code}`));
      }
    });
    
    ffprobe.on('error', (err) => {
      reject(new Error(`Failed to execute ffprobe: ${err.message}`));
    });
  });
}

// Generate video from images and audio
export async function generateVideoFromImagesAndAudio(options) {
  const {
    imageFiles,
    audioPath,
    outputPath,
    subtitlesPath = null,
    imageDuration = 3,
    fps = 24,
    resolution = '1280x720',
  } = options;

  return new Promise(async (resolve, reject) => {
    // Check if ffmpeg is installed
    const isFfmpegInstalled = await checkFfmpegInstalled();
    if (!isFfmpegInstalled) {
      return reject(new Error('FFmpeg is not installed. Please install FFmpeg to generate videos.'));
    }
    
    // Create a temporary file with the slideshow input
    const slideShowInputPath = path.join(path.dirname(outputPath), 'slideshow-input.txt');
    
    // Calculate appropriate duration for each image based on audio length
    let actualImageDuration = imageDuration;
    try {
      if (audioPath) {
        const audioDuration = await getAudioDuration(audioPath);
        // Distribute images evenly across audio duration
        if (imageFiles.length > 0) {
          actualImageDuration = audioDuration / imageFiles.length;
        }
      }
    } catch (error) {
      console.warn('Error getting audio duration, using default image duration:', error);
    }
    
    // Create input file for ffmpeg concat
    let slideShowContent = '';
    imageFiles.forEach(image => {
      slideShowContent += `file '${image.path.replace(/'/g, "'\\''")}'` + '\n';
      slideShowContent += `duration ${actualImageDuration}` + '\n';
    });
    // Add the last image without duration (required for concat format)
    if (imageFiles.length > 0) {
      slideShowContent += `file '${imageFiles[imageFiles.length - 1].path.replace(/'/g, "'\\''")}'` + '\n';
    }
    
    fs.writeFileSync(slideShowInputPath, slideShowContent);
    
    // Basic ffmpeg arguments
    let ffmpegArgs = [
      '-f', 'concat', 
      '-safe', '0', 
      '-i', slideShowInputPath,
    ];
    
    // Add audio if provided
    if (audioPath) {
      ffmpegArgs = ffmpegArgs.concat(['-i', audioPath]);
    }
    
    // Common encoding settings
    ffmpegArgs = ffmpegArgs.concat([
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-r', fps.toString(),  // Frame rate
      '-vf', `scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2`,
    ]);
    
    // Add audio encoding if we have audio
    if (audioPath) {
      ffmpegArgs = ffmpegArgs.concat([
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
      ]);
    }
    
    // Add subtitles if provided
    if (subtitlesPath) {
      // Add subtitle filter on top of existing vf filter
      const lastVfIndex = ffmpegArgs.indexOf('-vf') + 1;
      ffmpegArgs[lastVfIndex] += `,subtitles=${subtitlesPath.replace(/:/g, '\\:').replace(/'/g, "'\\''")}`;
    }
    
    // Quality preset
    ffmpegArgs = ffmpegArgs.concat([
      '-preset', 'medium',
      '-crf', '23',  // Good quality to filesize ratio
    ]);
    
    // Output file
    ffmpegArgs.push(outputPath);
    
    console.log('FFmpeg command:', 'ffmpeg', ffmpegArgs.join(' '));
    
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);
    
    let stdoutData = '';
    let stderrData = '';
    
    ffmpeg.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    ffmpeg.stderr.on('data', (data) => {
      stderrData += data.toString();
      // Uncomment to see progress
      // process.stdout.write(data);
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        // Clean up the temporary file
        try {
          fs.unlinkSync(slideShowInputPath);
        } catch (error) {
          console.warn('Error removing temporary file:', error);
        }
        resolve();
      } else {
        console.error('FFmpeg stderr:', stderrData);
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    
    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to execute FFmpeg: ${err.message}`));
    });
  });
}

// Generate SRT subtitles
export function generateSRT(text, duration) {
  // Split text into sentences
  // This is a simplified version - better segmentation would be needed for production
  const sentences = text
    .replace(/([.!?])\s*(?=[A-Z])/g, '$1|') // Add a separator for sentences
    .split('|')
    .filter(s => s.trim().length > 0);
  
  const timePerSentence = duration / sentences.length;
  
  let srt = '';
  sentences.forEach((sentence, i) => {
    const startTime = i * timePerSentence;
    const endTime = (i + 1) * timePerSentence;
    
    srt += `${i + 1}\n`;
    srt += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
    srt += `${sentence.trim()}\n\n`;
  });
  
  return srt;
}

// Format time for SRT file (HH:MM:SS,mmm)
function formatSRTTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}