export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  createdAt: string;
  consultations?: Consultation[];
  appointments?: Appointment[];
  antecedents?: string[];
  invoices?: Invoice[];
  docs?: Doc[];
  documents?: Doc[];
  stats?: {
    totalVisits?: number;
    lastVisit?: string;
    totalSpent?: number;
  };
}

export interface Consultation {
  id: string;
  clientId: string;
  date: string;
  notes?: string;
  diagnosis?: string;
  motif?: string;
}

export interface Appointment {
  id: string;
  title: string;
  startAt: string;
  endAt?: string | null;
  status: string;
  description?: string | null;
  location?: string | null;
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: "pending" | "paid" | "cancelled";
  date: string;
}

export interface Doc {
  id: string;
  title: string;
  url?: string;
  createdAt: string;
  type?: string;
  sizeKb?: number;
}
