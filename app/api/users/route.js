import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log("ID", id)

    const client = await connectToDatabase();

    try {
        if (id) {
            const query = 'SELECT * FROM users WHERE id = $1';
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else {
            const query = 'SELECT * FROM users';
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
        const body = await req.json();
        const client = await connectToDatabase();

        const query = `
      INSERT INTO users (name, email, password, contact_number)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const { rows: newUser } = await client.query(query, [
            body.name,
            body.email,
            hashedPassword,
            body.contact,
        ]);

        return NextResponse.json({ message: 'User added successfully', user: newUser[0] }, { status: 201 });

    } catch (error) {
        console.error('Error saving user:', error);
        return NextResponse.json({ error: 'Error saving user' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();

        const { id, name, email, contact, password } = body;

        if (!id || !name || !email || !contact || !password) {
            return NextResponse.json({ error: 'All fields (id, name, email, contact, password) are required' }, { status: 400 });
        }

        const query = `
            UPDATE users 
            SET name = $1, email = $2, contact_number = $3, password = $4 
            WHERE id = $5
            RETURNING *;
        `;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { rows: updatedUser } = await client.query(query, [
            name,
            email,
            contact,
            hashedPassword,
            id
        ]);

        if (updatedUser.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully', user: updatedUser[0] }, { status: 200 });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
    }
}