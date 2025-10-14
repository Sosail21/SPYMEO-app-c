// Cdw-Spm
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { listAdvantages, createAdvantage } from "@/lib/db/community";

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  return NextResponse.json(await listAdvantages(me.id));
}

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json();
  const created = await createAdvantage(me.id, body);
  return NextResponse.json(created);
}