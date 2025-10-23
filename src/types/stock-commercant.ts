export interface StockItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  minQuantity?: number;
  lastRestocked?: string;
}

export interface StockMovement {
  id: string;
  productName: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  date: string;
  ref?: string;
  reason?: string;
}

export type StockMovementType = StockMovement["type"];
