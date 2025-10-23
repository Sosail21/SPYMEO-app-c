export type ServiceStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Service {
  id: string;
  name: string;
  title?: string;
  slug?: string;
  description?: string;
  duration?: number;
  durationMin?: number;
  price: number;
  priceTTC?: number;
  category?: string;
  available: boolean;
  status?: ServiceStatus;
  updatedAt?: string;
  createdAt?: string;
}

export type ServiceItem = Service;
