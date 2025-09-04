import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth/users";
import { COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Missing credentials" }, { status: 400 });
  }
  const user = verifyCredentials(email, password);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, user });
  // Cookie non signé pour la démo — à sécuriser avec httpOnly + signature côté backend
  res.cookies.set(COOKIE_NAME, JSON.stringify(user), {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
  return res;
}
