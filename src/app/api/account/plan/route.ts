// Cdw-Spm
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { updatePlan, cancelAtPeriodEnd } from "@/lib/db/billing";

export async function PUT(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { plan, renewal } = await req.json();
  const next = await updatePlan(me.id, plan, renewal);
  return NextResponse.json(next);
}

export async function DELETE() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const next = await cancelAtPeriodEnd(me.id);
  return NextResponse.json(next);
}
