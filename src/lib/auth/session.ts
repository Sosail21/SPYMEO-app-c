// Cdw-Spm

import { cookies } from "next/headers";

export const COOKIE_NAME = "spymeo_session";

export type Session = {
  id: string;
  name: string;
  email: string;
  role:
    | "FREE_USER"
    | "PASS_USER"
    | "PRACTITIONER"
    | "ARTISAN"
    | "COMMERÇANT"
    | "COMMERCANT"
    | "CENTER"
    | "ADMIN";
  avatar?: string;
};

function normalizeRole(role?: string) {
  return (role || "").toUpperCase().replace("Ç", "C") as Session["role"];
}

/** Lit l’utilisateur depuis le cookie JSON `spymeo_session`. */
export async function getSessionUser(): Promise<Session | null> {
  try {
    const jar = cookies();
    const raw = jar.get(COOKIE_NAME)?.value;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Session;
    return { ...parsed, role: normalizeRole(parsed.role) };
  } catch {
    return null;
  }
}

/** Écrit/actualise le cookie de session. À appeler dans /api/auth/login. */
export async function setSessionUser(user: Session) {
  const jar = cookies();
  // 7 jours, SameSite Lax, HTTPOnly
  jar.set({
    name: COOKIE_NAME,
    value: JSON.stringify({ ...user, role: normalizeRole(user.role) }),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Supprime le cookie. À appeler dans /api/auth/logout. */
export async function clearSessionUser() {
  const jar = cookies();
  jar.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}