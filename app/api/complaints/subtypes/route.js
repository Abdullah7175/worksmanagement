import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const client = await connectToDatabase();

    try {
        if (id) {
            const query = 'SELECT * FROM complaint_subtypes WHERE id = $1';
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Subtypes not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else {
            const query = `
            SELECT 
              complaint_subtypes.id,
              complaint_subtypes.subtype_name,
              complaint_subtypes.description,
              complaint_types.id AS complaint_type_id,
              complaint_types.type_name AS complaint_type
            FROM complaint_subtypes
            JOIN complaint_types ON complaint_subtypes.complaint_type_id = complaint_types.id
          `;
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
      INSERT INTO complaint_subtypes (subtype_name,complaint_type_id,description)
      VALUES ($1, $2 ,$3) RETURNING *;
    `;
        const { rows: newSubtype } = await client.query(query, [
            body.subtype_name,
            body.complaint_type_id,
            body.description,
        ]);

        return NextResponse.json({ message: 'Subtype added successfully', type: newSubtype[0] }, { status: 201 });

    } catch (error) {
        console.error('Error saving type:', error);
        return NextResponse.json({ error: 'Error saving subtype' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();
        const { id, subtype_name, complaint_type_id, description } = body;

        if (!id || !subtype_name || !complaint_type_id || !description) {
            return NextResponse.json({ error: 'All fields (subtype_name,complaint_type_id,description) are required' }, { status: 400 });
        }

        const query = `
            UPDATE complaint_subtypes
            SET subtype_name = $1, complaint_type_id = $2, description = $3
            WHERE id = $4
            RETURNING *;
        `;
        const { rows: updatedSubtype } = await client.query(query, [
            subtype_name,
            complaint_type_id,
            description,
            id
        ]);

        if (updatedSubtype.length === 0) {
            return NextResponse.json({ error: 'Subtype not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Subtype updated successfully', type: updatedSubtype[0] }, { status: 200 });

    } catch (error) {
        console.error('Error updating subtype:', error);
        return NextResponse.json({ error: 'Error updating subtype' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();

        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Subtype Id is required' }, { status: 400 });
        }

        const query = `
            DELETE FROM complaint_subtypes
            WHERE id = $1
            RETURNING *;
        `;

        const { rows: deletedSubtype } = await client.query(query, [id]);

        if (deletedSubtype.length === 0) {
            return NextResponse.json({ error: 'Subtype not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Subtype deleted successfully', user: deletedSubtype[0] }, { status: 200 });

    } catch (error) {
        console.error('Error deleting subtype:', error);
        return NextResponse.json({ error: 'Error deleting subtype' }, { status: 500 });
    }
}

