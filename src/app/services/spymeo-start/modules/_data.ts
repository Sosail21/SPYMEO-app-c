// Cdw-Spm
export type StartModule = {
  slug: string;
  title: string;
  tagline: string;
  duration: string;   // ex: "~2 ateliers"
  level: "1" | "2";
  img: string;        // visuel (placeholder ok)
  plan: { step: string; detail: string }[];
  deliverables: string[];
  faq: { q: string; a: string }[];
};

export const MODULES: StartModule[] = [
  {
    slug: "identite",
    title: "Identité & Positionnement",
    tagline: "Promesse claire, cible prioritaire, preuves et messages clés.",
    duration: "~2 ateliers",
    level: "1",
    img: "/images/start/identite.jpg",
    plan: [
      { step: "Diagnostic express", detail: "État des lieux, forces/faiblesses, clarifications immédiates." },
      { step: "Promesse & cible", detail: "Formulation courte, bénéfice tangible, priorisation des personas." },
      { step: "Preuves & messages", detail: "Arguments, cas d’usage, éléments de réassurance (éthique, résultats…)." },
    ],
    deliverables: [
      "Note d’identité (1 page synthèse)",
      "Message principal + 3 messages d’appui",
      "Check-list d’alignement (site, fiche, réseaux)",
    ],
    faq: [
      { q: "Je démarre tout juste, est-ce pertinent ?", a: "Oui. Un positionnement net évite la dispersion et accélère les premiers résultats." },
      { q: "Et si j’ai plusieurs casquettes ?", a: "On priorise, puis on organise le discours sans brouiller la lecture." },
    ],
  },
  {
    slug: "offre",
    title: "Offre & Packaging",
    tagline: "Concevoir des offres lisibles, désirables et faciles à acheter.",
    duration: "~2 ateliers",
    level: "1",
    img: "/images/start/offre.jpg",
    plan: [
      { step: "Inventaire & objectifs", detail: "Prestations, contraintes, attentes de revenu." },
      { step: "Packs & garanties", detail: "Combinaisons efficaces, éléments différenciants, objections & réponses." },
      { step: "Parcours d’achat", detail: "CTA, friction minimale, messages et relances." },
    ],
    deliverables: [
      "3 packs max (nom, contenu, prix, conditions)",
      "Arguments & réponses aux objections",
      "Script de présentation (1 minute)",
    ],
    faq: [
      { q: "Dois-je faire des remises ?", a: "Pas nécessaire. On peut travailler la valeur perçue et la clarté du bénéfice." },
      { q: "Quid des abonnements ?", a: "On peut les introduire si cohérents (suivi / formation continue / atelier régulier)." },
    ],
  },
  {
    slug: "web",
    title: "Web & Mise en ligne",
    tagline: "Fiche SPYMEO, mini-site, prise de RDV, blog : prêt à convertir.",
    duration: "~2 ateliers",
    level: "1",
    img: "/images/start/web.jpg",
    plan: [
      { step: "Brief contenu & visuels", detail: "Sections, structure, éléments de preuve, appels à l’action." },
      { step: "Template & intégration", detail: "Choix d’un template, personnalisation et raccords SPYMEO." },
      { step: "SEO local & analytics", detail: "Titres/méta, structure Hn, tracking conversions." },
    ],
    deliverables: [
      "Fiche pro optimisée",
      "Mini-site (1 à 3 pages) avec CTA",
      "Check SEO local + Analytics actifs",
    ],
    faq: [
      { q: "Nom de domaine personnalisé ?", a: "Oui, possible en option. On peut aussi migrer un contenu existant." },
      { q: "Prise de RDV ?", a: "Lien SPYMEO ou outil préféré, objectif : fluidité pour l’utilisateur." },
    ],
  },
  {
    slug: "acquisition",
    title: "Acquisition locale",
    tagline: "Routine simple & durable : scripts + canaux utiles + suivi.",
    duration: "~2 ateliers",
    level: "2",
    img: "/images/start/acquisition.jpg",
    plan: [
      { step: "Cartographie des canaux", detail: "Local, partenariats, répertoires, contenus, événements." },
      { step: "Scripts & messages", detail: "Email, DM, appel, message de relance — éthique et soft-sell." },
      { step: "Routine & mesure", detail: "Hebdomadaire : objectifs simples + métriques qui comptent." },
    ],
    deliverables: [
      "Scripts (email/DM/appel) prêts à l’emploi",
      "Plan hebdo (30–60 min) réaliste",
      "Tableau de suivi des actions",
    ],
    faq: [
      { q: "Je n’aime pas prospecter.", a: "On propose une méthode non-agressive, orientée service, proche du terrain." },
      { q: "Combien de temps ?", a: "30 à 60 minutes par semaine suffisent si c’est régulier." },
    ],
  },
  {
    slug: "contenus",
    title: "Contenus & Blog",
    tagline: "Ligne éditoriale, formats rapides, calendrier simple.",
    duration: "~1 atelier",
    level: "2",
    img: "/images/start/contenus.jpg",
    plan: [
      { step: "Ligne éditoriale claire", detail: "Sujets, angles, preuves, call-to-action adaptés." },
      { step: "Formats rapides", detail: "Short posts, carrousels, articles courts, templates." },
      { step: "Calendrier allégé", detail: "Cadence réaliste + repurposing (1 → 3 formats)." },
    ],
    deliverables: [
      "Liste de 12 sujets",
      "3 templates de contenu",
      "Calendrier sur 4 semaines",
    ],
    faq: [
      { q: "Je n’ai pas d’inspiration.", a: "On part de votre pratique et des questions clients réelles. Simplicité d’abord." },
      { q: "Faut-il publier partout ?", a: "Non. Mieux vaut un canal cohérent utilisé régulièrement." },
    ],
  },
  {
    slug: "experience",
    title: "Expérience client",
    tagline: "Parcours, messages, fidélisation, retours & recommandations.",
    duration: "~1 atelier",
    level: "2",
    img: "/images/start/experience.jpg",
    plan: [
      { step: "Parcours & frictions", detail: "De la 1re visite au suivi : simplifier pour rassurer." },
      { step: "Messages automatiques", detail: "Avant/Après RDV, check-ins, demandes d’avis." },
      { step: "Fidélisation", detail: "Offres de suivi, contenus utiles, recommandations." },
    ],
    deliverables: [
      "Parcours cible (schéma simple)",
      "3 messages types (avant/pendant/après)",
      "Checklist d’amélioration continue",
    ],
    faq: [
      { q: "Je manque de temps.", a: "On automatise le minimum utile, on supprime le superflu." },
      { q: "Et RGPD ?", a: "On reste sobre : utile, proportionné, transparent." },
    ],
  },
];

export function getModule(slug: string) {
  return MODULES.find((m) => m.slug === slug);
}

export function getNextPrev(slug: string) {
  const idx = MODULES.findIndex((m) => m.slug === slug);
  return {
    prev: idx > 0 ? MODULES[idx - 1] : undefined,
    next: idx >= 0 && idx < MODULES.length - 1 ? MODULES[idx + 1] : undefined,
  };
}
