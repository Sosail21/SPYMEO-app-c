// Cdw-Spm: Login route with Prisma
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, type Session } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Check if user is pending validation
    if (user.status === 'PENDING_VALIDATION') {
      return NextResponse.json(
        {
          ok: false,
          error: "Votre candidature est en cours d'étude. Vous recevrez un email de confirmation sous 72h."
        },
        { status: 403 }
      );
    }

    // Check if user is rejected or suspended
    if (user.status === 'REJECTED' || user.status === 'SUSPENDED') {
      return NextResponse.json(
        {
          ok: false,
          error: "Votre compte n'est pas actif. Contactez-nous pour plus d'informations."
        },
        { status: 403 }
      );
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { ok: false, error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Create session
    const session: Session = {
      id: user.id,
      name: user.name || `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    };

    const res = NextResponse.json({ ok: true, role: user.role });
    res.cookies.set(COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("[AUTH] Login error:", error);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}