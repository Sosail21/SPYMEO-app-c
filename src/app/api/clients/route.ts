// src/app/api/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  searchClients,
  createClient,
} from "@/lib/services/client-service";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getSessionUser();
    if (!user || user.role !== "PRACTITIONER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    const clients = await searchClients(user.id, {
      q,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(clients, { status: 200 });
  } catch (e) {
    console.error("GET /api/clients error", e);

    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: e.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getSessionUser();
    if (!user || user.role !== "PRACTITIONER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const created = await createClient(user.id, body);

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST /api/clients error", e);

    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: e.errors },
        { status: 400 }
      );
    }

    if (e instanceof Error && e.message === "Practitioner not found") {
      return NextResponse.json(
        { error: "Practitioner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}