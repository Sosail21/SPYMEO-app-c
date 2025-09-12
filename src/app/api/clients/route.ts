// src/app/api/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  listClients,
  createClient,
  getClient,
  updateClient,
  deleteClient,
} from "@/lib/db/mockClients";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").toLowerCase();

    const clients = await listClients(); // => doit renvoyer un tableau
    const items = Array.isArray(clients) ? clients : [];

    const filtered = q
      ? items.filter((c) =>
          `${c.firstName ?? ""} ${c.lastName ?? ""}`
            .toLowerCase()
            .includes(q)
        )
      : items;

    return NextResponse.json(filtered, { status: 200 });
  } catch (e) {
    console.error("GET /api/clients error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await createClient(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST /api/clients error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}