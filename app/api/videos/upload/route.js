import multer from 'multer';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';

// Configure Multer to store files in a specific directory
const upload = multer({
  storage: multer.diskStorage({
    destination: 'C:/Users/DELL/Downloads/uploads',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

const uploadMiddleware = upload.single('vid');

// Helper to convert Multer middleware into a promise
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });
};

export async function POST(req) {
  try {
    const formData = await req.formData();

    // Extract file from formData
    const file = formData.get('vid');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Save the file manually
    const buffer = await file.arrayBuffer();
    const filename = `C:/Users/DELL/Downloads/uploads/${Date.now()}-${file.name}`;
    await fs.writeFile(filename, Buffer.from(buffer));

    return NextResponse.json({
      message: 'Video uploaded successfully',
      filename,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
