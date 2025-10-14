// Cdw-Spm
import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth/users";
import { COOKIE_NAME, type Session } from "@/lib/auth/session";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const u = findUserByEmail(email || "");
  if (!u || u.password !== password) {
    return NextResponse.json({ ok: false, error: "Identifiants invalides" }, { status: 401 });
  }
  const session: Session = { id: u.id, name: u.name, email: u.email, role: u.role };
  const res = NextResponse.json({ ok: true, role: u.role });

  res.cookies.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
