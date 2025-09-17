// src/lib/db/profiles.ts
export type Profile = {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  website?: string;
  companyName?: string;
  siret?: string;
  addressLine1?: string;
  addressLine2?: string;
  zip?: string;
  city?: string;
  country?: string;
  iban?: string;
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
