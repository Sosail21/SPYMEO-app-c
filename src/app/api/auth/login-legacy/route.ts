// src/app/api/auth/login-legacy/route.ts
// DEPRECATED: Legacy login endpoint for backward compatibility
// New code should use NextAuth signIn() instead
// This endpoint will be removed in a future version

import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth/users";
import { COOKIE_NAME, type Session } from "@/lib/auth/session";

/**
 * @deprecated Use NextAuth signIn() instead
 * This endpoint is kept for backward compatibility only
 */
export async function POST(req: Request) {
  console.warn("[DEPRECATED] /api/auth/login-legacy used. Migrate to NextAuth signIn()");

  const { email, password } = await req.json();
  const u = findUserByEmail(email || "");
  if (!u || u.password !== password) {
    return NextResponse.json(
      { ok: false, error: "Identifiants invalides" },
      { status: 401 }
    );
  }
  const session: Session = {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  };
  const res = NextResponse.json({ ok: true, role: u.role });

  res.cookies.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
