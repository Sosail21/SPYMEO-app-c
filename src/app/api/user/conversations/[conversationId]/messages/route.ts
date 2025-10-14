// Cdw-Spm
import { NextResponse } from "next/server";
import { getMessagesForConversation } from "@/lib/mockdb/messages";

export async function GET(_req: Request, { params }: { params: { conversationId: string } }) {
  const messages = getMessagesForConversation(params.conversationId);
  return NextResponse.json({ messages });
}
