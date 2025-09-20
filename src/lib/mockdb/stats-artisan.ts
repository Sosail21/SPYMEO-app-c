// src/lib/mockdb/stats-artisan.ts
// Indicateurs clés et tendance (placeholder chart-ready).

export type ArtisanStats = {
  period: "7d" | "30d" | "90d";
  kpi: {
    revenue: number;     // CA TTC
    orders: number;      // nb commandes
    avgBasket: number;   // panier moyen
    newClients: number;  // nouveaux clients
  };
  trend: Array<{ date: string; revenue: number; orders: number }>;
};

export const MOCK_STATS_ARTISAN: ArtisanStats = {
  period: "30d",
  kpi: {
    revenue: 4120,
    orders: 26,
    avgBasket: Math.round(4120 / 26),
    newClients: 7,
  },
  trend: [
    { date: "2025-08-25", revenue: 120, orders: 1 },  // petite vente (bijou simple)
    { date: "2025-08-28", revenue: 380, orders: 2 },  // atelier + accessoire cuir
    { date: "2025-09-02", revenue: 220, orders: 1 },  // objet déco métal
    { date: "2025-09-06", revenue: 640, orders: 3 },  // 2 ateliers + acompte restauration
    { date: "2025-09-10", revenue: 780, orders: 5 },
    { date: "2025-09-14", revenue: 920, orders: 6 },
    { date: "2025-09-18", revenue: 1060, orders: 8 },
  ],
};
