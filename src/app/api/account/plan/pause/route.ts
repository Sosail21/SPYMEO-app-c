// Cdw-Spm
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { pausePlanOnce } from "@/lib/db/billing";

export async function POST() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    const next = await pausePlanOnce(me.id);
    return NextResponse.json(next);
  } catch {
    return NextResponse.json({ error: "PAUSE_ALREADY_USED" }, { status: 400 });
  }
}
