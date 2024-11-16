import { Pool } from 'pg';
import { NextResponse } from 'next/server';

require('dotenv').config();

let pool;

const createPool = () => {
    if (!pool) {
        pool = new Pool({
            user: process.env.PG_USER,
            host: process.env.PG_HOST,
            database: process.env.PG_DATABASE,
            password: process.env.PG_PASSWORD,
            port: process.env.PG_PORT || 5432,
            max: process.env.PG_MAX_CONNECTIONS || 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }
    return pool;
};

export const connectToDatabase = async () => {
    const pool = createPool();
    const client = await pool.connect();
    return client;
};

export async function disconnectFromDatabase(client) {
    await client.release();
}
