// Cdw-Spm
// src/lib/mockdb/orders-artisan.ts
// Commandes/commissions liées aux services artisanaux.

export type OrderStatus = "NEW" | "CONFIRMED" | "DONE" | "CANCELLED";

export type ArtisanOrder = {
  id: string;
  ref: string;              // réf facture/commande
  createdAt: string;        // ISO
  customerId: string;
  customerName: string;
  serviceSlug: string;
  serviceTitle: string;
  priceTTC: number;
  status: OrderStatus;
  note?: string;
  scheduledAt?: string;     // ISO (RDV atelier / livraison)
};

export const MOCK_ORDERS_ARTISAN: ArtisanOrder[] = [
  {
    id: "o1",
    ref: "ART-2025-01024",
    createdAt: "2025-09-17T09:12:00Z",
    customerId: "cl1",
    customerName: "Alice Martin",
    serviceSlug: "atelier-maroquinerie-pochette-cuir-vegetal",
    serviceTitle: "Atelier maroquinerie — pochette en cuir végétal",
    priceTTC: 95,
    status: "NEW",
    scheduledAt: "2025-09-28T13:00:00Z",
  },
  {
    id: "o2",
    ref: "ART-2025-01012",
    createdAt: "2025-09-15T14:30:00Z",
    customerId: "cl2",
    customerName: "Marc Dupont",
    serviceSlug: "restauration-fauteuil-cabriolet",
    serviceTitle: "Restauration de fauteuil cabriolet (tapissier)",
    priceTTC: 280,
    status: "CONFIRMED",
    note: "Tissu lin fourni par le client.",
  },
  {
    id: "o3",
    ref: "ART-2025-00988",
    createdAt: "2025-09-10T10:05:00Z",
    customerId: "cl3",
    customerName: "Sophie Leroy",
    serviceSlug: "objet-deco-metal-fer-forge",
    serviceTitle: "Objet déco en métal — fer forgé (pièce décorative)",
    priceTTC: 220,
    status: "DONE",
  },
  {
    id: "o4",
    ref: "ART-2025-00970",
    createdAt: "2025-09-08T11:40:00Z",
    customerId: "cl4",
    customerName: "Inès Robert",
    serviceSlug: "creation-bijou-unique-argent-recycle",
    serviceTitle: "Création bijou unique — argent recyclé",
    priceTTC: 150,
    status: "CANCELLED",
    note: "Reporté à une date ultérieure.",
  },
];
