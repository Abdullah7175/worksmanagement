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

export async function GET(request, { params }) {
    const { id } = await params;
    const client = await connectToDatabase();
    try {
        const query = 'SELECT * FROM agents WHERE id = $1';
        const result = await client.query(query, [id]);
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }
        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error) {
        console.error('Error fetching agent:', error);
        return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
    } finally {
        client.release && client.release();
    }
}

export async function PUT(req, { params }) {
    const { id } = await params;
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
        const client = await connectToDatabase();
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
        return NextResponse.json({ error: 'Error updating agent' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { id } = await params;
    try {
        const client = await connectToDatabase();
        const query = 'DELETE FROM agents WHERE id = $1 RETURNING *;';
        const { rows: deletedAgent } = await client.query(query, [id]);
        if (deletedAgent.length === 0) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Agent deleted successfully', agent: deletedAgent[0] }, { status: 200 });
    } catch (error) {
        console.error('Error deleting agent:', error);
        return NextResponse.json({ error: 'Error deleting agent' }, { status: 500 });
    }
} 