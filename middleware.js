// import { NextResponse } from 'next/server';
// import { jwtVerify } from 'jose'; // Use the jose library for JWT verification
// import { cookies } from 'next/headers'; // Use next/headers to access cookies

// const SECRET_KEY = process.env.JWT_SECRET;

// export async function middleware(request) {

//   // Retrieve cookies
//   const cookieStore = request.cookies;
//   const tokenFromCookie = cookieStore.get('jwtToken')?.value;

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
// import { NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import jwt from 'jsonwebtoken';

// // const SECRET_KEY = process.env.JWT_SECRET;

// // Public routes that don't require authentication
// const publicRoutes = [
//   '/',
//   '/login',
//   '/register',
//   '/api/users/login',
//   '/api/users/register',
//   '/api/users/logout',
//   '/public/request/new',
//   '/public/upload',
//   // '/public/upload/:path*',
//   '/api/media'
// ];


// export async function middleware(request) {
//   const { pathname } = request.nextUrl;

//   // Skip middleware for public routes
//   // if (publicRoutes.includes(pathname)) {
//   //   return NextResponse.next();
//   // }
//   if (publicRoutes.some(route => pathname.startsWith(route))) {
//     return NextResponse.next();
//   }


//   // Try to get token from NextAuth first
//   const nextAuthToken = await getToken({ req: request, secret: process.env.JWT_SECRET });
//   const decoded = nextAuthToken; // Already decoded and verified

//   // Fallback to checking JWT in cookies or headers
//   let token = nextAuthToken?.accessToken || 
//              request.cookies.get('jwtToken')?.value || 
//              request.headers.get('authorization')?.split(' ')[1];

//   try {
//     if (!token) {
//       throw new Error('No token provided');
//     }

//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Check token expiration
//     if (decoded.exp && decoded.exp < Date.now() / 1000) {
//       throw new Error('Token expired');
//     }

//     // Redirect logic based on user type
//     if (pathname.startsWith('/dashboard') && decoded.userType !== 'users') {
//       return NextResponse.redirect(new URL(`/${decoded.userType}-dashboard`, request.url));
//     }
    
//     if (pathname.startsWith('/agent-dashboard') && decoded.userType !== 'agents') {
//       return NextResponse.redirect(new URL('/dashboard', request.url));
//     }
    
//     if (pathname.startsWith('/media-dashboard') && decoded.userType !== 'socialmediaperson') {
//       return NextResponse.redirect(new URL('/dashboard', request.url));
//     }

//     return NextResponse.next();
//   } catch (error) {
//     console.error('Authentication error:', error);
//     const response = NextResponse.redirect(new URL('/login', request.url));
//     response.cookies.delete('jwtToken');
//     return response;
//   }
// }

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };


import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Use the jose library for JWT verification

const SECRET_KEY = process.env.JWT_SECRET;

export async function middleware(request) {
  // ✅ Retrieve token from cookies
  const tokenFromCookie = request.cookies.get('jwtToken')?.value;

  // ✅ Retrieve token from Authorization header if present
  const authHeader = request.headers.get('Authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // ✅ Use the token from cookie or header
  const token = tokenFromCookie || tokenFromHeader;

  const isLoginRoute = request.nextUrl.pathname === '/login';

  console.log("Retrieved Token:", token); // Should now show a real token

  // ❌ No token: redirect unless you're already on /login
  if (!token) {
    return isLoginRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ Token exists: verify it
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));

    // ✅ Check expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      console.log("Token expired");
      return isLoginRoute
        ? NextResponse.next()
        : NextResponse.redirect(new URL('/login', request.url));
    }

    // ✅ Redirect logged-in users away from login
    if (isLoginRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();

  } catch (error) {
    console.error("JWT Verification Error:", error);
    return isLoginRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/login'],
};
