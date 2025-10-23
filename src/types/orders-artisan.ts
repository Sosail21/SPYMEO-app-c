export interface Order {
  id: string;
  clientId?: string;
  clientName?: string;
  date: string;
  status: "pending" | "processing" | "completed" | "cancelled" | "NEW" | "CONFIRMED" | "DONE" | "CANCELLED";
  total: number;
  items?: OrderItem[];
  ref?: string;
  customerName?: string;
  serviceTitle?: string;
  serviceSlug?: string;
  createdAt?: string;
  priceTTC?: number;
}

export interface OrderItem {
  id: string;
  productId?: string;
  serviceId?: string;
  name: string;
  quantity: number;
  price: number;
}

export type ArtisanOrder = Order;
export type OrderStatus = Order["status"];
