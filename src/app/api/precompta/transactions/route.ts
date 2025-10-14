// Cdw-Spm

export const dynamic = "force-dynamic";

type Tx = {
  id: string;
  date: string;
  label: string;
  type: "revenu" | "depense";
  source: "consultation" | "manuel";
  category?: string;
  amount: number;
  vatRate?: number;
  receiptIds?: string[];
};

// @ts-ignore
const db = (globalThis as any).__PRECOMPTA__ as { config: any; txs: Tx[]; receipts: any };

export async function GET() {
  // seed some data if empty
  if (db.txs.length === 0) {
    const today = new Date();
    db.txs.push(
      { id: crypto.randomUUID(), date: today.toISOString(), label: "Consultation - Mme Dupont", type: "revenu", source: "consultation", amount: 60, vatRate: db.config.vatScheme==="franchise"?0:db.config.vatRate },
      { id: crypto.randomUUID(), date: today.toISOString(), label: "Achat huiles essentielles", type: "depense", source: "manuel", amount: 24, vatRate: db.config.vatScheme==="franchise"?0:0.2 },
    );
  }
  return Response.json(db.txs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const t: Tx = {
    id: crypto.randomUUID(),
    date: body.date || new Date().toISOString(),
    label: String(body.label || "Écriture"),
    type: body.type === "depense" ? "depense" : "revenu",
    source: body.source === "consultation" ? "consultation" : "manuel",
    category: body.category,
    amount: Number(body.amount || 0),
    vatRate: body.vatRate != null ? Number(body.vatRate) : 0,
    receiptIds: [],
  };
  db.txs.unshift(t);
  return Response.json(t, { status: 201 });
}
