// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { cid: string } }) {
  return NextResponse.json({
    id: params.cid,
    date: new Date().toISOString(),
    motif: "Consultation exemple",
    notes: "Notes exemple"
  });
}

export async function PUT(req: Request, { params }: { params: { cid: string } }) {
  try {
    const body = await req.json();
    return NextResponse.json({ id: params.cid, ...body });
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { cid: string } }) {
  return NextResponse.json({ ok: true, id: params.cid });
}