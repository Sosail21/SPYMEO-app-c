// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Implement with Prisma
  return NextResponse.json({});
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    // TODO: Implement with Prisma
    return NextResponse.json(body);
  } catch (e) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
