import NextAuth from "next-auth";
import { connectToDatabase } from '@/lib/db';
import { upload } from '../../lib/multerConfig';
import fs from 'fs';
import path from 'path';

// Create video uploads directory if it doesn't exist
const videoUploadDir = 'C:/Users/DELL/Desktop/uploads/';
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

// Configure the handler
const handler = nextConnect({
  onError: (err, req, res) => {
    res.status(500).json({ error: err.message });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
  },
});

// Use Multer middleware for single video file
handler.use(upload.single('video'));

// Handle POST request
handler.post((req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No video uploaded' });
  }

  const videoPath = path.join('/uploads/videos/', req.file.filename);

  res.status(200).json({
    message: 'Video uploaded successfully',
    videoPath, // Relative path to the uploaded video
  });
});

export default handler;

// Disable body parser (required for file uploads in Next.js)
export const config = {
  api: {
    bodyParser: false,
  },
};