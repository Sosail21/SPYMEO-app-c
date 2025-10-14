// Cdw-Spm
import { NextResponse } from "next/server";
import { listEvents, createEvent } from "@/lib/mockdb/agenda";

export async function GET() {
  const data = listEvents();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = createEvent(body);
  return NextResponse.json(created);
}
