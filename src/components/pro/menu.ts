

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
    { label: "Ma fiche", href: "/pro/commun/fiche", icon: "🧾" },
    { label: "SPYM'Com", href: "/pro/commun/spymcom", icon: "💬" },
    { label: "Répertoire SPYMEO", href: "/pro/commun/repertoire/spymeo", icon: "🔎" },
    { label: "Répertoire perso", href: "/pro/commun/repertoire/perso", icon: "📒" },
    { label: "Notes", href: "/pro/commun/notes", icon: "📝" },
    { label: "Messagerie", href: "/pro/commun/messages", icon: "✉️" },

    // 👇 Nouveaux espaces
    { label: "Avantages", href: "/pro/commun/avantages", icon: "🎁" },
    { label: "PASS Partenaire", href: "/pro/commun/pass-partenaire", icon: "🔖" },
  ],

  practitioner: [
    { label: "Agenda / RDV", href: "/pro/praticien/agenda", icon: "📆" },
    { label: "Fiches clients", href: "/pro/praticien/fiches-clients", icon: "👤" },
    { label: "Statistiques", href: "/pro/praticien/statistiques", icon: "📈" },
    { label: "Pré-compta", href: "/pro/praticien/precompta", icon: "📚" },
    { label: "Évènements", href: "/pro/praticien/evenements", icon: "📣" },
    { label: "Académie", href: "/pro/praticien/academie", icon: "🎓" },
    { label: "Blog (proposer)", href: "/pro/praticien/blog-proposer", icon: "✍️" },
    { label: "Ressources", href: "/pro/praticien/ressources", icon: "📦" },
    { label: "Cabinet partagé", href: "/pro/praticien/cabinet-partage", icon: "🏥" },
    { label: "Impact", href: "/pro/praticien/impact", icon: "🌍" },
  ],

  artisan: [
    { label: "Catalogue services", href: "/pro/artisan/catalogue/services", icon: "🧰" },
    { label: "Nouveau service", href: "/pro/artisan/catalogue/services/nouveau", icon: "➕" },
    { label: "Commandes", href: "/pro/artisan/ventes/commandes", icon: "🧾" },
    { label: "Clients", href: "/pro/artisan/clients", icon: "👥" },
    { label: "Statistiques", href: "/pro/artisan/statistiques", icon: "📈" },
    { label: "Pré-compta", href: "/pro/artisan/precompta", icon: "📚" },
  ],

  comm: [
    { label: "Catalogue",   href: "/pro/commercants/produits",        icon: "🛍️" },
    { label: "Nouveau",     href: "/pro/commercants/produits/nouveau", icon: "➕" },
    { label: "Commandes",   href: "/pro/commercants/commandes",       icon: "📦" },
    { label: "Stock",       href: "/pro/commercants/stock",           icon: "🏷️" },
    { label: "Clients",     href: "/pro/commercants/clients",         icon: "👥" },
    { label: "Statistiques",href: "/pro/commercants/statistiques",    icon: "📈" },
    { label: "Pré-compta",  href: "/pro/commercants/pre-compta",      icon: "📚" },
  ],

  center: [
    { label: "Formations", href: "/pro/centres/formations", icon: "🎓" },
    { label: "Nouvelle formation", href: "/pro/centres/formations/nouvelle", icon: "➕" },
    { label: "Sessions & Inscriptions", href: "/pro/centres/formations/sessions", icon: "🗓️" },
    { label: "Apprenants", href: "/pro/centres/apprenants", icon: "👥" },
    { label: "Statistiques", href: "/pro/centres/statistiques", icon: "📈" },
    { label: "Pré-compta", href: "/pro/centres/precompta", icon: "📚" },
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