import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  getClient,
  updateClient,
  deleteClient,
} from "@/lib/services/client-service";
import { ZodError } from "zod";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    // Get authenticated user
    const user = await getSessionUser();
    if (!user || user.role !== "PRACTITIONER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await getClient(params.id, user.id);

    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (e) {
    console.error("GET /api/clients/[id] error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    // Get authenticated user
    const user = await getSessionUser();
    if (!user || user.role !== "PRACTITIONER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patch = await req.json();
    const updated = await updateClient(params.id, user.id, patch);

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/clients/[id] error", e);

    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: e.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    // Get authenticated user
    const user = await getSessionUser();
    if (!user || user.role !== "PRACTITIONER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await deleteClient(params.id, user.id);

    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/clients/[id] error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}