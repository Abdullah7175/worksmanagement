// import { NextResponse } from 'next/server';
// import multer from 'multer';
// import { promises as fs } from 'fs';

// // Configure Multer for file storage
// const upload = multer({
//     storage: multer.diskStorage({
//         destination: 'C:/Users/DELL/Downloads/uploads',
//         filename: (req, file, cb) => {
//             cb(null, `${Date.now()}-${file.originalname}`);
//         },
//     }),
// });

// // Helper function to handle Multer middleware
// const runMiddleware = (req, res, fn) => {
//     return new Promise((resolve, reject) => {
//         fn(req, res, (result) => {
//             if (result instanceof Error) {
//                 return reject(result);
//             }
//             resolve(result);
//         });
//     });
// };

// // Define the POST method for file upload
// export async function POST(req) {
//     try {
//         // Convert the incoming request to form data
//         const formData = await req.formData();

//         // Extract the file from form data
//         const file = formData.get('vid');
//         if (!file) {
//             return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//         }

//         // Save the file to the uploads directory
//         const buffer = await file.arrayBuffer();
//         const filename = `C:/Users/DELL/Downloads/uploads/${Date.now()}-${file.name}`;
//         await fs.writeFile(filename, Buffer.from(buffer));

//         return NextResponse.json({
//             message: 'Video uploaded successfully',
//             path: filename, // Send back the saved file path
//         });
//     } catch (error) {
//         console.error('File upload error:', error);
//         return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
//     }
// }
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
    try {
        const formData = await req.formData();
        
        const workRequestId = formData.get('workRequestId');
        const description = formData.get('description');
        const latitude = formData.get('latitude');
        const longitude = formData.get('longitude');
        const file = formData.get('vid');
        const creatorId = formData.get('creator_id');
        const creatorType = formData.get('creator_type');

        if (!workRequestId || !description || !file) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!latitude || !longitude) {
            return NextResponse.json({ error: 'Location coordinates are required' }, { status: 400 });
        }

        // Save the file
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
        await fs.mkdir(uploadsDir, { recursive: true });
        
        const buffer = await file.arrayBuffer();
        const filename = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, Buffer.from(buffer));

        // Create geo_tag from latitude and longitude
        const geoTag = `SRID=4326;POINT(${longitude} ${latitude})`;

        // Save to database
        const client = await connectToDatabase();
        const query = `
            INSERT INTO videos (work_request_id, description, link, geo_tag, created_at, updated_at, creator_id, creator_type)
            VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), NOW(), NOW(), $5, $6)
            RETURNING *;
        `;
        const { rows } = await client.query(query, [
            workRequestId,
            description,
            `/uploads/videos/${filename}`,
            geoTag,
            creatorId || null,
            creatorType || null
        ]);

        return NextResponse.json({
            message: 'Video uploaded successfully',
            video: rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}