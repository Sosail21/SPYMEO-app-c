import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";

// Routes publiques (pas de garde)
const PUBLIC_PATHS = [
  "/",
  "/recherche",
  "/blog",
  "/blog/",
  "/auth/login",
  "/legal",
  "/legal/",
  "/praticien/",
  "/artisan/",
  "/commercant/",
  "/centre-de-formation/",
  // assets Next
  "/_next",
  "/favicon.ico",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const session = getSessionFromCookies(req);
  // Garde : nécessite d'être connecté
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // RBAC minimal
  if (pathname.startsWith("/user")) {
    if (!["FREE_USER", "PASS_USER", "ADMIN"].includes(session.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  if (pathname.startsWith("/pass")) {
    if (!["PASS_USER", "ADMIN"].includes(session.role)) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }
  if (pathname.startsWith("/praticien") && pathname.includes("/dashboard")) {
    if (!["PRACTITIONER", "ADMIN"].includes(session.role)) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }
  if (pathname.startsWith("/admin")) {
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
