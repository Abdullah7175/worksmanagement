import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.join(process.cwd(), 'public/uploads/agents');
async function ensureUploadDir() {
  await fs.mkdir(uploadDir, { recursive: true });
}
async function saveUploadedFile(file) {
  await ensureUploadDir();
  const buffer = await file.arrayBuffer();
  const uniqueName = `${uuidv4()}${path.extname(file.name)}`;
  const filePath = path.join(uploadDir, uniqueName);
  await fs.writeFile(filePath, Buffer.from(buffer));
  return `/uploads/agents/${uniqueName}`;
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;
    const filter = searchParams.get('filter') || '';
    let client;
    try {
        client = await connectToDatabase();
        if (id) {
            const query = 'SELECT * FROM agents WHERE id = $1';
            const result = await client.query(query, [id]);
            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
            }
            return NextResponse.json(result.rows[0], { status: 200 });
        } else {
            // Get total count for pagination
            let countQuery = 'SELECT COUNT(*) FROM agents';
            let dataQuery = 'SELECT * FROM agents';
            let params = [];
            if (filter) {
                countQuery += ' WHERE name ILIKE $1 OR email ILIKE $1 OR contact_number ILIKE $1';
                dataQuery += ' WHERE name ILIKE $1 OR email ILIKE $1 OR contact_number ILIKE $1';
                dataQuery += ' ORDER BY id DESC LIMIT $2 OFFSET $3';
                params = [`%${filter}%`, limit, offset];
            } else {
                dataQuery += ' ORDER BY id DESC LIMIT $1 OFFSET $2';
                params = [limit, offset];
            }
            const countResult = filter ? await client.query(countQuery, [`%${filter}%`]) : await client.query(countQuery);
            const total = parseInt(countResult.rows[0].count, 10);
            const result = await client.query(dataQuery, params);
            return NextResponse.json({ data: result.rows, total }, { status: 200 });
        }
    } catch (error) {
        console.error('Error fetching agents data:', error);
        return NextResponse.json({ error: 'Failed to fetch data', details: error.message }, { status: 500 });
    } finally {
        if (client && client.release) {
            client.release();
        }
    }
}

export async function POST(req) {
    let client;
    try {
        const formData = await req.formData();
        const name = formData.get('name');
        const designation = formData.get('designation');
        const contact = formData.get('contact');
        const address = formData.get('address');
        const department = formData.get('department');
        const email = formData.get('email');
        const town_id = formData.get('town_id');
        const password = formData.get('password');
        const complaint_type_id = formData.get('complaint_type_id');
        const role = formData.get('role');
        const imageFile = formData.get('image');
        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            imageUrl = await saveUploadedFile(imageFile);
        }
        client = await connectToDatabase();
        if (!password || !town_id || !complaint_type_id || !role) {
            return NextResponse.json({ error: 'Password, town_id, complaint_type_id, and role are required' }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
      INSERT INTO agents (name, designation, contact_number, address, department, email, town_id, complaint_type_id, role, password, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;
    `;
        const { rows: newAgent } = await client.query(query, [
            name,
            designation,
            contact,
            address,
            department,
            email,
            town_id,
            complaint_type_id,
            role,
            hashedPassword,
            imageUrl,
        ]);
        return NextResponse.json({ message: 'Agent added successfully', agent: newAgent[0] }, { status: 201 });
    } catch (error) {
        console.error('Error saving agent:', error);
        return NextResponse.json({ error: 'Error saving agent', details: error.message }, { status: 500 });
    } finally {
        if (client && client.release) {
            client.release();
        }
    }
}

export async function PUT(req) {
    let client;
    try {
        const formData = await req.formData();
        const id = formData.get('id');
        const name = formData.get('name');
        const designation = formData.get('designation');
        const contact = formData.get('contact');
        const address = formData.get('address');
        const department = formData.get('department');
        const email = formData.get('email');
        const town_id = formData.get('town_id');
        const password = formData.get('password');
        const complaint_type_id = formData.get('complaint_type_id');
        const role = formData.get('role');
        const imageFile = formData.get('image');
        let imageUrl = null;
        client = await connectToDatabase();
        // Get current image if exists
        const currentQuery = 'SELECT image FROM agents WHERE id = $1';
        const currentResult = await client.query(currentQuery, [id]);
        imageUrl = currentResult.rows[0]?.image || null;
        if (imageFile && imageFile.size > 0) {
            imageUrl = await saveUploadedFile(imageFile);
        }
        let query, paramsArr;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = `
                UPDATE agents 
                SET name = $1, designation = $2, contact_number = $3, address = $4 , department = $5, email = $6, town_id = $7, complaint_type_id = $8, role = $9, password = $10, image = $11
                WHERE id = $12
                RETURNING *;
            `;
            paramsArr = [name, designation, contact, address, department, email, town_id, complaint_type_id, role, hashedPassword, imageUrl, id];
        } else {
            query = `
                UPDATE agents 
                SET name = $1, designation = $2, contact_number = $3, address = $4 , department = $5, email = $6, town_id = $7, complaint_type_id = $8, role = $9, image = $10
                WHERE id = $11
                RETURNING *;
            `;
            paramsArr = [name, designation, contact, address, department, email, town_id, complaint_type_id, role, imageUrl, id];
        }
        const { rows: updatedAgent } = await client.query(query, paramsArr);
        if (updatedAgent.length === 0) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Agent updated successfully', agent: updatedAgent[0] }, { status: 200 });
    } catch (error) {
        console.error('Error updating agent:', error);
        return NextResponse.json({ error: 'Error updating agent', details: error.message }, { status: 500 });
    } finally {
        if (client && client.release) {
            client.release();
        }
    }
}

export async function DELETE(req) {
    let client;
    try {
        const body = await req.json();
        client = await connectToDatabase();

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
        console.error('Error deleting agent:', error);
        return NextResponse.json({ error: 'Error deleting agent', details: error.message }, { status: 500 });
    } finally {
        if (client && client.release) {
            client.release();
        }
    }
}
