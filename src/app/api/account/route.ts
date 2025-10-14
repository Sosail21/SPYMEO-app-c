// Cdw-Spm
// src/app/api/account/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { upsertProfile } from "@/lib/db/profiles";
import { profileSchema } from "@/lib/validation/profile";

export async function PUT(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    const data = await req.json();
    const parsed = profileSchema.parse(data);
    await upsertProfile(me.id, { ...parsed, userId: me.id });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "INVALID" }, { status: 400 });
  }
}
