export interface Order {
  id: string;
  clientId?: string;
  clientName?: string;
  date: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "SHIPPED";
  total: number;
  items?: OrderItem[];
  amount?: number;
  customer?: string;
  email?: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  productId?: string;
  serviceId?: string;
  name: string;
  quantity: number;
  qty?: number;
  price: number;
}

export type OrderDetail = Order;
export type OrderStatus = Order["status"];
export type CommercantOrder = Order;
