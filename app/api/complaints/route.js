import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const client = await connectToDatabase();

    try {
        if (id) {
            const query = 'SELECT * FROM work WHERE id = $1';
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: ' not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else {
            const query = `
                        SELECT 
                        w.id AS id,
                        w.subject AS subject,
                        w.survey_date AS survey_date,
                        w.status AS status,
                        t.town AS town,
                        a.name AS agent,
                        ct.type_name AS complaint_type,
                        cst.subtype_name AS complaint_subtype
                        FROM main m
                        JOIN work w ON w.id = m.work_id
                        JOIN agents a ON a.id = m.agent_id
                        JOIN town t ON w.town_id = t.id
                        JOIN complaint_types ct ON w.complaint_type_id = ct.id
                        JOIN complaint_subtypes cst ON ct.id = cst.complaint_type_id;
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


// export async function PUT(req) {
//     try {
//         const body = await req.json();
//         const client = await connectToDatabase();
//         const { id,subject, district_id, town_id, site_location, size_of_pipe, 
//             length_of_pipe, allied_items, associated_work, survey_date, 
//             completion_date, geo_tag, assistant_id, status, shoot_date, 
//             complaint_type_id, complaint_subtype_id, expenditure_charge, 
//             before_image, after_image, link } = body;

//         if (!id || !subject || !district_id || !town_id || !site_location || !size_of_pipe || !length_of_pipe || !allied_items || !associated_work||!survey_date || !completion_date || !geo_tag || !assistant_id || !status || !shoot_date || !complaint_type_id || !complaint_subtype_id || !expenditure_charge || !before_image || !after_image || !link) {
//             return NextResponse.json({ error: 'All fields (subject,district_id,town_id,site_location,size_of_pipe,length_of_pipe,allied_items,associated_work,survey_date,completion_date,geo_tag,assistant_id,status,shoot_date,complaint_type_id,complaint_subtype_id,expenditure_charge,before_image,after_image,link) are required' }, { status: 400 });
//         }

//         const query = `
//             UPDATE works
//             SET subject = $1, district_id = $2, town_id = $3,site_location = $4, size_of_pipe = $5, length_of_pipe = $6, allied_items = $7, associated_work = $8,survey_date = $9, completion_date = $10, geo_tag = $11, assistant_id = $12 ,status = $13, shoot_date = $14, complaint_type_id = $15, complaint_subtype_id = $16, expenditure_charge = $17,before_image = $18, after_image = $19, link = $20
//             WHERE id = $21
//             RETURNING *;
//         `;
//         const { rows: updatedWorks } = await client.query(query, [
//             subject,
//             district_id,
//             town_id,
//             site_location,
//             size_of_pipe,
//             length_of_pipe,
//             allied_items,
//             associated_work,
//             survey_date,
//             completion_date,
//             geo_tag,
//             assistant_id,
//             status,
//             shoot_date,
//             complaint_type_id,
//             complaint_subtype_id,
//             expenditure_charge,
//             before_image,
//             after_image,
//             link,
//             id
//         ]);

//         if (updatedWorks.length === 0) {
//             return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
//         }

//         return NextResponse.json({ message: 'Complaint updated successfully', type: updatedWorks[0] }, { status: 200 });

//     } catch (error) {
//         console.error('Error updating complaint:', error);
//         return NextResponse.json({ error: 'Error updating complaint' }, { status: 500 });
//     }
// }
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




export async function DELETE(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();

        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Complaint Id is required' }, { status: 400 });
        }

        const query = `
            DELETE FROM work 
            WHERE id = $1
            RETURNING *;
        `;

        const { rows: deletedComplaint } = await client.query(query, [id]);

        if (deletedComplaint.length === 0) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Complaint deleted successfully', user: deletedComplaint[0] }, { status: 200 });

    } catch (error) {
        console.error('Error deleting complaint:', error);
        return NextResponse.json({ error: 'Error deleting complaint' }, { status: 500 });
    }
}


async function saveWorkDetails(
    client, 
    subject,
    district_id,
    town_id,
    site_location,
    size_of_pipe,
    length_of_pipe,
    allied_items,
    associated_work,
    survey_date,
    completion_date,
    geo_tag,
    before_image,
    after_image,
    assistant_id,
    shoot_date,
    link,
    expenditure_charge,
    complaint_type_id,
    complaint_subtype_id,
    status
) {
    district_id = district_id === '' ? null : district_id;
    town_id = town_id === '' ? null : town_id;
    assistant_id = assistant_id === '' ? null : assistant_id;
    complaint_type_id = complaint_type_id === '' ? null : complaint_type_id;
    complaint_subtype_id = complaint_subtype_id === '' ? null : complaint_subtype_id;
    expenditure_charge = expenditure_charge === '' || expenditure_charge === null ? null : expenditure_charge;
    length_of_pipe = length_of_pipe === '' ? null : Number(length_of_pipe);
    link = link === '' ? null : Number(link);

    const geoArray = geo_tag.split(',');
    let latitude, longitude;

    if (geoArray.length === 2) {
        latitude = parseFloat(geoArray[0].trim());
        longitude = parseFloat(geoArray[1].trim());
    } else {
        console.error('Invalid geo_tag format');
        throw new Error('Invalid geo_tag format');
    }

    const geoPoint = `SRID=4326;POINT(${longitude} ${latitude})`;

    const query = `
        INSERT INTO work (
          subject, district_id, town_id, site_location, size_of_pipe, 
          length_of_pipe, allied_items, associated_work, survey_date, 
          completion_date, geo_tag, before_image, after_image, assistant_id, 
          shoot_date, link, expenditure_charge, complaint_type_id, 
          complaint_subtype_id, status
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING id;
    `;

    try {
        const { rows } = await client.query(query, [
            subject,
            district_id,
            town_id,
            site_location,
            size_of_pipe,
            length_of_pipe,
            allied_items,
            associated_work,
            survey_date,
            completion_date,
            geoPoint,
            before_image,
            after_image,
            assistant_id,
            shoot_date,
            link,
            expenditure_charge,
            complaint_type_id,
            complaint_subtype_id,
            status
        ]);

        return rows[0].id;
    } catch (err) {
        console.error('Error inserting work details:', err);
        throw err;
    }
}

