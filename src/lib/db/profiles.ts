// Cdw-Spm
// src/lib/db/profiles.ts
export type Profile = {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  website?: string | null;
  companyName?: string | null;
  siret?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  zip?: string | null;
  city?: string | null;
  country?: string | null;
  iban?: string | null;
  role?: "PRACTITIONER" | "ARTISAN" | "COMMERCANT" | "CENTER" | "FREE_USER" | "PASS_USER" | "ADMIN";
  plan?: "FREE" | "PASS" | "PRO";
  renewal?: "MONTHLY" | "ANNUAL";
  coupon?: string | null;
};

const store = new Map<string, Profile>();

export async function getProfileByUserId(userId: string): Promise<Profile> {
  if (!store.has(userId)) {
    store.set(userId, { userId, plan: "FREE", renewal: "ANNUAL" });
  }
  return store.get(userId)!;
}

export async function upsertProfile(userId: string, data: Profile): Promise<Profile> {
  const current = await getProfileByUserId(userId);
  const next = { ...current, ...data, userId };
  store.set(userId, next);
  return next;
}
