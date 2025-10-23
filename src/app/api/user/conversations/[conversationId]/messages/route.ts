// Cdw-Spm
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { conversationId: string } }) {
  // TODO: Implement with Prisma
  return NextResponse.json({ messages: [] });
}
