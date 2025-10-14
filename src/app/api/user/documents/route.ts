// Cdw-Spm
import { NextResponse } from "next/server";
import { MOCK_USER_DOCUMENTS } from "@/lib/mockdb/documents";

export async function GET() {
  return NextResponse.json({ documents: MOCK_USER_DOCUMENTS });
}
