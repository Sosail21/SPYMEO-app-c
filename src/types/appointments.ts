export interface Appointment {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  practitionerId?: string;
  practitionerName?: string;
  practitionerSlug?: string;
  practitionerPhoto?: string;
  practitionerEmail?: string;
  practitionerPhone?: string;
  status: "upcoming" | "past" | "cancelled" | "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  location?: string;
  notes?: string;
  description?: string;
  durationMin?: number;
  place?: string;
  address?: string;
  canCancelUntil?: string;
  canCancel?: boolean;
  notesForUser?: string;
  visioLink?: string;
  documents?: Array<{
    id: string;
    title: string;
  }>;
}
