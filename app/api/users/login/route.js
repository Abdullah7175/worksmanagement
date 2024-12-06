import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const body = await req.json(); // Parse request body
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const client = await connectToDatabase();

        // Fetch user by email
        const query = `SELECT * FROM users WHERE email = $1`;
        const result = await client.query(query, [email]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const user = result.rows[0];

        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Generate a session or token (example: simple token generation)
        const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64'); // Replace with JWT or similar

        // Example response
        return NextResponse.json({
            message: 'Login successful',
            token, // Ideally return a JWT token here
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        }, { status: 200 });

    } catch (error) {
        console.error('Error during login:', error);
        return NextResponse.json({ error: 'Error during login' }, { status: 500 });
    }
}
