export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderAt?: string;
  ordersCount?: number;
}

export type ArtisanClient = Client;
