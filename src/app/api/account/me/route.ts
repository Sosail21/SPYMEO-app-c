// Cdw-Spm
// src/app/api/account/me/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getProfileByUserId } from "@/lib/db/profiles";

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const profile = await getProfileByUserId(me.id);
  return NextResponse.json(profile);
}
