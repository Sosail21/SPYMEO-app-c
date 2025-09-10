export type Item = { label: string; href: string; icon?: string };

export const COMMON: Item[] = [
  { label: "Tableau de bord", href: "/pro/dashboard", icon: "🏠" },
  { label: "Ma fiche", href: "/pro/fiche", icon: "🗂️" },
  { label: "SPYM'Com", href: "/pro/spymcom", icon: "💬" },
  { label: "Répertoire SPYMEO", href: "/pro/repertoire/spymeo", icon: "📇" },
  { label: "Répertoire perso", href: "/pro/repertoire/perso", icon: "📒" },
  { label: "Notes", href: "/pro/notes", icon: "📝" },
  { label: "Messages", href: "/pro/messages", icon: "💬" },
];

export const PRACTITIONER: Item[] = [
  { label: "Agenda / RDV", href: "/pro/agenda", icon: "📅" },
  { label: "Fiches clients", href: "/pro/fiches-clients", icon: "👤" },
  { label: "Statistiques", href: "/pro/statistiques", icon: "📊" },
  { label: "Pré-compta", href: "/pro/precompta", icon: "💼" },
  { label: "Évènements", href: "/pro/evenements", icon: "📣" },
  { label: "Académie", href: "/pro/academie", icon: "🎓" },
  { label: "Proposer un article", href: "/pro/blog-proposer", icon: "📰" },
  { label: "Ressources", href: "/pro/ressources", icon: "📚" },
  { label: "Cabinet partagé", href: "/pro/cabinet-partage", icon: "🏢" },
];

export const MERCHANT_CENTER: Item[] = [
  { label: "Catalogue", href: "/pro/catalogue", icon: "🛍️" },
  { label: "Nouveau produit", href: "/pro/catalogue/nouveau-produit", icon: "➕" },
  { label: "Nouvelle formation", href: "/pro/catalogue/nouvelle-formation", icon: "🎟️" },
];

export function itemsForRole(role?: string): { common: Item[]; specific: Item[]; specificTitle?: string } {
  if (role === "PRACTITIONER") {
    return { common: COMMON, specific: PRACTITIONER, specificTitle: "Praticien" };
  }
  if (role === "ARTISAN" || role === "COMMERÇANT" || role === "CENTER") {
    return { common: COMMON, specific: MERCHANT_CENTER, specificTitle: "Catalogue & Formations" };
  }
  if (role === "ADMIN") {
    return { common: COMMON, specific: [], specificTitle: "Admin" };
  }
  return { common: COMMON, specific: [] };
}
