// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { aid: string } }) {
  return NextResponse.json({ id: params.aid, label: "Exemple antécédent" });
}

export async function PUT(req: Request, { params }: { params: { aid: string } }) {
  try {
    const body = await req.json();
    return NextResponse.json({ id: params.aid, ...body });
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { aid: string } }) {
  return NextResponse.json({ ok: true, id: params.aid });
}