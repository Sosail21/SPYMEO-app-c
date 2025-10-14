// Cdw-Spm
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/session";

const PRO_ROLES = new Set(["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER", "ADMIN"]);

// Normalise "Commerçant" -> "COMMERCANT", etc.
function normalizeRole(value?: string): string | undefined {
  if (!value) return undefined;
  // retire les diacritiques, uppercase
  const noDiacritics = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  return noDiacritics.toUpperCase();
}

function getSession(req: NextRequest): any | null {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  // Cookie supposé JSON (sinon on adaptera)
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(raw));
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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Récup session + rôle
  const session = getSession(req);
  const role = normalizeRole(session?.role);

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pro/:path*"],
};
