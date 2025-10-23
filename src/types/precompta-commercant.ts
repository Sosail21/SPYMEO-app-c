export interface PrecomptaEntry {
  id: string;
  date: string;
  type: "income" | "expense" | "SALE" | "REFUND" | "ADJUSTMENT";
  category: string;
  amount: number;
  amountTTC?: number;
  description?: string;
  receipt?: string;
  label?: string;
  vatRate?: number;
  paymentMethod?: string;
  orderId?: string;
}

export type PreComptaEntry = PrecomptaEntry;
export type EntryType = PrecomptaEntry["type"];
export type CommercantLedgerItem = PrecomptaEntry;
