export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  practitionerId?: string;
  practitionerName?: string;
  practitionerSlug?: string;
  status: "upcoming" | "past" | "cancelled";
  location?: string;
  notes?: string;
  durationMin?: number;
  place?: string;
  address?: string;
  canCancelUntil?: string;
  notesForUser?: string;
  documents?: Array<{
    id: string;
    title: string;
  }>;
}
