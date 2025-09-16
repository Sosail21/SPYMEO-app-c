
export const dynamic = "force-dynamic";

type Config = {
  status: "autoentrepreneur" | "ei" | "eurl" | "sasu" | "sas";
  vatScheme: "franchise" | "normal" | "simplifie";
  vatRate: number;
  socialRate: number;
  yearThresholdRevenue: number;
  bank: { iban?: string; bic?: string; bankName?: string };
  onlineConsultsSync: boolean;
};

// @ts-ignore
globalThis.__PRECOMPTA__ = globalThis.__PRECOMPTA__ || seed();
const db = globalThis.__PRECOMPTA__ as { config: Config; txs: any[]; receipts: Record<string, { id: string; filename: string; mime: string; data: ArrayBuffer; uploadedAt: string; size: number; txId?: string }>} ;

export async function GET() {
  return Response.json(db.config);
}

export async function POST(req: Request) {
  const body = await req.json();
  db.config = { ...db.config, ...body };
  return Response.json(db.config);
}

function seed(){
  const config: Config = {
    status: "autoentrepreneur",
    vatScheme: "franchise",
    vatRate: 0.2,
    socialRate: 0.22,
    yearThresholdRevenue: 77700,
    bank: {},
    onlineConsultsSync: true,
  };
  return { config, txs: [], receipts: {} };
}
