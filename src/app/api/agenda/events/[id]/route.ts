// Cdw-Spm
import { NextResponse } from "next/server";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const body = await req.json();
  // TODO: Implement with Prisma
  return NextResponse.json({ id: params.id, ...body });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  // TODO: Implement with Prisma
  return NextResponse.json({ success: true });
}
