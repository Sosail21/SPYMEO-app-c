
export const dynamic = "force-dynamic";

// @ts-ignore
const db = globalThis.__PRECOMPTA__ as { receipts: Record<string, { id: string; filename: string; mime: string; data: ArrayBuffer; uploadedAt: string; size: number; txId?: string }> };

export async function GET() {
  // list all receipts (meta only)
  const items = Object.values(db.receipts).map(({ id, filename, uploadedAt, size, mime }) => ({ id, filename, uploadedAt, size, mime }));
  return Response.json(items);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const txId = form.get("txId") as string | null;
  if (!file) return new Response("file required", { status: 400 });
  const id = crypto.randomUUID();
  const arrayBuf = await file.arrayBuffer();
  db.receipts[id] = { id, filename: file.name, mime: file.type || "application/octet-stream", data: arrayBuf, uploadedAt: new Date().toISOString(), size: arrayBuf.byteLength, txId: txId || undefined };
  return Response.json({ id });
}
