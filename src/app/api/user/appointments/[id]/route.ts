// Cdw-Spm
import { NextResponse } from "next/server";
import { getAppointmentById } from "@/lib/mockdb/appointments";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const appointment = getAppointmentById(params.id);
  return NextResponse.json({ appointment });
}
