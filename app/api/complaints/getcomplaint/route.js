
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const client = await connectToDatabase();

    try {
        if (id) {
            console.log(id)
            console.log("here" ,id)
            const query = 'SELECT * FROM work WHERE id = $1';
            const result = await client.query(query, [id]);
            console.log(result)
            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Types not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else {
            const query = 'SELECT * FROM work';
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
    const client = await connectToDatabase();

    try {
        const body = await req.json();
        const { 
            subject, district_id, town_id, site_location, size_of_pipe, 
            length_of_pipe, allied_items, associated_work, survey_date, 
            completion_date, geo_tag, assistant_id, status, shoot_date, 
            complaint_type_id, complaint_subtype_id, expenditure_charge, 
            before_image, after_image, link
        } = body;

        await client.query('BEGIN'); 

        const workData = await saveWorkDetails(
            client, subject, district_id, town_id, site_location, 
            size_of_pipe, length_of_pipe, allied_items, associated_work, 
            survey_date, completion_date, geo_tag, before_image, 
            after_image, assistant_id, shoot_date, link, expenditure_charge, 
            complaint_type_id, complaint_subtype_id, status
        );


        await client.query('COMMIT');
        return NextResponse.json({ message: 'Work and related data saved successfully', id: workData }, { status: 200 });

    } catch (error) {
        console.error('Error saving complaint:', error);
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Error saving complaint' }, { status: 500 });
    } finally {
        client.release();
    }
}
export async function PUT(req) {
    const client = await connectToDatabase();
    const query = `
        UPDATE works
        SET subject = $1, district_id = $2, town_id = $3, site_location = $4, size_of_pipe = $5, 
            length_of_pipe = $6, allied_items = $7, associated_work = $8, survey_date = $9, 
            completion_date = $10, geo_tag = $11, assistant_id = $12, status = $13, shoot_date = $14, 
            complaint_type_id = $15, complaint_subtype_id = $16, expenditure_charge = $17, 
            before_image = $18, after_image = $19, link = $20
        WHERE id = $21
        RETURNING *;
    `;
  
    try {
        // Parse request body
        const body = await req.json();
        const { id, subject, district_id, town_id, site_location, size_of_pipe, length_of_pipe, 
                allied_items, associated_work, survey_date, completion_date, geo_tag, assistant_id, 
                status, shoot_date, complaint_type_id, complaint_subtype_id, expenditure_charge, 
                before_image, after_image, link } = body;

        // Validation check for required fields
        if (!id || !subject || !district_id || !town_id || !site_location || !size_of_pipe || 
            !length_of_pipe || !allied_items || !associated_work || !survey_date || !completion_date || 
            !geo_tag || !assistant_id || !status || !shoot_date || !complaint_type_id || 
            !complaint_subtype_id || !expenditure_charge || !before_image || !after_image || !link) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }
        await client.query('BEGIN');
        const { rows: updatedWorks } = await client.query(query, [
            subject, district_id, town_id, site_location, size_of_pipe, length_of_pipe, 
            allied_items, associated_work, survey_date, completion_date, geo_tag, assistant_id, 
            status, shoot_date, complaint_type_id, complaint_subtype_id, expenditure_charge, 
            before_image, after_image, link, id
        ]);

        if (updatedWorks.length === 0) {
           
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

    
        await client.query('COMMIT');
        
        return NextResponse.json({ message: 'Complaint updated successfully', type: updatedWorks[0] }, { status: 200 });

    } catch (error) {
        console.error('Error updating complaint:', error);

        
        await client.query('ROLLBACK');
        
        return NextResponse.json({ error: 'Error updating complaint' }, { status: 500 });
    } finally {
        
        client.release();
    }
}
