// Cdw-Spm
// src/lib/mockdb/clients-artisan.ts
// Clients des artisans (commandes/ateliers/commissions).

export type ArtisanClient = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  ordersCount?: number;
  lastOrderAt?: string;   // ISO
  notes?: string;
};

export const MOCK_CLIENTS_ARTISAN: ArtisanClient[] = [
  {
    id: "cl1",
    name: "Alice Martin",
    email: "alice@example.com",
    phone: "06 12 34 56 78",
    city: "Dijon",
    ordersCount: 2,
    lastOrderAt: "2025-09-17",
    notes: "Fan d’ateliers upcycling.",
  },
  {
    id: "cl2",
    name: "Marc Dupont",
    email: "marc@example.com",
    city: "Talant",
    ordersCount: 1,
    lastOrderAt: "2025-09-15",
  },
  {
    id: "cl3",
    name: "Sophie Leroy",
    phone: "06 66 66 66 66",
    city: "Chenôve",
    ordersCount: 3,
    lastOrderAt: "2025-09-10",
    notes: "Commandes déco métal & textile.",
  },
  {
    id: "cl4",
    name: "Inès Robert",
    email: "ines@example.com",
    city: "Quetigny",
    ordersCount: 1,
    lastOrderAt: "2025-09-08",
  },
];
