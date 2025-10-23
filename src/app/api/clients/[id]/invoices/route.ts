// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  // TODO: Implement with Prisma
  return NextResponse.json([]);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    // TODO: Implement with Prisma
    const newInvoice = { id: `f${Date.now()}`, date: new Date().toISOString().split('T')[0], status: "pending", ...body };
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}