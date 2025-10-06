// src/middleware.ts
// Enhanced middleware with NextAuth integration
// Handles authentication and role-based access control

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";

const PRO_ROLES = new Set([
  "PRACTITIONER",
  "ARTISAN",
  "COMMERCANT",
  "CENTER",
  "ADMIN",
]);

// Normalise "Commerçant" -> "COMMERCANT", etc.
function normalizeRole(value?: string): string | undefined {
  if (!value) return undefined;
  // retire les diacritiques, uppercase
  const noDiacritics = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
  return noDiacritics.toUpperCase();
}

// Get session from NextAuth JWT token or legacy cookie
async function getSession(req: NextRequest): Promise<any | null> {
  // Try NextAuth JWT token first
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET || "spymeo-dev-secret-change-in-production",
    });

    if (token) {
      return {
        user: {
          id: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
          avatar: token.avatar,
        },
      };
    }
  } catch (error) {
    console.error("[Middleware] Error getting NextAuth token:", error);
  }

  // Fallback to legacy cookie
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    return { user: JSON.parse(raw) };
  } catch {
    try {
      return { user: JSON.parse(decodeURIComponent(raw)) };
    } catch {
      return null;
    }
  }
}

function redirectToLogin(req: NextRequest) {
  const url = new URL("/auth/login", req.url);
  const next = req.nextUrl.pathname + req.nextUrl.search;
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for API auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Get session (NextAuth or legacy)
  const session = await getSession(req);
  const role = normalizeRole(session?.user?.role);

  // Admin guard
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return redirectToLogin(req);
    }
  }

  // Pro guard
  if (pathname.startsWith("/pro")) {
    if (!role || !PRO_ROLES.has(role)) {
      return redirectToLogin(req);
    }
  }

  // User guard (Free/Pass users)
  if (pathname.startsWith("/user") || pathname.startsWith("/pass/tableau-de-bord")) {
    if (!session) {
      return redirectToLogin(req);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/pro/:path*",
    "/user/:path*",
    "/pass/tableau-de-bord/:path*",
  ],
};
