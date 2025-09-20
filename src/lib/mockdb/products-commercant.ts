// src/lib/mockdb/products-commercant.ts

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type Product = {
  id: string;
  title: string;
  slug: string;
  priceTTC: number;   // €
  vatRate: number;    // ex: 20
  stock?: number;
  sku?: string;
  category?: string;
  status: ProductStatus;
  updatedAt?: string; // ISO
  description?: string;
};

export const MOCK_PRODUCTS_COMMERCANT: Product[] = [
  {
    id: "p1",
    title: "Huile essentielle de lavande BIO 10ml",
    slug: "huile-essentielle-lavande-10ml",
    priceTTC: 8.9,
    vatRate: 20,
    stock: 12,
    sku: "HE-LAV-10",
    category: "Aromathérapie",
    status: "PUBLISHED",
    updatedAt: "2025-09-01",
    description: "Lavandula angustifolia, agriculture biologique. Usage externe.",
  },
  {
    id: "p2",
    title: "Tisane digestion légère — 20 sachets",
    slug: "tisane-digestion-legere-20",
    priceTTC: 6.5,
    vatRate: 5.5,
    stock: 2,
    sku: "TI-DIG-20",
    category: "Infusions",
    status: "PUBLISHED",
    updatedAt: "2025-09-10",
  },
  {
    id: "p3",
    title: "Baume respiratoire mentholé 50ml",
    slug: "baume-respiratoire-50ml",
    priceTTC: 12,
    vatRate: 20,
    stock: 0,
    sku: "BA-RES-50",
    category: "Soins",
    status: "DRAFT",
  },
  {
    id: "p4",
    title: "Bouillotte graines de lin",
    slug: "bouillotte-graines-lin",
    priceTTC: 24,
    vatRate: 20,
    stock: 8,
    sku: "BO-LIN",
    category: "Accessoires",
    status: "ARCHIVED",
    updatedAt: "2025-07-20",
  },
];
