// src/lib/mockdb/stock-commercant.ts

export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  date: string;            // ISO
  type: StockMovementType;
  quantity: number;        // + / -
  reason?: string;
  ref?: string;            // référence commande, livraison, etc.
};

export const MOCK_STOCK_COMMERCANT: StockMovement[] = [
  {
    id: "m1",
    productId: "p1",
    productName: "Huile essentielle de lavande BIO 10ml",
    date: "2025-09-10",
    type: "OUT",
    quantity: -2,
    reason: "Commande #c1",
    ref: "c1",
  },
  {
    id: "m2",
    productId: "p2",
    productName: "Tisane digestion légère — 20 sachets",
    date: "2025-09-10",
    type: "OUT",
    quantity: -1,
    reason: "Commande #c1",
    ref: "c1",
  },
  {
    id: "m3",
    productId: "p2",
    productName: "Tisane digestion légère — 20 sachets",
    date: "2025-09-15",
    type: "IN",
    quantity: +50,
    reason: "Réassort fournisseur",
    ref: "PO-2025-0915",
  },
  {
    id: "m4",
    productId: "p3",
    productName: "Baume respiratoire mentholé 50ml",
    date: "2025-09-16",
    type: "ADJUSTMENT",
    quantity: +3,
    reason: "Correction inventaire",
  },
];
