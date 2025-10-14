// Cdw-Spm
import { NextResponse } from "next/server";
import { MOCK_PASS_SNAPSHOT } from "@/lib/mockdb/pass";

export async function GET() {
  return NextResponse.json({ discounts: MOCK_PASS_SNAPSHOT.discounts });
}
