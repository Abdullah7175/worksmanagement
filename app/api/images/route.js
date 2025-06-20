import path from 'path';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const workRequestId = searchParams.get('workRequestId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const offset = (page - 1) * limit;
    const filter = searchParams.get('filter') || '';
    const client = await connectToDatabase();
    const creatorId = searchParams.get('creator_id');
    const creatorType = searchParams.get('creator_type');

    try {
        if (id) {
            const query = `
                SELECT i.*, wr.request_date, wr.address, ST_AsGeoJSON(i.geo_tag) as geo_tag
                FROM images i
                JOIN work_requests wr ON i.work_request_id = wr.id
                WHERE i.id = $1
            `;
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Image not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else if (creatorId && creatorType) {
            const query = `
                SELECT i.*, wr.request_date, wr.address, ST_AsGeoJSON(i.geo_tag) as geo_tag
                FROM images i
                JOIN work_requests wr ON i.work_request_id = wr.id
                WHERE i.creator_id = $1 AND i.creator_type = $2
                ORDER BY i.created_at DESC
            `;
            const result = await client.query(query, [creatorId, creatorType]);
            return NextResponse.json(result.rows, { status: 200 });
        } else if (workRequestId) {
            const query = `
                SELECT i.*, wr.request_date, wr.address, ST_AsGeoJSON(i.geo_tag) as geo_tag
                FROM images i
                JOIN work_requests wr ON i.work_request_id = wr.id
                WHERE i.work_request_id = $1
                ORDER BY i.created_at DESC
            `;
            const result = await client.query(query, [workRequestId]);
            return NextResponse.json(result.rows, { status: 200 });
        } else if (limit > 0) {
            // Paginated with optional filter
            let countQuery = 'SELECT COUNT(*) FROM images';
            let dataQuery = `SELECT i.*, wr.request_date, wr.address, ST_AsGeoJSON(i.geo_tag) as geo_tag FROM images i JOIN work_requests wr ON i.work_request_id = wr.id`;
            let params = [];
            if (filter) {
                countQuery += ' WHERE description ILIKE $1 OR CAST(i.work_request_id AS TEXT) ILIKE $1';
                dataQuery += ' WHERE i.description ILIKE $1 OR CAST(i.work_request_id AS TEXT) ILIKE $1';
                params = [`%${filter}%`];
            }
            dataQuery += ' ORDER BY i.created_at DESC LIMIT $2 OFFSET $3';
            const countResult = filter ? await client.query(countQuery, params) : await client.query(countQuery);
            const total = parseInt(countResult.rows[0].count, 10);
            const dataParams = filter ? [...params, limit, offset] : [limit, offset];
            const result = await client.query(dataQuery, dataParams);
            return NextResponse.json({ data: result.rows, total }, { status: 200 });
        } else {
            const query = `
                SELECT i.*, wr.request_date, wr.address, ST_AsGeoJSON(i.geo_tag) as geo_tag
                FROM images i
                JOIN work_requests wr ON i.work_request_id = wr.id
                ORDER BY i.created_at DESC
            `;
            const result = await client.query(query);
            return NextResponse.json(result.rows, { status: 200 });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    } finally {
        client.release && client.release();
    }
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        
        const workRequestId = formData.get('workRequestId');
        const description = formData.get('description');
        const geoTag = formData.get('geo_tag');
        const file = formData.get('img');
        const creatorId = formData.get('creator_id');
        const creatorType = formData.get('creator_type');

        if (!workRequestId || !description || !file) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Save the file
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');
        await fs.mkdir(uploadsDir, { recursive: true });
        
        const buffer = await file.arrayBuffer();
        const filename = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, Buffer.from(buffer));

        // Save to database
        const client = await connectToDatabase();
        const query = `
            INSERT INTO images (work_request_id, description, link, geo_tag, created_at, updated_at, creator_id, creator_type)
            VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), NOW(), NOW(), $5, $6)
            RETURNING *;
        `;
        const { rows } = await client.query(query, [
            workRequestId,
            description,
            `/uploads/images/${filename}`,
            geoTag || null,
            creatorId || null,
            creatorType || null
        ]);

        return NextResponse.json({
            message: 'Image uploaded successfully',
            image: rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();
        const {id, workRequestId, description} = body;

        if (!id || !workRequestId || !description) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const query = `
            UPDATE images 
            SET work_request_id = $1, 
                description = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING *;
        `; 
        const { rows: updatedImage } = await client.query(query, [
            workRequestId,
            description,
            id
        ]);

        if (updatedImage.length === 0) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Image updated successfully', image: updatedImage[0] }, { status: 200 });

    } catch (error) {
        console.error('Error updating image:', error);
        return NextResponse.json({ error: 'Error updating image' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();

        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Image Id is required' }, { status: 400 });
        }

        // First get the image to delete the file
        const getQuery = 'SELECT link FROM images WHERE id = $1';
        const { rows: [image] } = await client.query(getQuery, [id]);

        if (!image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // Delete the file
        if (image.link) {
            try {
                const filePath = path.join(process.cwd(), 'public', image.link);
                await fs.unlink(filePath);
            } catch (fileError) {
                console.error('Error deleting image file:', fileError);
            }
        }

        // Delete from database
        const deleteQuery = `
            DELETE FROM images 
            WHERE id = $1
            RETURNING *;
        `;

        const { rows: deletedImage } = await client.query(deleteQuery, [id]);

        return NextResponse.json({ message: 'Image deleted successfully', image: deletedImage[0] }, { status: 200 });

    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json({ error: 'Error deleting image' }, { status: 500 });
    }
}