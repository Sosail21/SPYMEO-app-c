// src/lib/mockdb/services-artisan.ts
// Services artisanaux : ateliers, restauration, créations sur-mesure éthiques & éco-responsables.

export type ServiceStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ServiceItem = {
  id: string;
  slug: string;
  title: string;
  category?: string;      // ex: "Cuir", "Textile", "Bois", "Métal", "Upcycling"
  durationMin?: number;   // durée indicative d’une prestation/atelier
  priceTTC: number;       // prix d’appel TTC
  vatRate: number;        // TVA (%)
  status: ServiceStatus;
  updatedAt?: string;     // ISO
  description?: string;
};

export const MOCK_SERVICES_ARTISAN: ServiceItem[] = [
  {
    id: "a1",
    slug: "atelier-maroquinerie-pochette-cuir-vegetal",
    title: "Atelier maroquinerie — pochette en cuir végétal",
    category: "Cuir",
    durationMin: 180,
    priceTTC: 95,
    vatRate: 20,
    status: "PUBLISHED",
    updatedAt: "2025-09-18",
    description:
      "Initiez-vous à la coupe, teinture naturelle et couture main (point sellier) pour réaliser une pochette en cuir tannage végétal. Matériaux responsables fournis.",
  },
  {
    id: "a2",
    slug: "restauration-fauteuil-cabriolet",
    title: "Restauration de fauteuil cabriolet (tapissier)",
    category: "Textile",
    durationMin: 360,
    priceTTC: 280,
    vatRate: 20,
    status: "PUBLISHED",
    updatedAt: "2025-09-16",
    description:
      "Dégarnissage partiel, sanglage, mousse/ressorts selon état, pose tissu lin/coton labellisé. Devis précis après diagnostic.",
  },
  {
    id: "a3",
    slug: "creation-bijou-unique-argent-recycle",
    title: "Création bijou unique — argent recyclé",
    category: "Bijou",
    durationMin: 120,
    priceTTC: 150,
    vatRate: 20,
    status: "DRAFT",
    updatedAt: "2025-09-14",
    description:
      "Co-conception et fabrication artisanale d’une bague/pendentif en argent recyclé. Options pierres éthiques (sur devis).",
  },
  {
    id: "a4",
    slug: "objet-deco-metal-fer-forge",
    title: "Objet déco en métal — fer forgé (pièce décorative)",
    category: "Métal",
    durationMin: 240,
    priceTTC: 220,
    vatRate: 20,
    status: "PUBLISHED",
    updatedAt: "2025-09-12",
    description:
      "Fabrication d’un objet décoratif en fer forgé (bougeoir, support plante, patère). Zéro armement, uniquement déco & utilitaire.",
  },
  {
    id: "a5",
    slug: "atelier-upcycling-lampe-bocaux",
    title: "Atelier upcycling — lampe à partir de bocaux",
    category: "Upcycling",
    durationMin: 150,
    priceTTC: 75,
    vatRate: 20,
    status: "ARCHIVED",
    updatedAt: "2025-06-05",
    description:
      "Conception d’une lampe à partir de contenants récupérés (bocaux/verre), câblage sécurisé et abat-jour en lin.",
  },
];
