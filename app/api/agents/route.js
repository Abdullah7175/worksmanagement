import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log("ID", id)

    const client = await connectToDatabase();

    try {
        if (id) {
            const query = 'SELECT * FROM agents WHERE id = $1';
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Agents not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else {
            const query = 'SELECT * FROM agents';
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
      INSERT INTO agents (name, designation, contact_number, address, department, email)
      VALUES ($1, $2, $3, $4 ,$5 ,$6) RETURNING *;
    `;
        const { rows: newAgent } = await client.query(query, [
            body.name,
            body.designation,
            body.contact,
            body.address,
            body.department,
            body.email,

        ]);

        return NextResponse.json({ message: 'Agent added successfully', agent: newAgent[0] }, { status: 201 });

    } catch (error) {
        console.error('Error saving user:', error);
        return NextResponse.json({ error: 'Error saving user' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();
        const {id, name, designation, contact, address, department, email} = body;

        if (!id || !name || !designation || !contact || !address || !department ||  !email) {
            return NextResponse.json({ error: 'All fields (id, name, designation, contact, address, department, email) are required' }, { status: 400 });
        }

        const query = `
            UPDATE agents 
            SET name = $1, designation = $2, contact_number = $3, address = $4 , department = $5, email = $6
            WHERE id = $7
            RETURNING *;
        `; 
        const { rows: updatedAgent } = await client.query(query, [
            name,
            designation,
            contact,
            address,
            department,
            email,
            id
        ]);

        if (updatedAgent.length === 0) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Agent updated successfully', agent: updatedAgent[0] }, { status: 200 });

    } catch (error) {
        console.error('Error updating agent:', error);
        return NextResponse.json({ error: 'Error updating agent' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();

        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Agent Id is required' }, { status: 400 });
        }

        const query = `
            DELETE FROM agents 
            WHERE id = $1
            RETURNING *;
        `;

        const { rows: deletedAgent } = await client.query(query, [id]);

        if (deletedAgent.length === 0) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Agent deleted successfully', user: deletedAgent[0] }, { status: 200 });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
    }
}
