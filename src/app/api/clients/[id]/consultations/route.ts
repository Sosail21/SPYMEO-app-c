import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  listConsultations,
  createConsultation,
} from "@/lib/services/consultation-service";
import { ZodError } from "zod";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await getSessionUser();
    if (!user || user.role !== "PRACTITIONER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const consultations = await listConsultations(params.id, user.id);

    return NextResponse.json(consultations);
  } catch (e) {
    console.error("GET /api/clients/[id]/consultations error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await getSessionUser();
    if (!user || user.role !== "PRACTITIONER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const consultation = await createConsultation(user.id, {
      ...body,
      clientId: params.id,
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (e) {
    console.error("POST /api/clients/[id]/consultations error", e);

    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: e.errors },
        { status: 400 }
      );
    }

    if (e instanceof Error && e.message.includes("Client not found")) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
