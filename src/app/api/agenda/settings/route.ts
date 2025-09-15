import { NextResponse } from "next/server";
import { getAgendaSettings, updateAgendaSettings, type AgendaSettings } from "@/lib/mockdb/agendaSettings";

export async function GET() {
  return NextResponse.json(getAgendaSettings());
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<AgendaSettings>;
    const updated = updateAgendaSettings(body);
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
