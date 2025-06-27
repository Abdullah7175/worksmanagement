import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function GET(req) {
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.userType) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const client = await connectToDatabase();
    try {
        let where = '', params = [];
        if (session.user.userType === 'user') {
            where = 'user_id = $1';
            params = [session.user.id];
        } else if (session.user.userType === 'agent') {
            where = 'agent_id = $1';
            params = [session.user.id];
        } else if (session.user.userType === 'socialmedia') {
            where = 'socialmedia_id = $1';
            params = [session.user.id];
        } else {
            return NextResponse.json({ data: [] }, { status: 200 });
        }
        const result = await client.query(
            `SELECT * FROM notifications WHERE ${where} AND read = FALSE ORDER BY created_at DESC LIMIT 20`,
            params
        );
        return NextResponse.json({ data: result.rows }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    } finally {
        client.release && client.release();
    }
}

export async function POST(req) {
    // Mark notification as read
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.userType) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await req.json();
    if (!id) {
        return NextResponse.json({ error: 'Notification id required' }, { status: 400 });
    }
    const client = await connectToDatabase();
    try {
        let where = '', params = [];
        if (session.user.userType === 'user') {
            where = 'id = $1 AND user_id = $2';
            params = [id, session.user.id];
        } else if (session.user.userType === 'agent') {
            where = 'id = $1 AND agent_id = $2';
            params = [id, session.user.id];
        } else if (session.user.userType === 'socialmedia') {
            where = 'id = $1 AND socialmedia_id = $2';
            params = [id, session.user.id];
        } else {
            return NextResponse.json({ success: false }, { status: 200 });
        }
        await client.query(`UPDATE notifications SET read = TRUE WHERE ${where}`, params);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
    } finally {
        client.release && client.release();
    }
} 