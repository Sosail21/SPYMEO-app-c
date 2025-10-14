// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { invId: string } }) {
  return NextResponse.json({
    id: params.invId,
    date: new Date().toISOString().split('T')[0],
    amount: 60,
    status: "pending"
  });
}

export async function PUT(req: Request, { params }: { params: { invId: string } }) {
  try {
    const body = await req.json();
    return NextResponse.json({ id: params.invId, ...body });
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { invId: string } }) {
  return NextResponse.json({ ok: true, id: params.invId });
}