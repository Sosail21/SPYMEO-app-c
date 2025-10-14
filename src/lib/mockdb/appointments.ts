// Cdw-Spm
// Types & mocks RDV (utilisateurs Free/Pass)

export type Place = "Cabinet" | "Visio" | "Domicile";
export type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "DONE";

export type Appointment = {
  id: string;
  title: string;
  practitionerName: string;
  practitionerSlug: string;
  date: string; // ISO datetime
  durationMin: number;
  place: Place;
  address?: string;
  notesForUser?: string;
  status: AppointmentStatus;
  canCancelUntil?: string; // ISO datetime
  documents?: Array<{ id: string; title: string }>;
};

export const MOCK_APPTS_UPCOMING: Appointment[] = [
  {
    id: "a-2025-10-01-10h",
    title: "Naturopathie — suivi",
    practitionerName: "Aline Dupont",
    practitionerSlug: "aline-dupont",
    date: "2025-10-01T10:00:00Z",
    durationMin: 60,
    place: "Cabinet",
    address: "12 Rue Liberté, 21000 Dijon",
    status: "CONFIRMED",
    canCancelUntil: "2025-09-30T10:00:00Z",
  },
  {
    id: "a-2025-10-12-14h",
    title: "Sophrologie — séance 2",
    practitionerName: "Nicolas Perrin",
    practitionerSlug: "nicolas-perrin",
    date: "2025-10-12T14:00:00Z",
    durationMin: 45,
    place: "Visio",
    status: "CONFIRMED",
    canCancelUntil: "2025-10-11T14:00:00Z",
  },
];

export const MOCK_APPTS_PAST: Appointment[] = [
  {
    id: "a-2025-08-28-14h",
    title: "Sophrologie — 1ère séance",
    practitionerName: "Nicolas Perrin",
    practitionerSlug: "nicolas-perrin",
    date: "2025-08-28T14:00:00Z",
    durationMin: 45,
    place: "Visio",
    status: "DONE",
    documents: [{ id: "doc-001", title: "Conseils post-séance (PDF)" }],
  },
];

export function getAppointmentById(id: string) {
  return [...MOCK_APPTS_UPCOMING, ...MOCK_APPTS_PAST].find((a) => a.id === id) || null;
}
