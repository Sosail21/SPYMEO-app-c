// Cdw-Spm
// src/app/api/clients/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").toLowerCase();

    // TODO: Implement with Prisma
    return NextResponse.json([], { status: 200 });
  } catch (e) {
    console.error("GET /api/clients error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // TODO: Implement with Prisma
    return NextResponse.json({ id: "temp", ...body }, { status: 201 });
  } catch (e) {
    console.error("POST /api/clients error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}