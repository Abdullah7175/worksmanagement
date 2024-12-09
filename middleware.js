import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Use the jose library for JWT verification
import { cookies } from 'next/headers'; // Use next/headers to access cookies

const SECRET_KEY = process.env.JWT_SECRET;

export async function middleware(request) {
  // Get cookies asynchronously
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get('jwtToken')?.value; // Access the 'value' of the cookie

  // Get token from Authorization header if present
  const authHeader = request.headers.get('Authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // Use the token from cookie or header
  const token = tokenFromCookie || tokenFromHeader;

  console.log("Retrieved Token:", token); // Log token to check its value

  // If no token is present or it's not a string, redirect to /login
  if (!token || typeof token !== 'string') {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the token using jose library
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));

    // Attach the decoded user info to the request object
    // Note: this won't be directly accessible in Next.js middleware (since Next.js doesn't provide direct request mutation like Express)
    request.user = payload;

    // Proceed to the next middleware or route handler
    return NextResponse.next();
  } catch (error) {
    console.error("JWT Error:", error); // Log the specific error for debugging
    return new NextResponse('Invalid or expired token', { status: 401 });
  }
}

export const config = {
  matcher: ['/dashboard'], // Protect these routes with authentication
};
