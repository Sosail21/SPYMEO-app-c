
export const dynamic = "force-dynamic";

// @ts-ignore
const db = globalThis.__PRECOMPTA__ as { receipts: Record<string, { id: string; filename: string; mime: string; data: ArrayBuffer; uploadedAt: string; size: number }> };

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const item = db.receipts[params.id];
  if (!item) return new Response("Not found", { status: 404 });
  return new Response(item.data, { headers: { "Content-Type": item.mime, "Content-Disposition": `attachment; filename="${item.filename}"` } });
}
