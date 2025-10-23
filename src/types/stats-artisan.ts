export interface StatsPeriod {
  period: string;
  revenue: number;
  orders: number;
  clients: number;
}

export interface Stats {
  kpi: {
    revenue: number;
    orders: number;
    avgBasket: number;
    newClients: number;
  };
}

export type ArtisanStats = Stats;
