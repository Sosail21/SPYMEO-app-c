// Cdw-Spm
import { NextResponse } from "next/server";
import { getStats } from "@/lib/mockdb/stats";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "week";
  const stats = getStats(range);
  return NextResponse.json(stats);
}
