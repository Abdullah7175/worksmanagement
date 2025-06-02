// import { NextResponse } from 'next/server';
// import { jwtVerify } from 'jose'; // Use the jose library for JWT verification
// import { cookies } from 'next/headers'; // Use next/headers to access cookies

// const SECRET_KEY = process.env.JWT_SECRET;

// export async function middleware(request) {

//   // Retrieve cookies
//   const cookieStore = cookies();
//   const tokenFromCookie = cookieStore.get('jwtToken')?.value; // Access the 'value' of the cookie

//   // Retrieve token from Authorization header if present
//   const authHeader = request.headers.get('Authorization');
//   const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

//   // Use the token from cookie or header
//   const token = tokenFromCookie || tokenFromHeader;

//   const isLoginRoute = request.nextUrl.pathname === '/login';

//   console.log("Retrieved Token:", token); // Log token for debugging

//   // Case 1: No token found
//   if (!token || typeof token !== 'string') {
//     if (isLoginRoute) {
//       // Allow access to /login for unauthenticated users
//       return NextResponse.next();
//     }
//     // Redirect unauthenticated users to /login
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   // Case 2: Token is found, verify it
//   try {
//     const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));

//     // Check token expiration
//     const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
//     if (payload.exp && payload.exp < currentTime) {
//       console.log("Token expired");
//       if (!isLoginRoute) {
//         return NextResponse.redirect(new URL('/login', request.url));
//       }
//       return NextResponse.next(); // Let the user access /login to re-authenticate
//     }

//     // Redirect logged-in users away from /login to /dashboard
//     if (isLoginRoute) {
//       return NextResponse.redirect(new URL('/dashboard', request.url));
//     }

//     // Allow access to protected routes
//     return NextResponse.next();

//   } catch (error) {
//     console.error("JWT Verification Error:", error); // Log specific errors
//     if (!isLoginRoute) {
//       return NextResponse.redirect(new URL('/login', request.url));
//     }
//     return NextResponse.next(); // Let the user access /login to re-authenticate
//   }
// }

// export const config = {
//   matcher: ['/dashboard', '/dashboard/:path*', '/login'], // Apply middleware to these routes
// };
// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET;

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/users/login',
  '/api/users/register',
  '/api/users/logout',
  '/public/request/new',
  '/public/upload',
  '/public/upload/:path*',
  '/api/media'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route.endsWith('*')) {
      const baseRoute = route.replace('/:path*', '');
      return pathname.startsWith(baseRoute);
    }
    return pathname === route;
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('jwtToken')?.value;

  try {
    if (!token) {
      throw new Error('No token provided');
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
    
    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      throw new Error('Token expired');
    }

    // Redirect logic based on user type
    if (pathname.startsWith('/dashboard') && payload.userType !== 'users') {
      return NextResponse.redirect(new URL(`/${payload.userType}-dashboard`, request.url));
    }
    
    if (pathname.startsWith('/agent-dashboard') && payload.userType !== 'agents') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (pathname.startsWith('/media-dashboard') && payload.userType !== 'socialmediaperson') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Authentication error:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('jwtToken');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};