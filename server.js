 const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');  // For image resizing (optional)
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json'); 

 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "flowstate-2ccd4.firebasestorage.app"  // Ensure this is correct
});
 
const db = admin.firestore();  // Initialize Firestore
const storage = admin.storage().bucket();


// Multer setup for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

const generateThumbnail = (inputPath, outputPath, timestamp = 10) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [timestamp], // Extract frame at timestamp (e.g., 10 seconds)
        filename: 'thumbnail.png',
        folder: path.dirname(outputPath),
        size: '320x240', // Resize thumbnail if needed
      })
      .on('end', () => {
        console.log('Thumbnail generation finished.');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Error generating thumbnail:', err);
        reject(err);
      });
  });
};


const generatePreview = (inputPath, startTime, outputPath) => {
  return new Promise((resolve, reject) => {

    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      try {
        fs.mkdirSync(tempDir);
        console.log('Temp directory created successfully');
      } catch (error) {
        console.error('Error creating temp directory:', error);
      }
    }

    ffmpeg(inputPath)
      .seekInput(startTime)  
      .output(outputPath)
      .videoCodec('libx264') // Encode with libx264 codec
      .audioCodec('aac')     // Audio codec set to AAC
      .format('mp4')         // Output format as MP4
      .outputOptions([
        '-c', 'copy',        // Copy streams without re-encoding
        '-bsf:v', 'h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1',
        '-colorspace', '1',
        '-color_trc', '1',
        '-color_primaries', '1'
      ])  
       
      .on('start', commandLine => {
        console.log('FFmpeg command: ', commandLine); // Logs the full FFmpeg command being run
      })
      .on('error', (err, stdout, stderr) => {
        console.error('Error during ffmpeg conversion: ', err);
        console.error('FFmpeg stdout: ', stdout); // Logs all standard output
        console.error('FFmpeg stderr: ', stderr); // Logs all error output
        reject(err);
      })
      .on('end', () => {
        console.log('FFmpeg conversion finished successfully');
        resolve(outputPath);
      })
      .run();
  });
};

// Image upload handler
const uploadImage = async (fileBuffer, filename, postId) => {
  const imageRef = storage.file(`posts/${postId}/${filename}`);
  await imageRef.save(fileBuffer);
  const [url] = await imageRef.getSignedUrl({ action: 'read', expires: '03-01-2030' });
  return url;
};

// Video upload handler
const uploadVideo = async (fileBuffer, filename, postId) => { 
 const videoRef = storage.file(`posts/${postId}/${filename}`);
  await videoRef.save(fileBuffer);
  const [url] = await videoRef.getSignedUrl({ action: 'read', expires: '03-01-2030' });
  return url;
};

require('events').EventEmitter.defaultMaxListeners = 20;

// Function to get the video duration
const getVideoDuration = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, 'temp');
    const tempVideoPath = path.join(__dirname, 'temp', 'tempVideo.mp4');

    
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

    fs.writeFileSync(tempVideoPath, fileBuffer); // Write the buffer to a temporary file

    ffmpeg.ffprobe(tempVideoPath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration; // Duration in seconds
      fs.unlinkSync(tempVideoPath); // Clean up temporary file
      resolve(duration);
    });
  });
};

/**
 * Processes videos: Determines if conversion is needed and uploads accordingly.
 */
const processVideo = async (fileBuffer, filename, postId) => {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const tempVideoPath = path.join(tempDir, filename);
  const convertedVideoPath = path.join(tempDir, `converted-${filename}`);
  const thumbnailPath = path.join(tempDir, `thumbnail-${filename}.png`);

  fs.writeFileSync(tempVideoPath, fileBuffer);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(tempVideoPath, async (err, metadata) => {
      if (err) return reject(err);

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) return reject(new Error("No video stream found."));

      const videoCodec = videoStream.codec_name;
      const audioCodec = metadata.streams.find(s => s.codec_type === 'audio')?.codec_name;
      const format = metadata.format.format_name;
      const pixelFormat = videoStream.pix_fmt;

      console.log(`Video Format: ${format}, Codec: ${videoCodec}, Audio Codec: ${audioCodec}, Pixel Format: ${pixelFormat}`);

      if (!["yuv420p", "yuvj420p"].includes(pixelFormat)) {
        console.warn(`⚠️ Unsupported pixel format detected: ${pixelFormat}. Converting to yuv420p.`);
        outputOptions.push('-pix_fmt yuv420p');
      }

      // Skip conversion if video is already MP4 (H.264 + AAC)
      if (format.includes("mp4") && videoCodec === "h264" && audioCodec === "aac" && pixelFormat === "yuv420p") {
        console.log("✅ Video is already MP4 (H.264 + AAC), skipping conversion.");
        resolve(await uploadVideo(fileBuffer, filename, postId));
      } else {
        // Convert to MP4 (H.264 + AAC)
        ffmpeg(tempVideoPath)
          .output(convertedVideoPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .format('mp4')
          .outputOptions([
            '-pix_fmt yuv420p',
             '-color_range tv'
          ])
          .on('end', async () => {
            console.log("✅ Video conversion completed.");
            const convertedBuffer = fs.readFileSync(convertedVideoPath);
            resolve(await uploadVideo(convertedBuffer, `converted-${filename}`, postId));
            fs.unlinkSync(tempVideoPath);
            fs.unlinkSync(convertedVideoPath);

            
          })
          .on('error', reject)
          .run();
      }
    });
  });
};



// Route for uploading images or videos
app.post('/upload', upload.single('file'), async (req, res) => {

  const tempDir = path.join(__dirname, 'temp');
  const postRef = db.collection('posts').doc(); 
  const postId = postRef.id;
  
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  console.log("Received upload request");
  console.log("Request Headers:", req.headers);
  console.log("Request Body:", req.body);
  console.log("File Received:", req.file);

  if (req.file) {
    console.log("File Received:");
    console.log("- Original name:", req.file.originalname);
    console.log("- Mimetype:", req.file.mimetype);
    console.log("- Size:", req.file.size);
  } else {
    console.log("No file received");
  }

  try {

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;  
    
    const { title, description } = req.body;
    const fileBuffer = req.file.buffer;
    const filename = req.file.originalname;
    const fileType = req.file.mimetype.split('/')[1];

    console.log('User ID:', userId);
    console.log("postRef:",postRef)
   

    // Handle image upload
    if (fileType === "jpeg" || fileType === "jpg") {
      const url = await uploadImage(fileBuffer, filename, postId);
      
      // Save metadata to Firestore
      await postRef.set({
        title,
        description,
        url,
        timestamp: new Date(),
        postId,
        fileType, 
        userId
      });

      return res.json({ success: true, message: 'File uploaded successfully'  });
    }

    // Handle video upload
    if (fileType === "mp4" || fileType === "mpeg") {
      // Check video duration
      const duration = await getVideoDuration(fileBuffer);
      

      let previewUrl = null;
      let url = await processVideo(fileBuffer, filename, postId);


      // If the video is longer than 2 minutes, generate a preview
      if (duration > 120) {
        let thumbnailUrl=null
        // Save the video to Firebase Storage
        

        // Generate a 30-second preview for videos longer than 2 minutes
        const timestamp = Date.now();
        const tempVideoPath = path.join(tempDir, `${timestamp}-${filename}`)
        const tempPreviewPath = path.join(__dirname, 'temp', `preview-${filename}`);
        const thumbnailPath = path.join(__dirname, 'temp', `thumbnail-${filename}.png`);

        // Save video to a temporary file
        await fs.promises.writeFile(tempVideoPath, fileBuffer);

        try{

        // Generate preview
        await generatePreview(tempVideoPath, 10, tempPreviewPath);
        
          // Generate thumbnail at 10 seconds (or any timestamp you prefer)
          await generateThumbnail(tempVideoPath, thumbnailPath, 10);
          
          const thumbnailBuffer = fs.readFileSync(thumbnailPath);
          const thumbnailRef = storage.file(`posts/${postId}/thumbnails/thumbnail-${filename}.png`);
          await thumbnailRef.save(thumbnailBuffer);
          
          const [thumbnailUrlResponse] = await thumbnailRef.getSignedUrl({ action: 'read', expires: '03-01-2030' });
          thumbnailUrl = thumbnailUrlResponse;

        const previewBuffer = fs.readFileSync(tempPreviewPath);
        const previewRef = storage.file(`posts/${postId}/previews/${filename}`);
        await previewRef.save(previewBuffer);

        // Get preview URL
        const [previewUrlResponse] = await previewRef.getSignedUrl({ action: 'read', expires: '03-01-2030' });
        previewUrl = previewUrlResponse;
        } catch (err) {
          console.error("Error processing media files:", err);
        }
        finally{
          fs.unlinkSync(tempVideoPath);
          fs.unlinkSync(tempPreviewPath);
          fs.unlinkSync(thumbnailPath);

        }
 
       
      } else {
        // Directly upload the video if it's 2 minutes or less
        url = await uploadVideo(fileBuffer, filename,postId);
        previewUrl = null;
        thumbnailUrl=null
      }

      // Save video metadata to Firestore
      await postRef.set({
        title,
        description,
        url,
        previewUrl,
        thumbnailUrl,
        timestamp: new Date(),
        fileType,
        userId,
        postId,
      });

      return res.json({ success: true, url, previewUrl });
    }

    return res.status(400).json({ success: false, error: 'Invalid file type' });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

const PORT =  5000;
app.listen(5000, '0.0.0.0', () => console.log('Server running on port 5000'));
 