import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
    const client = await connectToDatabase();

    try {
        const query = `
            SELECT id, request_date, address 
            FROM work_requests
            ORDER BY request_date DESC
            LIMIT 100
        `;
        const result = await client.query(query);

        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching work requests:', error);
        return NextResponse.json({ error: 'Failed to fetch work requests' }, { status: 500 });
    } finally {
        client.release && client.release();
    }
}