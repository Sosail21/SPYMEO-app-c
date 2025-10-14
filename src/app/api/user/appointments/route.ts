// Cdw-Spm
import { NextResponse } from "next/server";
import { MOCK_APPTS_UPCOMING, MOCK_APPTS_PAST } from "@/lib/mockdb/appointments";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope"); // "upcoming" | "past"
  if (scope === "past") {
    return NextResponse.json({ appointments: MOCK_APPTS_PAST });
  }
  if (scope === "upcoming") {
    return NextResponse.json({ appointments: MOCK_APPTS_UPCOMING });
  }
  return NextResponse.json({ appointments: [...MOCK_APPTS_UPCOMING, ...MOCK_APPTS_PAST] });
}
