export interface Product {
  id: string;
  name: string;
  title?: string;
  description?: string;
  price: number;
  priceTTC?: number;
  vatRate?: number;
  stock: number;
  sku?: string;
  category?: string;
  slug: string;
  images?: string[];
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  updatedAt?: string;
}

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CommercantProduct = Product;
