// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Implement with Prisma
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  const body = await req.json();
  // TODO: Implement with Prisma
  return NextResponse.json({ id: "temp", ...body });
}
