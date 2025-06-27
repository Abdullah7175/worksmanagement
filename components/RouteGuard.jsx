"use client";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Define allowed routes for each userType/role
const allowedRoutes = {
  smagent: {
    "1": ["/smagent", "/smagent/assigned-requests", "/smagent/videos/add", "/smagent/images/add"],
    "2": ["/smagent", "/smagent/assigned-requests", "/smagent/videos/add", "/smagent/images/add"],
    "3": ["/smagent", "/smagent/assigned-requests", "/smagent/videos/add", "/smagent/images/add"],
    "6": ["/smagent", "/smagent/assigned-requests", "/smagent/videos/add", "/smagent/images/add"],
    "4": [
      "/smagent",
      "/smagent/assigned-requests",
      "/smagent/final-videos",
      "/smagent/final-videos/add",
      "/smagent/images/download",
      "/smagent/videos/download",
      "/smagent/images/add",
      "/smagent/videos/add",
    ],
    "5": [
      "/smagent",
      "/smagent/assigned-requests",
      "/smagent/final-videos",
      "/smagent/final-videos/add",
      "/smagent/images/download",
      "/smagent/videos/download",
      "/smagent/images/add",
      "/smagent/videos/add",
    ],
  },
  agent: {
    "1": ["/agent", "/agent/requests", "/agent/requests/new", "/agent/videos", "/agent/images"],
    "2": ["/agent", "/agent/requests", "/agent/requests/new", "/agent/videos", "/agent/images"],
  },
};

export default function RouteGuard({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    if (!session?.user) {
      router.replace("/login");
      return;
    }
    const { userType, role } = session.user;
    const roleStr = String(role);
    // smagent
    if (pathname.startsWith("/smagent")) {
      const allowed = allowedRoutes.smagent[roleStr] || [];
      // Allow query params for add pages
      const basePath = pathname.split("?")[0];
      if (!allowed.some((route) => basePath.startsWith(route))) {
        router.replace("/unauthorized");
      }
    }
    // agent
    if (pathname.startsWith("/agent")) {
      const allowed = allowedRoutes.agent[roleStr] || [];
      if (!allowed.includes(pathname)) {
        router.replace("/unauthorized");
      }
    }
    // You can add more userType/role checks here if needed
  }, [session, status, pathname, router]);

  return children;
} 