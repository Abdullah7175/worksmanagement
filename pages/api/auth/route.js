
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
require('dotenv').config();

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const client = await connectToDatabase();

    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows: user } = await client.query(query, [username]);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user[0].password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user[0];

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
