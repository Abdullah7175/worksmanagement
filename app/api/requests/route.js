import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const creator_id = searchParams.get('creator_id');
    const creator_type = searchParams.get('creator_type');
    const assigned_smagent_id = searchParams.get('assigned_smagent_id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const offset = (page - 1) * limit;
    const filter = searchParams.get('filter') || '';
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
                    COALESCE(u.name, ag.name, sm.name) as creator_name,
                    wr.creator_type,
                    a.name as assigned_to_name,
                    s.name as status_name,
                    (
                        SELECT json_agg(json_build_object(
                            'id', rs.id,
                            'sm_agent_id', rs.socialmedia_agent_id,
                            'sm_agent_name', sm_assign.name,
                            'status', rs.status,
                            'created_at', rs.created_at
                        ))
                        FROM request_assign_smagent rs
                        JOIN socialmediaperson sm_assign ON rs.socialmedia_agent_id = sm_assign.id
                        WHERE rs.work_requests_id = wr.id
                    ) as assigned_sm_agents
                FROM work_requests wr
                LEFT JOIN town t ON wr.town_id = t.id
                LEFT JOIN subtown st ON wr.subtown_id = st.id
                LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
                LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
                LEFT JOIN users u ON wr.creator_type = 'user' AND wr.creator_id = u.id
                LEFT JOIN agents ag ON wr.creator_type = 'agent' AND wr.creator_id = ag.id
                LEFT JOIN socialmediaperson sm ON wr.creator_type = 'socialmedia' AND wr.creator_id = sm.id
                LEFT JOIN users a ON wr.assigned_to = a.id
                LEFT JOIN status s ON wr.status_id = s.id
                WHERE wr.id = $1
            `;
            const result = await client.query(query, [numericId]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Request not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else if (limit > 0) {
            // Paginated with optional filter and creator filters
            let countQuery = 'SELECT COUNT(*) FROM work_requests wr';
            let dataQuery = `
                SELECT 
                    wr.id, 
                    wr.request_date, 
                    wr.address,
                    ST_Y(wr.geo_tag) as latitude, 
                    ST_X(wr.geo_tag) as longitude, 
                    t.town as town_name, 
                    ct.type_name as complaint_type, 
                    cst.subtype_name as complaint_subtype, 
                    wr.complaint_subtype_id, 
                    s.name as status_name,
                    s.id as status_id,
                    COALESCE(u.name, ag.name, sm.name) as creator_name,
                    wr.creator_type
                FROM work_requests wr 
                LEFT JOIN town t ON wr.town_id = t.id 
                LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id 
                LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id 
                LEFT JOIN status s ON wr.status_id = s.id 
                LEFT JOIN users u ON wr.creator_type = 'user' AND wr.creator_id = u.id
                LEFT JOIN agents ag ON wr.creator_type = 'agent' AND wr.creator_id = ag.id
                LEFT JOIN socialmediaperson sm ON wr.creator_type = 'socialmedia' AND wr.creator_id = sm.id
            `;
            
            // Add JOIN for assigned social media agents if filtering by assigned_smagent_id
            if (assigned_smagent_id) {
                countQuery += ' JOIN request_assign_smagent ras ON wr.id = ras.work_requests_id';
                dataQuery += ' JOIN request_assign_smagent ras ON wr.id = ras.work_requests_id';
            }
            
            let whereClauses = [];
            let params = [];
            let paramIdx = 1;
            
            if (creator_id && creator_type) {
                whereClauses.push(`wr.creator_id = $${paramIdx} AND wr.creator_type = $${paramIdx + 1}`);
                params.push(creator_id, creator_type);
                paramIdx += 2;
            }
            
            if (assigned_smagent_id) {
                whereClauses.push(`ras.socialmedia_agent_id = $${paramIdx}`);
                params.push(assigned_smagent_id);
                paramIdx += 1;
            }
            
            if (filter) {
                whereClauses.push(`(wr.address ILIKE $${paramIdx} OR u.name ILIKE $${paramIdx} OR ag.name ILIKE $${paramIdx} OR sm.name ILIKE $${paramIdx} OR ct.type_name ILIKE $${paramIdx})`);
                params.push(`%${filter}%`);
                paramIdx += 1;
            }
            
            let dataWhereClauses = [];
            let dataParamIdx = 1;
            let dataParams = [];
            
            if (creator_id && creator_type) {
                dataWhereClauses.push(`wr.creator_id = $${dataParamIdx} AND wr.creator_type = $${dataParamIdx + 1}`);
                dataParams.push(creator_id, creator_type);
                dataParamIdx += 2;
            }
            
            if (assigned_smagent_id) {
                dataWhereClauses.push(`ras.socialmedia_agent_id = $${dataParamIdx}`);
                dataParams.push(assigned_smagent_id);
                dataParamIdx += 1;
            }
            
            if (filter) {
                dataWhereClauses.push(`(wr.address ILIKE $${dataParamIdx} OR u.name ILIKE $${dataParamIdx} OR ag.name ILIKE $${dataParamIdx} OR sm.name ILIKE $${dataParamIdx} OR ct.type_name ILIKE $${dataParamIdx})`);
                dataParams.push(`%${filter}%`);
                dataParamIdx += 1;
            }
            
            if (whereClauses.length > 0) {
                countQuery += ' WHERE ' + whereClauses.join(' AND ');
            }
            if (dataWhereClauses.length > 0) {
                dataQuery += ' WHERE ' + dataWhereClauses.join(' AND ');
            }
            dataQuery += ` ORDER BY wr.request_date DESC LIMIT $${dataParamIdx} OFFSET $${dataParamIdx + 1}`;
            dataParams.push(limit, offset);
            const countResult = await client.query(countQuery, params);
            const total = parseInt(countResult.rows[0].count, 10);
            const result = await client.query(dataQuery, dataParams);
            return NextResponse.json({ data: result.rows, total }, { status: 200 });
        } else {
            const query = `
                SELECT 
                    wr.id,
                    wr.request_date,
                    wr.address,
                    ST_Y(wr.geo_tag) as latitude,
                    ST_X(wr.geo_tag) as longitude,
                    t.town as town_name,
                    ct.type_name as complaint_type,
                    s.name as status_name,
                    s.id as status_id,
                    COALESCE(u.name, ag.name, sm.name) as creator_name,
                    wr.creator_type
                FROM work_requests wr
                LEFT JOIN town t ON wr.town_id = t.id
                LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
                LEFT JOIN status s ON wr.status_id = s.id
                LEFT JOIN users u ON wr.creator_type = 'user' AND wr.creator_id = u.id
                LEFT JOIN agents ag ON wr.creator_type = 'agent' AND wr.creator_id = ag.id
                LEFT JOIN socialmediaperson sm ON wr.creator_type = 'socialmedia' AND wr.creator_id = sm.id
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
        console.log('DEBUG: Received body:', body);
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
            creator_id,
            creator_type // 'user', 'agent', 'socialmedia'
        } = body;

        // Validate required fields
        if (!town_id || !complaint_type_id || !contact_number || !address || !description || !creator_id || !creator_type) {
            return NextResponse.json({
                error: 'Missing required fields',
                details: {
                    town_id, complaint_type_id, contact_number, address, description, creator_id, creator_type
                }
            }, { status: 400 });
        }

        // Validate creator type
        const allowedCreatorTypes = ['user', 'agent', 'socialmedia'];
        if (!allowedCreatorTypes.includes(creator_type)) {
            return NextResponse.json({
                error: 'Invalid creator type. Must be user, agent, or socialmedia',
                received: creator_type
            }, { status: 400 });
        }

        // Validate that the creator_id exists in the correct table
        let validationQuery;
        switch (creator_type) {
            case 'user':
                validationQuery = 'SELECT id FROM users WHERE id = $1';
                break;
            case 'agent':
                validationQuery = 'SELECT id FROM agents WHERE id = $1';
                break;
            case 'socialmedia':
                validationQuery = 'SELECT id FROM socialmediaperson WHERE id = $1';
                break;
        }

        const validationResult = await client.query(validationQuery, [creator_id]);
        if (validationResult.rows.length === 0) {
            return NextResponse.json({
                error: `Invalid ${creator_type} ID`,
                received: creator_id
            }, { status: 400 });
        }

        let geoTag = null;
        if (latitude && longitude) {
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
                creator_id,
                creator_type,
                geo_tag
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ${geoTag ? `$10` : 'NULL'})
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
            creator_id,
            creator_type
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
        return NextResponse.json({ error: 'Failed to submit work request', details: error.message }, { status: 500 });
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

        // Handle social media agent assignments
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