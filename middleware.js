import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Use the jose library for JWT verification
import { cookies } from 'next/headers'; // Use next/headers to access cookies

const SECRET_KEY = process.env.JWT_SECRET;

export async function middleware(request) {
  // Retrieve cookies
  const cookieStore = cookies();
  const tokenFromCookie = await cookieStore.get('jwtToken')?.value; // Access the 'value' of the cookie

  // Retrieve token from Authorization header if present
  const authHeader = request.headers.get('Authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // Use the token from cookie or header
  const token = tokenFromCookie || tokenFromHeader;

  console.log("Retrieved Token:", token); // Log token for debugging

  // If no token is present or it's not a string, handle unauthenticated routes
  if (!token || typeof token !== 'string') {
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.next(); // Allow access to the /login page
    }
    return NextResponse.redirect(new URL('/login', request.url)); // Redirect unauthenticated users
  }

  // Verify the token using jose
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));

    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (payload.exp && payload.exp < currentTime) {
      console.log("Token expired");
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect logged-in users away from /login to /dashboard
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Optionally attach user data to the response (custom header or context handling)
    const response = NextResponse.next();
    response.headers.set('x-user-data', JSON.stringify(payload)); // Pass user data in custom header
    return response;

  } catch (error) {
    console.error("JWT Verification Error:", error); // Log specific errors
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard', '/login'], // Protect /dashboard and handle /login
};
