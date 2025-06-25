// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/db';


// export async function GET(request) {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
//     const client = await connectToDatabase();

//     try {
//         if (id) {
//             const query = 'SELECT * FROM videos WHERE id = $1';
//             const result = await client.query(query, [id]);

//             if (result.rows.length === 0) {
//                 return NextResponse.json({ error: 'Video not found' }, { status: 404 });
//             }

//             return NextResponse.json(result.rows[0], { status: 200 });
//         } else {
//             const query = `'SELECT * FROM videos`;
//             const result = await client.query(query);

//             return NextResponse.json(result.rows, { status: 200 });
//         }
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
//     } finally {
//         client.release && client.release();
//     }
// }

// export async function POST(req) {
//     try {
//         const body = await req.json();
//         const client = await connectToDatabase();

//         const query = `
//       INSERT INTO videos (link)
//       VALUES ($1) RETURNING *;
//     `;
//         const { rows: newVideo } = await client.query(query, [
//          body.link,
//         ]);

//         return NextResponse.json({ message: 'Video added successfully', video: newVideo[0] }, { status: 201 });

//     } catch (error) {
//         console.error('Error saving video:', error);
//         return NextResponse.json({ error: 'Error saving video' }, { status: 500 });
//     }
// }

// export async function PUT(req) {
//     try {
//         const body = await req.json();
//         const client = await connectToDatabase();
//         const {id, link} = body;

//         if (!id || !link ) {
//             return NextResponse.json({ error: 'All fields (id, name) are required' }, { status: 400 });
//         }

//         const query = `
//             UPDATE videos 
//             SET link = $1
//             WHERE id = $2
//             RETURNING *;
//         `; 
//         const { rows: updatedVideo } = await client.query(query, [
//             link,
//             id
//         ]);

//         if (updatedVideo.length === 0) {
//             return NextResponse.json({ error: 'Video not found' }, { status: 404 });
//         }

//         return NextResponse.json({ message: 'Video updated successfully', video: updatedVideo[0] }, { status: 200 });

//     } catch (error) {
//         console.error('Error updating video:', error);
//         return NextResponse.json({ error: 'Error updating video' }, { status: 500 });
//     }
// }

// export async function DELETE(req) {
//     try {
//         const body = await req.json();
//         const client = await connectToDatabase();

//         const { id } = body;

//         if (!id) {
//             return NextResponse.json({ error: 'Video Id is required' }, { status: 400 });
//         }

//         const query = `
//             DELETE FROM videos 
//             WHERE id = $1
//             RETURNING *;
//         `;

//         const { rows: deletedVideo } = await client.query(query, [id]);

//         if (deletedVideo.length === 0) {
//             return NextResponse.json({ error: 'Video not found' }, { status: 404 });
//         }

//         return NextResponse.json({ message: 'Video deleted successfully', user: deletedVideo[0] }, { status: 200 });

//     } catch (error) {
//         console.error('Error deleting video:', error);
//         return NextResponse.json({ error: 'Error deleting video' }, { status: 500 });
//     }
// }

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const workRequestId = searchParams.get('workRequestId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const offset = (page - 1) * limit;
    const filter = searchParams.get('filter') || '';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const creatorId = searchParams.get('creator_id');
    const creatorType = searchParams.get('creator_type');
    const client = await connectToDatabase();

    try {
        if (id) {
            const query = `
                SELECT v.*, wr.request_date, wr.address ,ST_Y(v.geo_tag) as latitude,ST_X(v.geo_tag) as longitude
                FROM videos v
                JOIN work_requests wr ON v.work_request_id = wr.id
                WHERE v.id = $1
            `;
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Video not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else if (creatorId && creatorType) {
            const query = `
                SELECT v.*, wr.request_date, wr.address, ST_Y(v.geo_tag) as latitude, ST_X(v.geo_tag) as longitude
                FROM videos v
                JOIN work_requests wr ON v.work_request_id = wr.id
                WHERE v.creator_id = $1 AND v.creator_type = $2
                ORDER BY v.created_at DESC
            `;
            const result = await client.query(query, [creatorId, creatorType]);
            return NextResponse.json({ data: result.rows, total: result.rows.length }, { status: 200 });
        } else if (workRequestId) {
            const query = `
                SELECT v.*, wr.request_date, wr.address ,ST_Y(v.geo_tag) as latitude,ST_X(v.geo_tag) as longitude
                FROM videos v
                JOIN work_requests wr ON v.work_request_id = wr.id
                WHERE v.work_request_id = $1
                ORDER BY v.created_at DESC
            `;
            const result = await client.query(query, [workRequestId]);
            return NextResponse.json({ data: result.rows, total: result.rows.length }, { status: 200 });
        } else {
            let countQuery = 'SELECT COUNT(*) FROM videos v JOIN work_requests wr ON v.work_request_id = wr.id';
            let dataQuery = `SELECT v.*, wr.request_date, wr.address ,ST_Y(v.geo_tag) as latitude,ST_X(v.geo_tag) as longitude FROM videos v JOIN work_requests wr ON v.work_request_id = wr.id`;
            let whereClauses = [];
            let params = [];
            let paramIdx = 1;
            if (filter) {
                whereClauses.push(`(
                    CAST(v.id AS TEXT) ILIKE $${paramIdx} OR
                    v.description ILIKE $${paramIdx} OR
                    wr.address ILIKE $${paramIdx} OR
                    CAST(v.work_request_id AS TEXT) ILIKE $${paramIdx}
                )`);
                params.push(`%${filter}%`);
                paramIdx++;
            }
            if (dateFrom) {
                whereClauses.push(`v.created_at >= $${paramIdx}`);
                params.push(dateFrom);
                paramIdx++;
            }
            if (dateTo) {
                whereClauses.push(`v.created_at <= $${paramIdx}`);
                params.push(dateTo);
                paramIdx++;
            }
            if (whereClauses.length > 0) {
                countQuery += ' WHERE ' + whereClauses.join(' AND ');
                dataQuery += ' WHERE ' + whereClauses.join(' AND ');
            }
            dataQuery += ' ORDER BY v.created_at DESC';
            if (limit > 0) {
                dataQuery += ` LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
                params.push(limit, offset);
            }
            const countResult = await client.query(countQuery, params.slice(0, params.length - (limit > 0 ? 2 : 0)));
            const total = parseInt(countResult.rows[0].count, 10);
            const result = await client.query(dataQuery, params);
            return NextResponse.json({ data: result.rows, total }, { status: 200 });
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
      INSERT INTO videos (link)
      VALUES ($1) RETURNING *;
    `;
        const { rows: newVideo } = await client.query(query, [
         body.link,
        ]);

        return NextResponse.json({ message: 'Video added successfully', video: newVideo[0] }, { status: 201 });

    } catch (error) {
        console.error('Error saving video:', error);
        return NextResponse.json({ error: 'Error saving video' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();
        const {id, link} = body;

        if (!id || !link ) {
            return NextResponse.json({ error: 'All fields (id, name) are required' }, { status: 400 });
        }

        const query = `
            UPDATE videos 
            SET link = $1
            WHERE id = $2
            RETURNING *;
        `; 
        const { rows: updatedVideo } = await client.query(query, [
            link,
            id
        ]);

        if (updatedVideo.length === 0) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Video updated successfully', video: updatedVideo[0] }, { status: 200 });

    } catch (error) {
        console.error('Error updating video:', error);
        return NextResponse.json({ error: 'Error updating video' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();

        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Video Id is required' }, { status: 400 });
        }

        const query = `
            DELETE FROM videos 
            WHERE id = $1
            RETURNING *;
        `;

        const { rows: deletedVideo } = await client.query(query, [id]);

        if (deletedVideo.length === 0) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Video deleted successfully', user: deletedVideo[0] }, { status: 200 });

    } catch (error) {
        console.error('Error deleting video:', error);
        return NextResponse.json({ error: 'Error deleting video' }, { status: 500 });
    }
}

// Keep POST, PUT, DELETE methods as they are or update them similarly