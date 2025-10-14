// Cdw-Spm
// src/app/api/account/avatar/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const form = await req.formData();
  const url = `/images/avatars/${me.id}.png`;
  return NextResponse.json({ url });
}
