// Cdw-Spm
// src/lib/mockdb/stats-commercant.ts

export type KpisCommerce = {
  revenueTTC: number;       // CA TTC sur la période
  ordersCount: number;
  avgBasket: number;        // panier moyen
  returningRate: number;    // % clients récurrents
};

export type TimeseriesPoint = { date: string; value: number };

export type TopProduct = {
  productId: string;
  title: string;
  qty: number;
  revenue: number;
};

export type ShopStats = {
  range: { from: string; to: string }; // ISO
  kpis: KpisCommerce;
  revenueByDay: TimeseriesPoint[];
  ordersByDay: TimeseriesPoint[];
  topProducts: TopProduct[];
};

export const MOCK_STATS_COMMERCANT: ShopStats = {
  range: { from: "2025-08-20", to: "2025-09-19" },
  kpis: {
    revenueTTC: 4820,
    ordersCount: 126,
    avgBasket: 38.25,
    returningRate: 42,
  },
  revenueByDay: [
    { date: "2025-09-10", value: 320 },
    { date: "2025-09-11", value: 540 },
    { date: "2025-09-12", value: 760 },
    { date: "2025-09-13", value: 120 },
    { date: "2025-09-14", value: 0 },
    { date: "2025-09-15", value: 980 },
  ],
  ordersByDay: [
    { date: "2025-09-10", value: 8 },
    { date: "2025-09-11", value: 11 },
    { date: "2025-09-12", value: 15 },
    { date: "2025-09-13", value: 3 },
    { date: "2025-09-14", value: 0 },
    { date: "2025-09-15", value: 19 },
  ],
  topProducts: [
    { productId: "p2", title: "Tisane digestion légère — 20", qty: 46, revenue: 299 },
    { productId: "p1", title: "HE lavande BIO 10ml", qty: 38, revenue: 338 },
    { productId: "p4", title: "Bouillotte graines de lin", qty: 25, revenue: 600 },
  ],
};
