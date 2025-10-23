// Cdw-Spm
import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Implement with Prisma
  return NextResponse.json({ pass: { id: "temp", monthsPaid: 1 } });
}
