// Cdw-Spm
// Mocks PASS (utilisateur) — Free à remplacer par vraie source plus tard.

export type PassPlan = "ANNUAL" | "MONTHLY";
export type PassResourceType = "PODCAST" | "BOOKLET" | "VIDEO";

export type PassResource = {
  id: string;
  title: string;
  type: PassResourceType;
  month: string; // YYYY-MM (mois d'attribution)
  description?: string;
  url?: string; // streaming / lecture / écoute
  availableFrom: string; // ISO date (déblocage)
};

export type PassDiscount = {
  id: string;
  kind: "Praticien" | "Commerçant" | "Artisan" | "Centre";
  name: string;
  city?: string;
  rate: number; // % de remise
  href: string; // fiche publique
};

export type CarnetShipmentStatus = "NOT_ELIGIBLE" | "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";

export type PassSnapshot = {
  active: boolean;
  plan: PassPlan;
  startedAt: string;       // ISO
  nextBillingAt?: string;  // ISO (mensuel)
  monthsPaid: number;      // cumulé
  resources: PassResource[];
  discounts: PassDiscount[];
  carnet: {
    status: CarnetShipmentStatus;
    note?: string;
    eta?: string; // ISO date estimée si dispo
  };
};

// —————————————————————————————————————————————————————————————
// Helpers de calcul pour le carnet selon le plan & l’historique
// —————————————————————————————————————————————————————————————
export function computeCarnetStatus(plan: PassPlan, active: boolean, monthsPaid: number): CarnetShipmentStatus {
  if (!active) return "NOT_ELIGIBLE";
  if (plan === "ANNUAL") {
    // Envoi direct à l’activation
    // PENDING -> PROCESSING -> SHIPPED -> DELIVERED : on simule PENDING pour l’instant
    return "PENDING";
  }
  // Mensuel : éligible après 6 mois pleins
  return monthsPaid >= 6 ? "PENDING" : "NOT_ELIGIBLE";
}

// —————————————————————————————————————————————————————————————
// MOCK principal
// —————————————————————————————————————————————————————————————
export const MOCK_PASS_SNAPSHOT: PassSnapshot = {
  active: true,
  plan: "MONTHLY",
  startedAt: "2025-04-05T10:00:00Z",
  nextBillingAt: "2025-10-05T10:00:00Z",
  monthsPaid: 5, // change à 6+ pour voir le carnet passer en PENDING
  resources: [
    {
      id: "res-2025-04",
      title: "Podcast — Respiration & système nerveux",
      type: "PODCAST",
      month: "2025-04",
      description: "Techniques simples pour réguler le stress.",
      url: "/media/podcast/respiration.mp3",
      availableFrom: "2025-04-01",
    },
    {
      id: "res-2025-05",
      title: "Livret — Cuisine anti-inflammatoire (PDF)",
      type: "BOOKLET",
      month: "2025-05",
      description: "Recettes & principes de base.",
      url: "/media/livret/cuisine-anti-inflammatoire.pdf",
      availableFrom: "2025-05-01",
    },
    {
      id: "res-2025-06",
      title: "Vidéo — Sommeil & rituel du soir",
      type: "VIDEO",
      month: "2025-06",
      description: "30 min pour structurer un rituel efficace.",
      url: "/media/video/sommeil-rituel.mp4",
      availableFrom: "2025-06-01",
    },
    {
      id: "res-2025-09",
      title: "Podcast — Douleurs chroniques : bouger sans s’abîmer",
      type: "PODCAST",
      month: "2025-09",
      description: "Micro-actions au quotidien.",
      url: "/media/podcast/douleurs-chroniques.mp3",
      availableFrom: "2025-09-01",
    },
  ],
  discounts: [
    { id: "d1", kind: "Praticien", name: "Aline Dupont (Naturopathe)", city: "Dijon", rate: 15, href: "/praticien/aline-dupont" },
    { id: "d2", kind: "Commerçant", name: "Épicerie Locale", city: "Quetigny", rate: 12, href: "/commercant/epicerie-locale" },
    { id: "d3", kind: "Artisan", name: "Atelier Savon", city: "Beaune", rate: 10, href: "/artisan/atelier-savon" },
    { id: "d4", kind: "Centre", name: "Centre de formation Soma", city: "Talant", rate: 8, href: "/centre/soma" },
  ],
  carnet: {
    status: "NOT_ELIGIBLE",
    note: "Le carnet est envoyé après 6 mois de cotisation en mensuel, ou immédiatement en annuel.",
  },
};

// —————————————————————————————————————————————————————————————
// Adaptation dynamique du carnet dans le mock (pour la démo)
// —————————————————————————————————————————————————————————————
export function withComputedCarnet(snapshot: PassSnapshot): PassSnapshot {
  const status = computeCarnetStatus(snapshot.plan, snapshot.active, snapshot.monthsPaid);
  const out: PassSnapshot = {
    ...snapshot,
    carnet: {
      ...snapshot.carnet,
      status,
      note:
        snapshot.plan === "ANNUAL"
          ? "Votre PASS annuel inclut l’envoi immédiat du Carnet de vie."
          : snapshot.monthsPaid >= 6
          ? "Vous avez atteint 6 mois de cotisation : le carnet est en préparation."
          : `Encore ${Math.max(0, 6 - snapshot.monthsPaid)} mois pour débloquer l’envoi du carnet.`,
      eta: status === "PENDING" ? "2025-10-10T10:00:00Z" : undefined,
    },
  };
  return out;
}
