// Cdw-Spm
// src/lib/mockdb/orders-commercant.ts

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";

export type OrderItem = {
  productId?: string;
  name: string;
  qty: number;
  price: number; // TTC, €
  vatRate?: number;
};

export type OrderDetail = {
  id: string;
  customer: string;
  email: string;
  phone?: string;
  date: string; // ISO
  amount: number; // TTC total
  status: OrderStatus;
  items: OrderItem[];
  notes?: string;
};

export const MOCK_ORDERS_COMMERCANT: OrderDetail[] = [
  {
    id: "c1",
    customer: "Alice Martin",
    email: "alice@example.com",
    phone: "06 12 34 56 78",
    date: "2025-09-10",
    amount: 42.5,
    status: "PENDING",
    items: [
      { name: "Savon naturel", qty: 2, price: 5.5, vatRate: 20 },
      { name: "Bougie artisanale", qty: 1, price: 12, vatRate: 20 },
      { name: "Tisane digestion légère — 20", qty: 1, price: 8.5, vatRate: 5.5 },
    ],
  },
  {
    id: "c2",
    customer: "Marc Dupont",
    email: "marc@example.com",
    date: "2025-09-11",
    amount: 89.9,
    status: "PAID",
    items: [{ name: "Tisane bio", qty: 3, price: 8.5, vatRate: 5.5 }],
  },
  {
    id: "c3",
    customer: "Julie Bernard",
    email: "julie@example.com",
    date: "2025-09-12",
    amount: 120,
    status: "SHIPPED",
    items: [{ name: "Bouillotte graines de lin", qty: 5, price: 24, vatRate: 20 }],
  },
  {
    id: "c4",
    customer: "Paul Moreau",
    email: "paul@example.com",
    date: "2025-09-15",
    amount: 15,
    status: "CANCELLED",
    items: [{ name: "Savon naturel", qty: 1, price: 5.5, vatRate: 20 }],
    notes: "Annulé à la demande du client.",
  },
];
