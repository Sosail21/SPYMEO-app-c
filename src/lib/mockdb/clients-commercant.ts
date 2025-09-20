// src/lib/mockdb/clients-commercant.ts

export type Client = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;     // ISO
  lastOrderAt?: string;  // ISO
  ordersCount: number;
  totalSpent: number;    // €
  tags?: string[];
  notes?: string;
};

export const MOCK_CLIENTS_COMMERCANT: Client[] = [
  {
    id: "u1",
    name: "Alice Martin",
    email: "alice@example.com",
    phone: "06 12 34 56 78",
    createdAt: "2024-11-05",
    lastOrderAt: "2025-09-10",
    ordersCount: 5,
    totalSpent: 210.5,
    tags: ["fidèle", "newsletter"],
  },
  {
    id: "u2",
    name: "Marc Dupont",
    email: "marc@example.com",
    createdAt: "2025-04-18",
    lastOrderAt: "2025-09-11",
    ordersCount: 2,
    totalSpent: 96.4,
  },
  {
    id: "u3",
    name: "Julie Bernard",
    email: "julie@example.com",
    createdAt: "2025-07-02",
    lastOrderAt: "2025-09-12",
    ordersCount: 1,
    totalSpent: 120,
    tags: ["premium"],
    notes: "Intéressée par les coffrets cadeaux.",
  },
];
