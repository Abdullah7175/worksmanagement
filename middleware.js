import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/unauthorized", "/_next", "/api", "/favicon.ico", "/public"];

// Allowed roles for smagent
const smagentRolesA = [1, 2, 3, 6]; // CAMERA MAN, ASSISTANT, PHOTOGRAPHER, CONTENT CREATOR
const smagentRolesB = [4, 5]; // VIDEO EDITOR, MANAGER
// Allowed roles for dashboard
const dashboardRoles = [1, 2, 3];

// List of allowed dashboard paths (prefixes)
const dashboardAllowed = [
  "/dashboard",
  "/dashboard/districts",
  "/dashboard/districts/add",
  "/dashboard/districts/edit",
  "/dashboard/towns",
  "/dashboard/towns/add",
  "/dashboard/towns/edit",
  "/dashboard/subtowns",
  "/dashboard/complaints/types",
  "/dashboard/complaints/types/add",
  "/dashboard/complaints/types/edit",
  "/dashboard/complaints/sub-types",
  "/dashboard/complaints/sub-types/add",
  "/dashboard/complaints/sub-types/edit",
  "/dashboard/requests",
  "/dashboard/requests/new",
  "/dashboard/requests/performa",
  "/dashboard/videos",
  "/dashboard/videos/add",
  "/dashboard/uploads/videos",
  "/dashboard/videos/edit",
  "/dashboard/final-videos",
  "/dashboard/final-videos/add",
  "/dashboard/images",
  "/dashboard/images/add",
  "/dashboard/images/edit",
  "/dashboard/users",
  "/dashboard/users/add",
  "/dashboard/users/edit",
  "/dashboard/agents",
  "/dashboard/agents/add",
  "/dashboard/agents/edit",
  "/dashboard/socialmediaagent",
  "/dashboard/socialmediaagent/add",
  "/dashboard/socialmediaagent/edit",
  "/dashboard/reports"
];

const agentAllowed = [
  "/agent",
  "/agent/requests",
  "/agent/requests/new",
  "/agent/videos",
  "/agent/images"
];

const smagentAllowedA = [
  "/smagent",
  "/smagent/assigned-requests",
  "/smagent/videos/add",
  "/smagent/images/add"
];
const smagentAllowedB = [
  "/smagent",
  "/smagent/assigned-requests",
  "/smagent/final-videos",
  "/smagent/final-videos/add",
  "/smagent/images/download",
  "/smagent/videos/download",
  "/smagent/images/add",
  "/smagent/videos/add"
];

function getDashboardForUser(token) {
  if (!token) return "/login";
  if (token.user?.userType === "agent") return "/agent";
  if (token.user?.userType === "socialmedia") return "/smagent";
  if (token.user?.userType === "user") return "/dashboard";
  return "/login";
}

function isAllowed(pathname, allowedList) {
  return allowedList.some((route) => {
    if (route === "/smagent") {
      // Only allow exact match for /smagent
      return pathname === "/smagent";
    }
    // For other routes, allow exact match or subpaths
    return pathname === route || pathname.startsWith(route + "/");
  });
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // LOGGING FOR DEBUGGING
  console.log("MIDDLEWARE LOG:", { pathname, token });

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If no session, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // /dashboard protection
  if (pathname.startsWith("/dashboard")) {
    if (token.user?.userType !== "user" || !dashboardRoles.includes(Number(token.user?.role))) {
      // Redirect to correct dashboard for this user
      return NextResponse.redirect(new URL(getDashboardForUser(token), req.url));
    }
    if (!isAllowed(pathname, dashboardAllowed)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // /agent protection
  if (pathname.startsWith("/agent")) {
    if (token.user?.userType !== "agent") {
      return NextResponse.redirect(new URL(getDashboardForUser(token), req.url));
    }
    if (!isAllowed(pathname, agentAllowed)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // /smagent protection
  if (pathname.startsWith("/smagent")) {
    if (token.user?.userType !== "socialmedia") {
      return NextResponse.redirect(new URL(getDashboardForUser(token), req.url));
    }
    const role = Number(token.user?.role);
    if (smagentRolesA.includes(role)) {
      if (!isAllowed(pathname, smagentAllowedA)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } else if (smagentRolesB.includes(role)) {
      if (!isAllowed(pathname, smagentAllowedB)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } else {
      // Unknown role, redirect to their dashboard
      return NextResponse.redirect(new URL(getDashboardForUser(token), req.url));
    }
  }

  // You can add more rules for other sections here if needed

  return NextResponse.next();
}

export const config = {
  matcher: ["/smagent/:path*", "/agent/:path*", "/dashboard/:path*"],
}; 