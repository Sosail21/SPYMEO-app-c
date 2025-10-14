// Cdw-Spm
export type Consultation = {
  id: string;
  date: string; // ISO
  motif: string;
  notes?: string;
};

export type Document = {
  id: string;
  title: string;
  type: string;
  createdAt: string; // ISO
  sizeKb: number;
};

export type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
};

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: string;

  // DATA FOR OTHER TABS
  consultations?: Consultation[];
  documents?: Document[];
  invoices?: Invoice[];
  antecedents?: string[];
  stats?: {
    totalVisits: number;
    lastVisit?: string;
  };
};

let CLIENTS: Client[] = [
  {
    id: "1",
    firstName: "Alice",
    lastName: "Dupont",
    email: "alice@example.com",
    phone: "0600000001",
    birthDate: "1980-01-01",
    address: "12 rue du Bien-Être, Dijon",
    consultations: [
      { id: "c1", date: "2025-08-01T10:00:00Z", motif: "Gestion du stress", notes: "Exercices de respiration" },
      { id: "c2", date: "2025-09-05T14:30:00Z", motif: "Sommeil", notes: "Hygiène du sommeil, tisane" }
    ],
    documents: [
      { id: "d1", title: "Fiche conseils - Août", type: "PDF", createdAt: "2025-08-01T12:00:00Z", sizeKb: 220 },
      { id: "d2", title: "Exercices respiration", type: "PDF", createdAt: "2025-08-01T12:05:00Z", sizeKb: 95 }
    ],
    invoices: [
      { id: "f1", date: "2025-08-01", amount: 60, status: "paid" }
    ],
    antecedents: ["Migraine légère", "Stress saisonnier"],
    stats: { totalVisits: 2, lastVisit: "2025-09-05" }
  },
  {
    id: "2",
    firstName: "Paul",
    lastName: "Martin",
    email: "paul@example.com",
    phone: "0600000002",
    birthDate: "1987-03-12",
    address: "4 avenue des Tilleuls, Beaune",
    consultations: [
      { id: "c3", date: "2025-07-12T09:00:00Z", motif: "Troubles digestifs" }
    ],
    documents: [],
    invoices: [
      { id: "f2", date: "2025-07-12", amount: 60, status: "pending" }
    ],
    antecedents: ["Intolérance lactose"],
    stats: { totalVisits: 1, lastVisit: "2025-07-12" }
  }
];

export function listClients() {
  return CLIENTS;
}

export function getClient(id: string) {
  return CLIENTS.find((c) => c.id === id) || null;
}

export function createClient(input: Partial<Client>) {
  const id = (CLIENTS.length + 1).toString();
  const newC: Client = {
    id,
    firstName: input.firstName || "Nouveau",
    lastName: input.lastName || "Client",
    email: input.email || "no@mail.test",
    phone: input.phone || "",
    birthDate: input.birthDate,
    address: input.address,
    consultations: [],
    documents: [],
    invoices: [],
    antecedents: [],
    stats: { totalVisits: 0 }
  };
  CLIENTS.push(newC);
  return newC;
}

export function updateClient(id: string, patch: Partial<Client>) {
  const idx = CLIENTS.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  CLIENTS[idx] = { ...CLIENTS[idx], ...patch };
  return CLIENTS[idx];
}

export function deleteClient(id: string) {
  const idx = CLIENTS.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  CLIENTS.splice(idx, 1);
  return true;
}