// src/lib/validation/profile.ts
import { z } from "zod";

export const profileSchema = z.object({
  userId: z.string().optional(),
  firstName: z.string().max(80).optional().nullable(),
  lastName: z.string().max(80).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  companyName: z.string().max(120).optional().nullable(),
  siret: z.string().max(20).optional().nullable(),
  addressLine1: z.string().max(160).optional().nullable(),
  addressLine2: z.string().max(160).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  iban: z.string().max(40).optional().nullable(),
  role: z.enum(["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER", "FREE_USER", "PASS_USER", "ADMIN"]).optional(),
  plan: z.enum(["FREE", "PASS", "PRO"]).optional(),
  renewal: z.enum(["MONTHLY", "ANNUAL"]).optional(),
  coupon: z.string().max(40).nullable().optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;
