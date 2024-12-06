import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
// middleware.js
import jwt from 'jsonwebtoken';


const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(req) {
    
    
    // const authHeader = req.headers.get('Authorization');

    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 });
    // }

    // const token = authHeader.split(' ')[1];

    // try {
    //     const decoded = jwt.verify(token, SECRET_KEY);
    //     req.user = decoded; // Attach user details to request
    // } catch (error) {
    //     return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    // }

    return NextResponse.next();
}

export const config={
    matcher: [
        '/login', // Protect all routes under /admin
    ],
        // Protect all routes under /admin
};