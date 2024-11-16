import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const client = await connectToDatabase();

    try {
        if (id) {
            const query = 'SELECT * FROM complaint_types WHERE id = $1';
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Types not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else {
            const query = 'SELECT * FROM complaint_types';
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
      INSERT INTO complaint_types (type_name, description)
      VALUES ($1, $2) RETURNING *;
    `;
        const { rows: newType } = await client.query(query, [
            body.type_name,
            body.description,
        ]);

        return NextResponse.json({ message: 'Type added successfully', type: newType[0] }, { status: 201 });

    } catch (error) {
        console.error('Error saving type:', error);
        return NextResponse.json({ error: 'Error saving type' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();
        const { id, type_name, description } = body;
        console.log(body);
        if (!id || !type_name || !description) {
            return NextResponse.json({ error: 'All fields (type_name, description) are required' }, { status: 400 });
        }

        const query = `
            UPDATE complaint_types
            SET type_name = $1, description = $2
            WHERE id = $3
            RETURNING *;
        `;
        const { rows: updatedType } = await client.query(query, [
            type_name,
            description,
            id


        ]);

        if (updatedType.length === 0) {
            return NextResponse.json({ error: 'Type not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Type updated successfully', type: updatedType[0] }, { status: 200 });

    } catch (error) {
        console.error('Error updating type:', error);
        return NextResponse.json({ error: 'Error updating type' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();

        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Type Id is required' }, { status: 400 });
        }

        const query = `
            DELETE FROM complaint_types
            WHERE id = $1
            RETURNING *;
        `;

        const { rows: deletedType } = await client.query(query, [id]);

        if (deletedType.length === 0) {
            return NextResponse.json({ error: 'Type not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Type deleted successfully', user: deletedType[0] }, { status: 200 });

    } catch (error) {
        console.error('Error deleting type:', error);
        return NextResponse.json({ error: 'Error deleting type' }, { status: 500 });
    }
}
