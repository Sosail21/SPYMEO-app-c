export type PassPlan = "ANNUAL" | "MONTHLY";

export type CarnetShipmentStatus =
  | "NOT_ELIGIBLE"
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED";

export type ResourceType = "PODCAST" | "BOOKLET" | "VIDEO";

export interface PassResource {
  id: string;
  month: string;
  title: string;
  description?: string;
  type: ResourceType;
  url?: string;
}

export interface PassDiscount {
  id: string;
  name: string;
  kind: string;
  city?: string;
  rate: number;
  href: string;
}

export interface CarnetInfo {
  status: CarnetShipmentStatus;
  note?: string;
  eta?: string;
}

export interface PassSnapshot {
  active: boolean;
  plan: PassPlan;
  startedAt: string;
  nextBillingAt?: string;
  monthsPaid: number;
  resources: PassResource[];
  discounts: PassDiscount[];
  carnet: CarnetInfo;
}

export function withComputedCarnet(snap: PassSnapshot): PassSnapshot {
  // Empty implementation for now
  return snap;
}
