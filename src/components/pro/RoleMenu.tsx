"use client";
import Link from "next/link";

type Item = { label: string; href: string };

const COMMON: Item[] = [
  { label: "Tableau de bord", href: "/pro/dashboard" },
  { label: "Ma fiche", href: "/pro/fiche" },
  { label: "SPYM'Com", href: "/pro/spymcom" },
  { label: "Répertoire SPYMEO", href: "/pro/repertoire/spymeo" },
  { label: "Répertoire perso", href: "/pro/repertoire/perso" },
  { label: "Notes", href: "/pro/notes" },
  { label: "Messagerie", href: "/pro/messages" },
];

const PRACTITIONER: Item[] = [
  { label: "Agenda / RDV", href: "/pro/agenda" },
  { label: "Fiches clients", href: "/pro/fiches-clients" },
  { label: "Statistiques", href: "/pro/statistiques" },
  { label: "Pré-compta", href: "/pro/precompta" },
  { label: "Évènements", href: "/pro/evenements" },
  { label: "Académie", href: "/pro/academie" },
  { label: "Blog (proposer)", href: "/pro/blog-proposer" },
  { label: "Ressources", href: "/pro/ressources" },
  { label: "Cabinet partagé", href: "/pro/cabinet-partage" },
];

const MERCHANT_CENTER: Item[] = [
  { label: "Catalogue", href: "/pro/catalogue" },
  { label: "Nouveau produit", href: "/pro/catalogue/nouveau-produit" },
  { label: "Nouvelle formation", href: "/pro/catalogue/nouvelle-formation" },
];

export default function RoleMenu({ role }: { role: string }) {
  const roleItems =
    role === "PRACTITIONER"
      ? PRACTITIONER
      : role === "ARTISAN" || role === "COMMERÇANT" || role === "CENTER"
      ? MERCHANT_CENTER
      : [];

  return (
    <nav className="w-full">
      <ul
        className="flex items-center gap-2 overflow-x-auto whitespace-nowrap
          [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {COMMON.map((i) => (
          <li key={i.href}>
            <Link className="pill pill-ghost hover:shadow-elev" href={i.href}>
              {i.label}
            </Link>
          </li>
        ))}
        {roleItems.length > 0 && <li className="mx-2 text-muted">•</li>}
        {roleItems.map((i) => (
          <li key={i.href}>
            <Link className="pill pill-muted hover:shadow-elev" href={i.href}>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
