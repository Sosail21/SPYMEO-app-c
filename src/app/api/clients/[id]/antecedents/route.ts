// Cdw-Spm
import { NextResponse } from "next/server";
import { getClient } from "@/lib/db/mockClients";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const client = getClient(params.id);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return NextResponse.json(client.antecedents || []);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = getClient(params.id);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const { label } = await req.json();
    if (!client.antecedents) client.antecedents = [];
    client.antecedents.push(label);

    return NextResponse.json(client.antecedents);
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}