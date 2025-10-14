// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { docId: string } }) {
  return NextResponse.json({
    id: params.docId,
    title: "Document exemple",
    type: "PDF",
    createdAt: new Date().toISOString(),
    sizeKb: 100
  });
}

export async function DELETE(_: Request, { params }: { params: { docId: string } }) {
  return NextResponse.json({ ok: true, id: params.docId });
}