import { NextResponse } from "next/server";
import { listOpportunities } from "@/lib/db/community";

export async function GET() {
  // ouvert à la lecture même non connecté si tu veux; sinon check session
  const data = await listOpportunities();
  return NextResponse.json(data);
}