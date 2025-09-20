// src/lib/mockdb/precompta-commercant.ts

export type PaymentMethod = "CARD" | "CASH" | "TRANSFER" | "CHECK";
export type EntryType = "SALE" | "REFUND" | "ADJUSTMENT";

export type PreComptaEntry = {
  id: string;
  date: string;               // ISO
  label: string;              // libellé
  type: EntryType;
  amountTTC: number;          // positif = entrée, négatif = sortie
  vatRate?: number;           // ex: 20
  paymentMethod?: PaymentMethod;
  orderId?: string;           // lien vers commande
  notes?: string;
};

export const MOCK_PRECOMPTA_COMMERCANT: PreComptaEntry[] = [
  {
    id: "e1",
    date: "2025-09-10",
    label: "Commande #c1",
    type: "SALE",
    amountTTC: 42.5,
    vatRate: 20,
    paymentMethod: "CARD",
    orderId: "c1",
  },
  {
    id: "e2",
    date: "2025-09-11",
    label: "Commande #c2",
    type: "SALE",
    amountTTC: 89.9,
    vatRate: 5.5,
    paymentMethod: "TRANSFER",
    orderId: "c2",
  },
  {
    id: "e3",
    date: "2025-09-12",
    label: "Remboursement commande #c4",
    type: "REFUND",
    amountTTC: -15,
    vatRate: 20,
    paymentMethod: "CARD",
    orderId: "c4",
    notes: "Annulation client",
  },
  {
    id: "e4",
    date: "2025-09-15",
    label: "Ajustement caisse",
    type: "ADJUSTMENT",
    amountTTC: 2.5,
    notes: "Écart inventaire",
  },
];
