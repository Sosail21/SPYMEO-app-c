// src/lib/mockdb/user-practitioners.ts
export type UserPractitioner = {
  id: string;
  name: string;
  slug: string;
  specialties: string[];
  city?: string;
  lastVisitAt?: string; // ISO
  nextAvailable?: string; // ISO
};

export const MOCK_USER_PRACTITIONERS: UserPractitioner[] = [
  {
    id: "pro-1",
    name: "Aline Dupont",
    slug: "aline-dupont",
    specialties: ["Naturopathie", "Réglages alimentaires"],
    city: "Dijon",
    lastVisitAt: "2025-08-28",
    nextAvailable: "2025-09-30T10:00:00Z",
  },
  {
    id: "pro-2",
    name: "Nicolas Perrin",
    slug: "nicolas-perrin",
    specialties: ["Sophrologie"],
    city: "Chenôve",
    lastVisitAt: "2025-07-12",
  },
];
