import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id && !Number.isInteger(Number(id))) {
        return NextResponse.json(
            { error: 'Invalid request ID format' },
            { status: 400 }
        );
    }

    const client = await connectToDatabase();

    try {
        if (id) {
            const numericId = Number(id);
            const query = `
                SELECT 
                    wr.*,
                    ST_Y(wr.geo_tag) as latitude,
                    ST_X(wr.geo_tag) as longitude,
                    t.town as town_name,
                    st.subtown as subtown_name,
                    ct.type_name as complaint_type,
                    cst.subtype_name as complaint_subtype,
                    u.name as applicant_name,
                    a.name as assigned_to_name,
                    s.name as status_name,
                    (
                        SELECT json_agg(json_build_object(
                            'id', ra.id,
                            'agent_id', ra.agent_id,
                            'agent_name', ag.name,
                            'status', ra.status,
                            'created_at', ra.created_at
                        ))
                        FROM request_assign_agent ra
                        JOIN agents ag ON ra.agent_id = ag.id
                        WHERE ra.work_requests_id = wr.id
                    ) as assigned_agents,
                    (
                        SELECT json_agg(json_build_object(
                            'id', rs.id,
                            'sm_agent_id', rs.socialmedia_agent_id,
                            'sm_agent_name', sm.name,
                            'status', rs.status,
                            'created_at', rs.created_at
                        ))
                        FROM request_assign_smagent rs
                        JOIN socialmediaperson sm ON rs.socialmedia_agent_id = sm.id
                        WHERE rs.work_requests_id = wr.id
                    ) as assigned_sm_agents
                FROM work_requests wr
                LEFT JOIN town t ON wr.town_id = t.id
                LEFT JOIN subtown st ON wr.subtown_id = st.id
                LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
                LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
                LEFT JOIN users u ON wr.applicant_id = u.id
                LEFT JOIN users a ON wr.assigned_to = a.id
                LEFT JOIN status s ON wr.status_id = s.id
                WHERE wr.id = $1
            `;
            const result = await client.query(query, [numericId]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Request not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else {
            const query = `
                SELECT 
                    wr.id,
                    wr.request_date,
                    ST_Y(wr.geo_tag) as latitude,
                    ST_X(wr.geo_tag) as longitude,
                    t.town as town_name,
                    ct.type_name as complaint_type,
                    s.name as status_name,
                    u.name as applicant_name
                FROM work_requests wr
                LEFT JOIN town t ON wr.town_id = t.id
                LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
                LEFT JOIN status s ON wr.status_id = s.id
                LEFT JOIN users u ON wr.applicant_id = u.id
                ORDER BY wr.request_date DESC
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
            town_id,
            subtown_id,
            complaint_type_id,
            complaint_subtype_id,
            contact_number,
            address,
            description,
            latitude,
            longitude,
            applicant_id
        } = body;

        let geoTag = null;
        if (latitude && longitude) {
            // geoTag = `POINT(${longitude} ${latitude})`;
            geoTag = `SRID=4326;POINT(${longitude} ${latitude})`;
        }

        const query = `
            INSERT INTO work_requests (
                town_id,
                subtown_id,
                complaint_type_id,
                complaint_subtype_id,
                contact_number,
                address,
                description,
                applicant_id,
                geo_tag
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ${geoTag ? `$9` : 'NULL'})
            RETURNING id;
        `;

        const params = [
            town_id,
            subtown_id,
            complaint_type_id,
            complaint_subtype_id,
            contact_number,
            address,
            description,
            applicant_id
        ];

        if (geoTag) {
            params.push(geoTag);
        }

        const result = await client.query(query, params);

        return NextResponse.json({ 
            message: 'Work request submitted successfully', 
            id: result.rows[0].id 
        }, { status: 200 });

    } catch (error) {
        console.error('Error submitting work request:', error);
        return NextResponse.json({ error: 'Failed to submit work request' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(req) {
    const client = await connectToDatabase();

    try {
        const body = await req.json();
        const { 
            id,
            assigned_to,
            status_id,
            assigned_agents,
            assigned_sm_agents
        } = body;

        await client.query('BEGIN');

        const updateQuery = `
            UPDATE work_requests
            SET 
                assigned_to = $1,
                status_id = $2
            WHERE id = $3
            RETURNING *;
        `;

        const updateResult = await client.query(updateQuery, [
            assigned_to,
            status_id,
            id
        ]);

        if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (assigned_agents && assigned_agents.length > 0) {
            await client.query('DELETE FROM request_assign_agent WHERE work_requests_id = $1', [id]);
            for (const agent of assigned_agents) {
                await client.query(
                    'INSERT INTO request_assign_agent (work_requests_id, agent_id, status) VALUES ($1, $2, $3)',
                    [id, agent.agent_id, agent.status || 1]
                );
            }
        }

        if (assigned_sm_agents && assigned_sm_agents.length > 0) {
            await client.query('DELETE FROM request_assign_smagent WHERE work_requests_id = $1', [id]);
            for (const smAgent of assigned_sm_agents) {
                await client.query(
                    'INSERT INTO request_assign_smagent (work_requests_id, socialmedia_agent_id, status) VALUES ($1, $2, $3)',
                    [id, smAgent.sm_agent_id, smAgent.status || 1]
                );
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({ 
            message: 'Work request updated successfully', 
            request: updateResult.rows[0] 
        }, { status: 200 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating work request:', error);
        return NextResponse.json({ error: 'Failed to update work request' }, { status: 500 });
    } finally {
        client.release();
    }
}