// Cdw-Spm
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { toggleAdvantage } from "@/lib/db/community";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const url = new URL(_req.url);
  const active = url.searchParams.get("active") === "true";
  const updated = await toggleAdvantage(me.id, params.id, active);
  return NextResponse.json(updated);
}