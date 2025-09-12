import { NextResponse } from "next/server";
import { getClient, updateClient, deleteClient } from "@/lib/db/mockClients";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const c = getClient(params.id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(c);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const patch = await req.json();
    const updated = updateClient(params.id, patch);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/clients/[id] error", e);
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const ok = deleteClient(params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}