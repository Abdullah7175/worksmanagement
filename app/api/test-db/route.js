import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
    let client;
    try {
        client = await connectToDatabase();
        
        // Test query to check if database is working
        const result = await client.query('SELECT COUNT(*) as count FROM users');
        
        return NextResponse.json({ 
            success: true, 
            message: 'Database connection successful',
            userCount: result.rows[0].count
        });
    } catch (error) {
        console.error('Database test error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    } finally {
        if (client && client.release) {
            client.release();
        }
    }
} 