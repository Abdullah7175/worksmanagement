import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request, { params }) {
    const { id } = params;
    const client = await connectToDatabase();

    try {
        const query = `
            SELECT v.*, wr.request_date, wr.address 
            FROM videos v
            JOIN work_requests wr ON v.work_request_id = wr.id
            WHERE v.work_request_id = $1
            ORDER BY v.created_at DESC
        `;
        const result = await client.query(query, [id]);

        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    } finally {
        client.release && client.release();
    }
}
