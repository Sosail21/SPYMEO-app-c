import { NextResponse } from "next/server";
import { getUserDocumentById } from "@/lib/mockdb/documents";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const document = getUserDocumentById(params.id);
  return NextResponse.json({ document });
}
