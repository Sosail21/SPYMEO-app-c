export type Role =
  | "FREE_USER"
  | "PASS_USER"
  | "PRACTITIONER"
  | "ARTISAN"
  | "COMMERÇANT"
  | "CENTER"
  | "ADMIN";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatar?: string;
};

export const USERS: UserRecord[] = [
  { id: "u1", name: "Alice Free",  email: "alice.free@spymeo.test", password: "azerty123", role: "FREE_USER" },
  { id: "u2", name: "Paul Pass",   email: "paul.pass@spymeo.test",  password: "azerty123", role: "PASS_USER" },
  { id: "p1", name: "Léo Praticien", email: "leo.pro@spymeo.test",  password: "azerty123", role: "PRACTITIONER" },
  { id: "a1", name: "Emma Artisan",  email: "emma.artisan@spymeo.test", password: "azerty123", role: "ARTISAN" },
  { id: "c1", name: "Marc Commerçant", email: "marc.commercant@spymeo.test", password: "azerty123", role: "COMMERÇANT" },
  { id: "t1", name: "Clara Centre", email: "clara.centre@spymeo.test", password: "azerty123", role: "CENTER" },
  { id: "adm", name: "Admin", email: "admin@spymeo.test", password: "admin123", role: "ADMIN" },
];

export function findUserByEmail(email: string) {
  return USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
