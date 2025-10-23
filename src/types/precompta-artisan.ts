export interface PrecomptaEntry {
  id: string;
  date: string;
  type: "income" | "expense" | "INVOICE";
  category: string;
  amount: number;
  description?: string;
  receipt?: string;
  ref?: string;
  label?: string;
  vatRate?: number;
}

export type ArtisanLedgerItem = PrecomptaEntry;
