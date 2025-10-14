// Cdw-Spm
export type Advantage = {
  id: string;
  userId: string;
  title: string;
  type: "REDUCTION" | "ECHANGE" | "INVITATION";
  description?: string;
  percentage?: number; // pour réduction
  createdAt: string;
  active: boolean;
};

export type Opportunity = {
  id: string;
  kind: "EMPLOI" | "INTERVENTION_B2B";
  title: string;
  company: string;
  location?: string;
  description: string;
  applyUrl?: string; // si externe
  createdAt: string;
  open: boolean;
};

export type PassPartner = {
  userId: string;
  enabled: boolean;
  rate: 5 | 10 | 15 | 20 | 25 | 30; // % de réduction pour membres PASS
};

const advantages = new Map<string, Advantage[]>(); // key: userId
const opportunities = new Map<string, Opportunity>(); // global
const passPartners = new Map<string, PassPartner>();

// seed opportunités (publié par SPYMEO)
(function seed() {
  const o1: Opportunity = {
    id: "op_001",
    kind: "INTERVENTION_B2B",
    title: "Atelier bien-être en entreprise",
    company: "SPYMEO",
    location: "Dijon / Remote",
    description: "Sessions de 2h – posture, respiration, prévention stress.",
    createdAt: new Date().toISOString(),
    open: true,
  };
  const o2: Opportunity = {
    id: "op_002",
    kind: "EMPLOI",
    title: "Chargé(e) d’ateliers nutrition",
    company: "SPYMEO",
    location: "Lyon",
    description: "Interventions hebdomadaires dans des écoles.",
    createdAt: new Date().toISOString(),
    open: true,
  };
  opportunities.set(o1.id, o1);
  opportunities.set(o2.id, o2);
})();

// 👉 seed PASS partenaire pour le userId test
passPartners.set("p1", { userId: "p1", enabled: true, rate: 15 });
passPartners.set("c1", { userId: "c1", enabled: true, rate: 10 });
passPartners.set("t1", { userId: "t1", enabled: true, rate: 15 });
passPartners.set("a1", { userId: "a1", enabled: true, rate: 15 });

export async function listAdvantages(userId: string) {
  return advantages.get(userId) ?? [];
}

export async function createAdvantage(userId: string, data: Omit<Advantage,"id"|"userId"|"createdAt">) {
  const list = advantages.get(userId) ?? [];
  const adv: Advantage = {
    ...data,
    id: "adv_" + Date.now(),
    userId,
    createdAt: new Date().toISOString(),
  };
  list.unshift(adv);
  advantages.set(userId, list);
  return adv;
}

export async function toggleAdvantage(userId: string, id: string, active: boolean) {
  const list = advantages.get(userId) ?? [];
  const idx = list.findIndex(a => a.id === id);
  if (idx >= 0) list[idx].active = active;
  advantages.set(userId, list);
  return list[idx];
}

export async function listOpportunities() {
  return Array.from(opportunities.values()).filter(o => o.open);
}

export async function createCandidature(userId: string, opportunityId: string, message?: string) {
  // ici tu persistes la candidature; on mock un ACK
  return { ok: true, userId, opportunityId, message };
}

export async function getPassPartner(userId: string): Promise<PassPartner> {
  return passPartners.get(userId) ?? { userId, enabled: false, rate: 10 };
}

export async function updatePassPartner(userId: string, enabled: boolean, rate: PassPartner["rate"]) {
  const next = { userId, enabled, rate };
  passPartners.set(userId, next);
  return next;
}