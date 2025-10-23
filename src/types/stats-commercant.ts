export interface StatsPeriod {
  period: string;
  revenue: number;
  orders: number;
  clients: number;
}

export interface Stats {
  kpis: {
    revenueTTC: number;
    ordersCount: number;
    avgBasket: number;
    returningRate: number;
  };
  topProducts: Array<{
    id: string;
    productId: string;
    name: string;
    title: string;
    sales: number;
    qty: number;
    revenue: number;
  }>;
}

export type ShopStats = Stats;
export type CommercantStats = Stats;
