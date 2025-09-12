export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: string;
  notes?: string;
};

// Seed de base
const seed: Client[] = [
  {
    id: "1",
    firstName: "Alice",
    lastName: "Dupont",
    email: "alice@example.com",
    phone: "0600000001",
    birthDate: "1980-01-01",
    address: "12 rue du Bien-Être, Dijon",
    notes: "Consultation stress / sommeil.",
  },
  {
    id: "2",
    firstName: "Paul",
    lastName: "Martin",
    email: "paul@example.com",
    phone: "0600000002",
    birthDate: "1985-02-02",
    address: "3 impasse du Lac, Lyon",
  },
];

// On persiste dans le global pour survivre au HMR
const globalAny = globalThis as any;
if (!globalAny.__SPYMEO_CLIENTS__) {
  globalAny.__SPYMEO_CLIENTS__ = [...seed];
}
const store: Client[] = globalAny.__SPYMEO_CLIENTS__ as Client[];

export function listClients() {
  return store;
}
export function getClient(id: string) {
  return store.find((c) => c.id === id) || null;
}
export function createClient(data: Partial<Client>) {
  const id =
    (crypto as any)?.randomUUID?.() ??
    Math.random().toString(36).slice(2, 10);
  const client: Client = {
    id,
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    birthDate: data.birthDate ?? "",
    address: data.address ?? "",
    notes: data.notes ?? "",
  };
  store.push(client);
  return client;
}
export function updateClient(id: string, patch: Partial<Client>) {
  const c = getClient(id);
  if (!c) return null;
  Object.assign(c, patch);
  return c;
}
export function deleteClient(id: string) {
  const i = store.findIndex((c) => c.id === id);
  if (i >= 0) {
    store.splice(i, 1);
    return true;
  }
  return false;
}