import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getClient } from "@/lib/services/client-service";
import {
  listAntecedents,
  createAntecedent,
} from "@/lib/services/antecedent-service";
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

    // Verify client access
    const client = await getClient(params.id, user.id);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const antecedents = await listAntecedents(params.id);

    return NextResponse.json(antecedents);
  } catch (e) {
    console.error("GET /api/clients/[id]/antecedents error", e);
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

    // Verify client access
    const client = await getClient(params.id, user.id);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    const antecedent = await createAntecedent({
      ...body,
      clientId: params.id,
    });

    return NextResponse.json(antecedent, { status: 201 });
  } catch (e) {
    console.error("POST /api/clients/[id]/antecedents error", e);

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
