// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope"); // "upcoming" | "past"

  // TODO: Implement with Prisma
  return NextResponse.json({ appointments: [] });
}
