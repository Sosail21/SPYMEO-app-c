// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  // TODO: Implement with Prisma
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const patch = await req.json();
    // TODO: Implement with Prisma
    return NextResponse.json({ id: params.id, ...patch });
  } catch (e) {
    console.error("PUT /api/clients/[id] error", e);
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  // TODO: Implement with Prisma
  return NextResponse.json({ success: true });
}