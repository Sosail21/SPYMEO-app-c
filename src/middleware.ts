import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/session";

const PRO_ROLES = new Set(["PRACTITIONER", "ARTISAN", "COMMERÇANT", "CENTER", "ADMIN"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/pro")) {
    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    try {
      const session = cookie ? JSON.parse(cookie) : null;
      if (!session || !PRO_ROLES.has(session.role)) {
        const url = new URL("/auth/login", req.url);
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
    } catch {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/pro/:path*"] };
