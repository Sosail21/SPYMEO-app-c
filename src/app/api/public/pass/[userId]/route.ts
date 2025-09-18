import { NextResponse } from "next/server";
import { getPassPartner } from "@/lib/db/community";

// Renvoie { enabled: boolean, rate: number }
export async function GET(_req: Request, { params }: { params: { userId: string } }) {
  const p = await getPassPartner(params.userId);
  return NextResponse.json({ enabled: !!p.enabled, rate: p.rate ?? 10 });
}