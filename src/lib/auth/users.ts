// ⚠️ MOCK ONLY — à remplacer par NextAuth / backend plus tard
export type Role = "FREE_USER" | "PASS_USER" | "PRACTITIONER" | "ADMIN";
export type User = { email: string; password: string; name: string; role: Role; plan?: "free"|"pass" };

export const MOCK_USERS: User[] = [
  { email: "alice.free@spymeo.test", password: "azerty123", name: "Alice", role: "FREE_USER", plan: "free" },
  { email: "paul.pass@spymeo.test",  password: "azerty123", name: "Paul",  role: "PASS_USER",  plan: "pass" },
  { email: "leo.pro@spymeo.test",    password: "azerty123", name: "Léo",   role: "PRACTITIONER" },
  { email: "admin@spymeo.test",      password: "admin123",  name: "Admin", role: "ADMIN" },
];

export function verifyCredentials(email: string, password: string) {
  const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!found) return null;
  const { password: _, ...safe } = found;
  return safe;
}
