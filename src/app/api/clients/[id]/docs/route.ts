// Cdw-Spm
import { NextResponse } from "next/server";
import { getClient } from "@/lib/db/mockClients";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const client = getClient(params.id);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return NextResponse.json(client.documents || []);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = getClient(params.id);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const body = await req.json();
    if (!client.documents) client.documents = [];
    const newDoc = { id: `d${Date.now()}`, createdAt: new Date().toISOString(), ...body };
    client.documents.push(newDoc);

    return NextResponse.json(newDoc, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}