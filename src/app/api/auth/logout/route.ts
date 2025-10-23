// Cdw-Spm
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";

/**
 * Endpoint universel de déconnexion.
 * - Accepte POST (depuis un <form>) et GET (depuis un <a> ou fetch).
 * - Supprime le cookie de session, puis redirige (303) vers `to` ou "/".
 */
function clearSessionCookie() {
  const jar = cookies();
  try {
    // Si ton runtime le supporte, c'est suffisant
    jar.delete(COOKIE_NAME);
  } catch {
    // Fallback: écrase le cookie avec une date expirée
    jar.set({
      name: COOKIE_NAME,
      value: "",
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
    });
  }
}

function redirectTo(request: Request) {
  const url = new URL(request.url);
  const to = url.searchParams.get("to") || "/";

  // Utilise NEXTAUTH_URL ou NEXT_PUBLIC_URL pour éviter l'IP interne AWS
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL || url.origin;
  const dest = new URL(to, baseUrl);

  const res = NextResponse.redirect(dest, { status: 303 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(request: Request) {
  clearSessionCookie();
  return redirectTo(request);
}

export async function GET(request: Request) {
  clearSessionCookie();
  return redirectTo(request);
}
