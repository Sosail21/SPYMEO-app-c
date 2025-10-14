// Cdw-Spm
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getPassPartner, updatePassPartner } from "@/lib/db/community";

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  return NextResponse.json(await getPassPartner(me.id));
}

export async function PUT(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { enabled, rate } = await req.json();
  return NextResponse.json(await updatePassPartner(me.id, !!enabled, rate));
}