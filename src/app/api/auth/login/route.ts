// src/app/api/auth/login/route.ts
// Backward-compatible login endpoint
// Maintains cookie-based session for legacy compatibility
// while also supporting NextAuth for new implementations

import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth/users";
import { COOKIE_NAME, type Session } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/auth-helpers";

/**
 * Login endpoint - maintains backward compatibility
 * For new implementations, prefer using NextAuth signIn()
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Find user
    const u = findUserByEmail(email);
    if (!u) {
      return NextResponse.json(
        { ok: false, error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Verify password (supports both hashed and plain text for development)
    const isValid = await verifyPassword(password, u.password);
    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Create session
    const session: Session = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
    };

    const res = NextResponse.json({ ok: true, role: u.role });

    // Set cookie
    res.cookies.set(COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error("[Login Error]", error);
    return NextResponse.json(
      { ok: false, error: "Une erreur est survenue lors de la connexion" },
      { status: 500 }
    );
  }
}
