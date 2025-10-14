// Cdw-Spm
import { NextResponse } from "next/server";
import { updateEvent, deleteEvent } from "@/lib/mockdb/agenda";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const body = await req.json();
  const updated = updateEvent(params.id, body);
  return NextResponse.json(updated ?? { ok: false });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  deleteEvent(params.id);
  return NextResponse.json({ ok: true });
}
