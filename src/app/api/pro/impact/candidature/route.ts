// Cdw-Spm
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createCandidature } from "@/lib/db/community";

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { opportunityId, message } = await req.json();
  const ack = await createCandidature(me.id, opportunityId, message);
  return NextResponse.json(ack);
}