import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const workRequestId = searchParams.get('workRequestId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const offset = (page - 1) * limit;
    const filter = searchParams.get('filter') || '';
    const creatorId = searchParams.get('creator_id');
    const creatorType = searchParams.get('creator_type');
    const client = await connectToDatabase();

    try {
        if (id) {
            const query = `
                SELECT fv.*, wr.request_date, wr.address, ST_AsGeoJSON(fv.geo_tag) as geo_tag
                FROM final_videos fv
                JOIN work_requests wr ON fv.work_request_id = wr.id
                WHERE fv.id = $1
            `;
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Final video not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else if (creatorId && creatorType) {
            const query = `
                SELECT fv.*, wr.request_date, wr.address, ST_AsGeoJSON(fv.geo_tag) as geo_tag
                FROM final_videos fv
                JOIN work_requests wr ON fv.work_request_id = wr.id
                WHERE fv.creator_id = $1 AND fv.creator_type = $2
                ORDER BY fv.created_at DESC
            `;
            const result = await client.query(query, [creatorId, creatorType]);
            return NextResponse.json(result.rows, { status: 200 });
        } else if (workRequestId) {
            const query = `
                SELECT fv.*, wr.request_date, wr.address, ST_AsGeoJSON(fv.geo_tag) as geo_tag
                FROM final_videos fv
                JOIN work_requests wr ON fv.work_request_id = wr.id
                WHERE fv.work_request_id = $1
                ORDER BY fv.created_at DESC
            `;
            const result = await client.query(query, [workRequestId]);
            return NextResponse.json(result.rows, { status: 200 });
        } else if (limit > 0) {
            // Paginated with optional filter
            let countQuery = 'SELECT COUNT(*) FROM final_videos';
            let dataQuery = `SELECT fv.*, wr.request_date, wr.address, ST_AsGeoJSON(fv.geo_tag) as geo_tag FROM final_videos fv JOIN work_requests wr ON fv.work_request_id = wr.id`;
            let params = [];
            if (filter) {
                countQuery += ' WHERE description ILIKE $1 OR CAST(work_request_id AS TEXT) ILIKE $1';
                dataQuery += ' WHERE fv.description ILIKE $1 OR CAST(fv.work_request_id AS TEXT) ILIKE $1';
                params = [`%${filter}%`];
            }
            dataQuery += ' ORDER BY fv.created_at DESC LIMIT $2 OFFSET $3';
            const countResult = filter ? await client.query(countQuery, params) : await client.query(countQuery);
            const total = parseInt(countResult.rows[0].count, 10);
            const dataParams = filter ? [...params, limit, offset] : [limit, offset];
            const result = await client.query(dataQuery, dataParams);
            return NextResponse.json({ data: result.rows, total }, { status: 200 });
        } else {
            const query = `
                SELECT fv.*, wr.request_date, wr.address, ST_AsGeoJSON(fv.geo_tag) as geo_tag
                FROM final_videos fv
                JOIN work_requests wr ON fv.work_request_id = wr.id
                ORDER BY fv.created_at DESC
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
        const latitude = formData.get('latitude');
        const longitude = formData.get('longitude');
        const file = formData.get('videoFile');
        const creatorId = formData.get('creator_id');
        const creatorType = formData.get('creator_type');
        const creatorName = formData.get('creator_name');

        if (!workRequestId || !description || !file || !creatorId || !creatorType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!latitude || !longitude) {
            return NextResponse.json({ error: 'Location coordinates are required' }, { status: 400 });
        }

        // Validate creator type (only social media agents can upload final videos)
        if (creatorType !== 'socialmedia') {
            return NextResponse.json({ 
                error: 'Only social media agents can upload final videos' 
            }, { status: 403 });
        }

        // Save the file
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'final-videos');
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
            INSERT INTO final_videos (work_request_id, description, link, geo_tag, created_at, updated_at, creator_id, creator_type, creator_name)
            VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), NOW(), NOW(), $5, $6, $7)
            RETURNING *;
        `;
        const { rows } = await client.query(query, [
            workRequestId,
            description,
            `/uploads/final-videos/${filename}`,
            geoTag,
            creatorId,
            creatorType,
            creatorName || null
        ]);

        return NextResponse.json({
            message: 'Final video uploaded successfully',
            video: rows[0]
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
            UPDATE final_videos 
            SET work_request_id = $1, 
                description = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING *;
        `; 
        const { rows: updatedVideo } = await client.query(query, [
            workRequestId,
            description,
            id
        ]);

        if (updatedVideo.length === 0) {
            return NextResponse.json({ error: 'Final video not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Final video updated successfully', video: updatedVideo[0] }, { status: 200 });

    } catch (error) {
        console.error('Error updating final video:', error);
        return NextResponse.json({ error: 'Error updating final video' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();

        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Final video ID is required' }, { status: 400 });
        }

        // First get the video to delete the file
        const getQuery = 'SELECT link FROM final_videos WHERE id = $1';
        const { rows: [video] } = await client.query(getQuery, [id]);

        if (!video) {
            return NextResponse.json({ error: 'Final video not found' }, { status: 404 });
        }

        // Delete the file
        if (video.link) {
            try {
                const filePath = path.join(process.cwd(), 'public', video.link);
                await fs.unlink(filePath);
            } catch (fileError) {
                console.error('Error deleting final video file:', fileError);
            }
        }

        // Delete from database
        const deleteQuery = `
            DELETE FROM final_videos 
            WHERE id = $1
            RETURNING *;
        `;

        const { rows: deletedVideo } = await client.query(deleteQuery, [id]);

        return NextResponse.json({ message: 'Final video deleted successfully', video: deletedVideo[0] }, { status: 200 });

    } catch (error) {
        console.error('Error deleting final video:', error);
        return NextResponse.json({ error: 'Error deleting final video' }, { status: 500 });
    }
} 