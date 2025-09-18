

export type Role = "PRACTITIONER" | "ARTISAN" | "COMMERCANT" | "CENTER";
export type MenuItem = { label: string; href: string; icon?: string };

export function normalizeRole(role?: string) {
  const r = (role || "").trim().toUpperCase();
  if (["MERCHANT","SHOP","RETAIL","COMMERÇANT","COMMERCE"].includes(r)) return "COMMERCANT";
  if (["PRACTITIONER","PRATICIEN","THERAPIST","PRO"].includes(r)) return "PRACTITIONER";
  if (["ARTISAN","CRAFT","MAKER"].includes(r)) return "ARTISAN";
  if (["CENTER","FORMATION","TRAINING_CENTER","CENTRE"].includes(r)) return "CENTER";
  return r as Role;
}

type RoleMenus = {
  common: MenuItem[];
  practitioner: MenuItem[];
  artisan: MenuItem[];
  comm: MenuItem[];
  center: MenuItem[];
};

export const MENUS: RoleMenus = {
  common: [
    { label: "Tableau de bord", href: "/pro/dashboard", icon: "🏠" },
    { label: "Ma fiche", href: "/pro/fiche", icon: "🧾" },
    { label: "SPYM'Com", href: "/pro/spymcom", icon: "💬" },
    { label: "Répertoire SPYMEO", href: "/pro/repertoire/spymeo", icon: "🔎" },
    { label: "Répertoire perso", href: "/pro/repertoire/perso", icon: "📒" },
    { label: "Notes", href: "/pro/notes", icon: "📝" },
    { label: "Messagerie", href: "/pro/messages", icon: "✉️" },

    // 👇 Nouveaux espaces
    { label: "Avantages", href: "/pro/avantages", icon: "🎁" },
    { label: "PASS Partenaire", href: "/pro/pass-partenaire", icon: "🔖" },
  ],

  practitioner: [
    { label: "Agenda / RDV", href: "/pro/agenda", icon: "📆" },
    { label: "Fiches clients", href: "/pro/fiches-clients", icon: "👤" },
    { label: "Statistiques", href: "/pro/statistiques", icon: "📈" },
    { label: "Pré-compta", href: "/pro/precompta", icon: "📚" },
    { label: "Évènements", href: "/pro/evenements", icon: "📣" },
    { label: "Académie", href: "/pro/academie", icon: "🎓" },
    { label: "Blog (proposer)", href: "/pro/blog-proposer", icon: "✍️" },
    { label: "Ressources", href: "/pro/ressources", icon: "📦" },
    { label: "Cabinet partagé", href: "/pro/cabinet-partage", icon: "🏥" },
    { label: "Impact", href: "/pro/impact", icon: "🌍" },
  ],

  artisan: [
    { label: "Catalogue services", href: "/pro/catalogue/services", icon: "🧰" },
    { label: "Nouveau service", href: "/pro/catalogue/services/nouveau", icon: "➕" },
    { label: "Commandes", href: "/pro/ventes/commandes", icon: "🧾" },
    { label: "Clients", href: "/pro/clients", icon: "👥" },
    { label: "Statistiques", href: "/pro/statistiques", icon: "📈" },
    { label: "Pré-compta", href: "/pro/precompta", icon: "📚" },
  ],

  comm: [
    { label: "Catalogue produits", href: "/pro/catalogue", icon: "🛍️" },
    { label: "Nouveau produit", href: "/pro/catalogue/nouveau-produit", icon: "➕" },
    { label: "Commandes", href: "/pro/ventes/commandes", icon: "🧾" },
    { label: "Stock", href: "/pro/stock", icon: "📦" },
    { label: "Clients", href: "/pro/clients", icon: "👥" },
    { label: "Statistiques", href: "/pro/statistiques", icon: "📈" },
    { label: "Pré-compta", href: "/pro/precompta", icon: "📚" },
  ],

  center: [
    { label: "Formations", href: "/pro/formations", icon: "🎓" },
    { label: "Nouvelle formation", href: "/pro/formations/nouvelle", icon: "➕" },
    { label: "Sessions & Inscriptions", href: "/pro/formations/sessions", icon: "🗓️" },
    { label: "Apprenants", href: "/pro/apprenants", icon: "👥" },
    { label: "Statistiques", href: "/pro/statistiques", icon: "📈" },
    { label: "Pré-compta", href: "/pro/precompta", icon: "📚" },
  ],
};

export function itemsForRole(role?: string) {
  const r = normalizeRole(role);
  const specific =
    r === "PRACTITIONER" ? MENUS.practitioner :
    r === "ARTISAN" ? MENUS.artisan :
    r === "COMMERCANT" ? MENUS.comm :
    r === "CENTER" ? MENUS.center : [];

  const specificTitle =
    r === "PRACTITIONER" ? "Praticien" :
    r === "ARTISAN" ? "Artisan" :
    r === "COMMERCANT" ? "Commerçant" :
    r === "CENTER" ? "Centre de formation" : "Rôle";

  return { common: MENUS.common, specific, specificTitle };
}