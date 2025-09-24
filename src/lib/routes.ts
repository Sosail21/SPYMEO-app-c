// src/lib/routes.ts
// Cdw-Spm — Routes canoniques PUBLIC/PRO/ADMIN + RBAC minimal

export type Role =
  | "ADMIN"
  | "PRACTITIONER"
  | "ARTISAN"
  | "COMMERCANT"
  | "CENTER"
  | "PASS_USER"
  | "FREE_USER"
  | "AMBASSADOR"
  | "PARTNER"
  | "PUBLIC";

export type RouteEntry = {
  path: string;             // peut accepter :slug / :id / :sessionId pour les détails
  roles: Role[];            // accès autorisés
  titleKey: string;         // i18n key
  breadcrumb?: string[];    // i18n keys pour fil d’Ariane
  feature?: string;         // tag fonctionnel (analytics/flags)
  public?: boolean;         // accessible sans session
};

// IMPORTANT
// - PUBLIC: listes en pluriel, fiches en singulier
// - PRO: singulier par rôle (/pro/praticien, /pro/commercant, /pro/centre)
// - Harmonisation des anciennes routes pro: spymcom/offres -> commun/spymcom & commun/avantages

export const ROUTES: RouteEntry[] = [
  // PUBLIC — génériques
  { path: "/", roles: ["PUBLIC"], titleKey: "home", public: true },
  { path: "/recherche", roles: ["PUBLIC"], titleKey: "search", public: true },
  { path: "/blog", roles: ["PUBLIC"], titleKey: "blog", public: true },

  // PUBLIC — listes (pluriel)
  {
    path: "/praticiens",
    roles: ["PUBLIC"],
    titleKey: "public.praticiens.list",
    breadcrumb: ["home", "public.praticiens.list"],
    public: true,
    feature: "directory",
  },
  {
    path: "/commercants",
    roles: ["PUBLIC"],
    titleKey: "public.commercants.list",
    breadcrumb: ["home", "public.commercants.list"],
    public: true,
    feature: "directory",
  },
  {
    path: "/artisans",
    roles: ["PUBLIC"],
    titleKey: "public.artisans.list",
    breadcrumb: ["home", "public.artisans.list"],
    public: true,
    feature: "directory",
  },
  {
    path: "/centres-de-formation",
    roles: ["PUBLIC"],
    titleKey: "public.centres.list",
    breadcrumb: ["home", "public.centres.list"],
    public: true,
    feature: "directory",
  },

  // PUBLIC — fiches (singulier, avec slug)
  {
    path: "/praticien/:slug",
    roles: ["PUBLIC"],
    titleKey: "public.praticien.detail",
    breadcrumb: ["home", "public.praticiens.list", "public.praticien.detail"],
    public: true,
  },
  {
    path: "/commercant/:slug",
    roles: ["PUBLIC"],
    titleKey: "public.commercant.detail",
    breadcrumb: ["home", "public.commercants.list", "public.commercant.detail"],
    public: true,
  },
  {
    path: "/artisan/:slug",
    roles: ["PUBLIC"],
    titleKey: "public.artisan.detail",
    breadcrumb: ["home", "public.artisans.list", "public.artisan.detail"],
    public: true,
  },
  {
    path: "/centre-de-formation/:slug",
    roles: ["PUBLIC"],
    titleKey: "public.centre.detail",
    breadcrumb: ["home", "public.centres.list", "public.centre.detail"],
    public: true,
  },

  // PUBLIC — PASS landing
  { path: "/pass", roles: ["PUBLIC"], titleKey: "public.pass", public: true },

  // AUTH
  { path: "/auth/login", roles: ["PUBLIC"], titleKey: "login", public: true },
  { path: "/auth/signup", roles: ["PUBLIC"], titleKey: "signup", public: true },
  { path: "/auth/reset", roles: ["PUBLIC"], titleKey: "reset", public: true },

  // USER/PASS (espace utilisateur)
  { path: "/pass/tableau-de-bord", roles: ["PASS_USER"], titleKey: "pass.dashboard" },
  { path: "/user/tableau-de-bord", roles: ["FREE_USER", "PASS_USER"], titleKey: "user.dashboard" },
  { path: "/user/rendez-vous/a-venir", roles: ["FREE_USER", "PASS_USER"], titleKey: "user.rdv.upcoming" },
  { path: "/user/messagerie", roles: ["FREE_USER", "PASS_USER"], titleKey: "user.messages" },
  { path: "/user/documents", roles: ["FREE_USER", "PASS_USER"], titleKey: "user.documents" },
  { path: "/user/pass", roles: ["FREE_USER", "PASS_USER"], titleKey: "user.pass" },

  // PRO — hub
  { path: "/pro/dashboard", roles: ["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER"], titleKey: "pro.dashboard" },

  // PRO — commun (nouvelle convention)
  { path: "/pro/commun/fiche", roles: ["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER"], titleKey: "pro.common.profile" },
  { path: "/pro/commun/spymcom", roles: ["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER"], titleKey: "pro.common.spymcom" },
  { path: "/pro/commun/repertoire/spymeo", roles: ["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER"], titleKey: "pro.common.directory.spymeo" },
  { path: "/pro/commun/repertoire/perso", roles: ["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER"], titleKey: "pro.common.directory.personal" },
  { path: "/pro/commun/notes", roles: ["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER"], titleKey: "pro.common.notes" },
  { path: "/pro/commun/messages", roles: ["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER"], titleKey: "pro.common.messages" },
  { path: "/pro/commun/avantages", roles: ["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER"], titleKey: "pro.common.perks" },
  { path: "/pro/commun/pass-partenaire", roles: ["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER"], titleKey: "pro.common.passPartner" },

  // PRO — praticien (singulier)
  { path: "/pro/praticien/agenda", roles: ["PRACTITIONER"], titleKey: "pro.pract.agenda" },
  { path: "/pro/praticien/fiches-clients", roles: ["PRACTITIONER"], titleKey: "pro.pract.clients" },
  { path: "/pro/praticien/statistiques", roles: ["PRACTITIONER"], titleKey: "pro.pract.stats" },
  { path: "/pro/praticien/precompta", roles: ["PRACTITIONER"], titleKey: "pro.pract.precompta" },
  { path: "/pro/praticien/evenements", roles: ["PRACTITIONER"], titleKey: "pro.pract.events" },
  { path: "/pro/praticien/academie", roles: ["PRACTITIONER"], titleKey: "pro.pract.academy" },
  { path: "/pro/praticien/blog-proposer", roles: ["PRACTITIONER"], titleKey: "pro.pract.blogPropose" },
  { path: "/pro/praticien/ressources", roles: ["PRACTITIONER"], titleKey: "pro.pract.resources" },
  { path: "/pro/praticien/cabinet-partage", roles: ["PRACTITIONER"], titleKey: "pro.pract.sharedOffice" },
  { path: "/pro/praticien/impact", roles: ["PRACTITIONER"], titleKey: "pro.pract.impact" },

  // PRO — artisan (singulier)
  { path: "/pro/artisan/catalogue/services", roles: ["ARTISAN"], titleKey: "pro.artisan.catalog.services" },
  { path: "/pro/artisan/catalogue/services/nouveau", roles: ["ARTISAN"], titleKey: "pro.artisan.catalog.services.new" },
  { path: "/pro/artisan/ventes/commandes", roles: ["ARTISAN"], titleKey: "pro.artisan.orders" },
  { path: "/pro/artisan/clients", roles: ["ARTISAN"], titleKey: "pro.artisan.clients" },
  { path: "/pro/artisan/statistiques", roles: ["ARTISAN"], titleKey: "pro.artisan.stats" },
  { path: "/pro/artisan/precompta", roles: ["ARTISAN"], titleKey: "pro.artisan.precompta" },

  // PRO — commercant (singulier)
  { path: "/pro/commercant/produits", roles: ["COMMERCANT"], titleKey: "pro.merchant.products" },
  { path: "/pro/commercant/produits/nouveau", roles: ["COMMERCANT"], titleKey: "pro.merchant.products.new" },
  { path: "/pro/commercant/commandes", roles: ["COMMERCANT"], titleKey: "pro.merchant.orders" },
  { path: "/pro/commercant/stock", roles: ["COMMERCANT"], titleKey: "pro.merchant.stock" },
  { path: "/pro/commercant/clients", roles: ["COMMERCANT"], titleKey: "pro.merchant.clients" },
  { path: "/pro/commercant/statistiques", roles: ["COMMERCANT"], titleKey: "pro.merchant.stats" },
  { path: "/pro/commercant/pre-compta", roles: ["COMMERCANT"], titleKey: "pro.merchant.precompta" },

  // PRO — centre (singulier)
  { path: "/pro/centre/formations", roles: ["CENTER"], titleKey: "pro.center.trainings" },
  { path: "/pro/centre/formations/nouvelle", roles: ["CENTER"], titleKey: "pro.center.trainings.new" },
  // ✅ Ajouts pour aligner avec le front
  { path: "/pro/centre/formations/:slug", roles: ["CENTER"], titleKey: "pro.center.training.detail" },
  { path: "/pro/centre/formations/:slug/sessions/nouvelle", roles: ["CENTER"], titleKey: "pro.center.training.session.new" },
  { path: "/pro/centre/formations/sessions", roles: ["CENTER"], titleKey: "pro.center.sessions" },
  { path: "/pro/centre/formations/sessions/:sessionId", roles: ["CENTER"], titleKey: "pro.center.session.detail" },
  { path: "/pro/centre/apprenants", roles: ["CENTER"], titleKey: "pro.center.learners" },
  { path: "/pro/centre/apprenants/nouveau", roles: ["CENTER"], titleKey: "pro.center.learners.new" },
  { path: "/pro/centre/apprenants/:id", roles: ["CENTER"], titleKey: "pro.center.learners.detail" },
  { path: "/pro/centre/statistiques", roles: ["CENTER"], titleKey: "pro.center.stats" },
  { path: "/pro/centre/precompta", roles: ["CENTER"], titleKey: "pro.center.precompta" },

  // ADMIN
  { path: "/admin", roles: ["ADMIN"], titleKey: "admin.home" },
  { path: "/admin/utilisateurs", roles: ["ADMIN"], titleKey: "admin.users" },
  { path: "/admin/centres", roles: ["ADMIN"], titleKey: "admin.centers" },
  { path: "/admin/pros", roles: ["ADMIN"], titleKey: "admin.pros" },
  { path: "/admin/pass", roles: ["ADMIN"], titleKey: "admin.pass" },
];
