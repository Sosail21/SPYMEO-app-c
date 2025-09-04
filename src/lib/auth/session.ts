import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { Role } from "./users";

export const COOKIE_NAME = "spymeo_user";

export type Session = {
  email: string;
  name: string;
  role: Role;
  plan?: "free" | "pass";
};

export function getSessionFromCookies(req?: NextRequest): Session | null {
  try {
    const jar = req ? req.cookies : cookies();
    const raw = jar.get(COOKIE_NAME)?.value;
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}
