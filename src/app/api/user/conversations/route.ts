// Cdw-Spm
import { NextResponse } from "next/server";
import { MOCK_CONVERSATIONS } from "@/lib/mockdb/messages";

export async function GET() {
  return NextResponse.json({ conversations: MOCK_CONVERSATIONS });
}
