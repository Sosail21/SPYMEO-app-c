// Cdw-Spm
import { NextResponse } from "next/server";

const MOCK_RESOURCES = [
  { id: "1", title: "Guide nutrition", type: "PDF", sizeKb: 250, createdAt: "2025-08-01" },
  { id: "2", title: "Exercices respiration", type: "VIDEO", sizeKb: 1500, createdAt: "2025-08-15" }
];

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const resource = MOCK_RESOURCES.find(r => r.id === params.id);
  if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  return NextResponse.json(resource);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ ok: true, id: params.id });
}