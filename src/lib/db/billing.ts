export type PaymentMethod = { brand: string; last4: string; expMonth: number; expYear: number };
export type Invoice = { id: string; date: string; amount: number; description: string; status: "paid" | "open" | "void"; pdfUrl: string };
export type BillingState = {
  userId: string;
  plan: "FREE" | "PASS" | "PRO";
  renewal: "MONTHLY" | "ANNUAL";
  memberSince: string;
  cancelAtPeriodEnd?: boolean;
  pause?: { used: boolean; active: boolean; until?: string };
  paymentMethod?: PaymentMethod | null;
  invoices: Invoice[];
};

const store = new Map<string, BillingState>();

function seed(userId: string): BillingState {
  const seeded: BillingState = {
    userId,
    plan: "PASS",
    renewal: "MONTHLY",
    memberSince: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    paymentMethod: { brand: "visa", last4: "4242", expMonth: 12, expYear: 28 },
    invoices: [
      { id: "inv_001", date: new Date().toISOString(), amount: 2100, description: "PASS mensuel", status: "paid", pdfUrl: "/files/invoices/inv_001.pdf" },
    ],
  };
  store.set(userId, seeded);
  return seeded;
}

export async function getBillingForUser(userId: string): Promise<BillingState> {
  return store.get(userId) ?? seed(userId);
}

export async function updatePaymentMethod(userId: string, pm: PaymentMethod): Promise<BillingState> {
  const b = await getBillingForUser(userId);
  const next = { ...b, paymentMethod: pm };
  store.set(userId, next);
  return next;
}

export async function updatePlan(userId: string, plan: "FREE" | "PASS" | "PRO", renewal: "MONTHLY" | "ANNUAL"): Promise<BillingState> {
  const b = await getBillingForUser(userId);
  const next: BillingState = { ...b, plan, renewal, cancelAtPeriodEnd: false };
  store.set(userId, next);
  return next;
}

export async function pausePlanOnce(userId: string): Promise<BillingState> {
  const b = await getBillingForUser(userId);
  if (b.pause?.used) throw new Error("already_used");
  const until = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const next: BillingState = { ...b, pause: { used: true, active: true, until } };
  store.set(userId, next);
  return next;
}

export async function cancelAtPeriodEnd(userId: string): Promise<BillingState> {
  const b = await getBillingForUser(userId);
  const next = { ...b, cancelAtPeriodEnd: true };
  store.set(userId, next);
  return next;
}

export async function deleteAllForUser(userId: string) {
  store.delete(userId);
}
