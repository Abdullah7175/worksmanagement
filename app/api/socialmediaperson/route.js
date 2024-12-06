import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const client = await connectToDatabase();

    try {
        if (id) {
            const query = 'SELECT * FROM socialmediaperson WHERE id = $1';
            const result = await client.query(query, [id]);
            
            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Videographer not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else {
            const query = 'SELECT * FROM socialmediaperson';
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
      INSERT INTO socialmediaperson (name, email, contact_number, address)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
        const { rows: newAgent } = await client.query(query, [
            body.name,
            body.email,
            body.contact,
            body.address,
        ]);

        return NextResponse.json({ message: 'Videographer added successfully', agent: newAgent[0] }, { status: 201 });

    } catch (error) {
        console.error('Error saving Videographer:', error);
        return NextResponse.json({ error: 'Error saving Videographer' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();
        const {id, name,email, contact, address} = body;

        if (!id || !name || !email || !contact || !address) {
            return NextResponse.json({ error: 'All fields (id, name, email, contact, address) are required' }, { status: 400 });
        }

        const query = `
            UPDATE socialmediaperson 
            SET name = $1, email = $2, contact_number = $3, address = $4
            WHERE id = $5
            RETURNING *;
        `; 
        const { rows: updatedSocialagent } = await client.query(query, [
            name,
            email,
            contact,
            address,
            id
        ]);

        if (updatedSocialagent.length === 0) {
            return NextResponse.json({ error: 'Videographer not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Videographer updated successfully', agent: updatedSocialagent[0] }, { status: 200 });

    } catch (error) {
        console.error('Error updating Videographer:', error);
        return NextResponse.json({ error: 'Error updating Videographer' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();

        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Videographer Id is required' }, { status: 400 });
        }

        const query = `
            DELETE FROM socialmediaperson 
            WHERE id = $1
            RETURNING *;
        `;

        const { rows: deletedSocialagent } = await client.query(query, [id]);

        if (deletedSocialagent.length === 0) {
            return NextResponse.json({ error: 'Videographer not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Videographer deleted successfully', user: deletedSocialagent[0] }, { status: 200 });

    } catch (error) {
        console.error('Error deleting Videographer:', error);
        return NextResponse.json({ error: 'Error deleting Videographer' }, { status: 500 });
    }
}
