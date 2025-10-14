// Cdw-Spm
// src/app/devenir-membre-pro/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Secteur = "PRACTITIONER" | "CENTER" | "COMMERCANT" | "ARTISAN";

/** Pages “service/landing” à ouvrir selon le secteur */
const MAP_SERVICE_BY_SECTOR: Record<Secteur, string> = {
  // ✅ tunnel dédié praticiens
  PRACTITIONER: "/praticiens/devenir-membre",

  // (en attendant une page dédiée centre, on garde Start)
  CENTER: "/centres-de-formation/devenir-membre",

  // ✅ page commune Commerçants & Artisans avec pré-sélection
  COMMERCANT: "/commercants-artisans/devenir-membre?secteur=COMMERCANT",
  ARTISAN: "/commercants-artisans/devenir-membre?secteur=ARTISAN",
};

/** Fallback si on choisit “Démarrer l’inscription” */
const MAP_SIGNUP_BY_SECTOR: Record<Secteur, string> = {
  PRACTITIONER: "/pro/signup?role=PRACTITIONER",
  CENTER: "/pro/signup?role=CENTER",
  COMMERCANT: "/pro/signup?role=COMMERCANT",
  ARTISAN: "/pro/signup?role=ARTISAN",
};

export default function DevenirMembrePro() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get("secteur")?.toUpperCase() as Secteur) || "PRACTITIONER";

  const [secteur, setSecteur] = useState<Secteur>(initial);
  const [mode, setMode] = useState<"service" | "signup">("service");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const href =
      mode === "service" ? MAP_SERVICE_BY_SECTOR[secteur] : MAP_SIGNUP_BY_SECTOR[secteur];
    router.push(href as any);
  };

  return (
    <main>
      {/* HERO */}
      <section className="hero py-10 md:py-14">
        <div className="container-spy">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Devenir membre pro</h1>
            <p className="text-muted mt-2">
              Rejoignez SPYMEO et accédez à une présence en ligne performante, des outils
              simples et un réseau local éthique. Commencez par choisir votre secteur.
            </p>

            {/* Raccourcis de pré-sélection */}
            <nav className="chips-row justify-center mt-4">
              <Link className="chip" href="/devenir-membre-pro?secteur=PRACTITIONER">Praticien·ne</Link>
              <Link className="chip" href="/devenir-membre-pro?secteur=COMMERCANT">Commerçant</Link>
              <Link className="chip" href="/devenir-membre-pro?secteur=ARTISAN">Artisan</Link>
              <Link className="chip" href="/devenir-membre-pro?secteur=CENTER">Centre de formation</Link>
            </nav>
          </div>

          {/* Sélecteur secteur */}
          <form
            onSubmit={onSubmit}
            className="mx-auto mt-6 grid gap-4 max-w-3xl"
            aria-label="Choisir votre secteur d'activité"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <SectorCard
                value="PRACTITIONER"
                selected={secteur}
                onSelect={setSecteur}
                title="Praticien·ne"
                desc="Naturopathes, sophrologues, réflexologues, hypnose, etc."
                bullets={["Fiche optimisée + RDV", "Offre & packs", "Blog & contenus"]}
                detailsHref={MAP_SERVICE_BY_SECTOR.PRACTITIONER}
              />
              <SectorCard
                value="COMMERCANT"
                selected={secteur}
                onSelect={setSecteur}
                title="Commerçant"
                desc="Boutiques locales engagées (vrac, bio, cosmétiques, etc.)"
                bullets={["Catalogue produits", "Commandes & clients", "SEO local"]}
                detailsHref={MAP_SERVICE_BY_SECTOR.COMMERCANT}
              />
              <SectorCard
                value="ARTISAN"
                selected={secteur}
                onSelect={setSecteur}
                title="Artisan"
                desc="Savonnerie, cuir, menuiserie, textile, céramique…"
                bullets={["Vitrine services/ateliers", "Commandes/inscriptions", "Local & circuits courts"]}
                detailsHref={MAP_SERVICE_BY_SECTOR.ARTISAN}
              />
              <SectorCard
                value="CENTER"
                selected={secteur}
                onSelect={setSecteur}
                title="Centre de formation"
                desc="Programmes & sessions, intervenants, inscriptions."
                bullets={["Programmes", "Sessions & agenda", "Inscriptions"]}
                detailsHref={MAP_SERVICE_BY_SECTOR.CENTER}
              />
            </div>

            {/* Destination (service vs inscription) */}
            <div className="soft-card p-4 flex flex-col sm:flex-row items-center gap-3">
              <div className="text-sm text-muted">Où souhaitez-vous aller après la sélection ?</div>
              <div className="segmented">
                <button
                  type="button"
                  className={mode === "service" ? "is-active" : ""}
                  onClick={() => setMode("service")}
                >
                  Voir la page service
                </button>
                <button
                  type="button"
                  className={mode === "signup" ? "is-active" : ""}
                  onClick={() => setMode("signup")}
                >
                  Démarrer l’inscription
                </button>
              </div>
              <div className="sm:ml-auto text-sm">
                <Link href="/services/spymeo-start" className="pill pill-ghost">SPYMEO Start</Link>{" "}
                <Link href="/services/spymeo-web" className="pill pill-ghost">SPYMEO Web</Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button type="submit" className="btn">Continuer</button>
              <Link href="/pass" className="btn btn-outline">Découvrir le PASS</Link>
            </div>
          </form>
        </div>
      </section>

      {/* Bande “ce que comprend l’adhésion pro” */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Votre adhésion pro comprend</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INCLUDES.map((b) => (
              <article key={b.t} className="card">
                <div className="text-2xl mb-2">{b.emoji}</div>
                <h3 className="font-semibold">{b.t}</h3>
                <p className="muted mt-1">{b.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta">
        <div className="container-spy cta-inner">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-1">Besoin d’un conseil rapide ?</h3>
            <p className="opacity-90">On vous oriente vers le bon parcours (Start, Web, ou les deux).</p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/signup?contact=pro" className="btn">Être rappelé·e</Link>
            <Link href="/services/spymeo-start" className="btn btn-outline">Voir SPYMEO Start</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectorCard({
  value,
  selected,
  onSelect,
  title,
  desc,
  bullets,
  detailsHref,
}: {
  value: Secteur;
  selected: Secteur;
  onSelect: (s: Secteur) => void;
  title: string;
  desc: string;
  bullets: string[];
  detailsHref: string;
}) {
  const isActive = selected === value;
  return (
    <div
      className={
        "soft-card p-4 transition hover:-translate-y-0.5 " +
        (isActive ? "ring-2 ring-[rgba(23,162,184,.35)] shadow-[0_16px_40px_rgba(23,162,184,0.15)]" : "")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted mt-1">{desc}</p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(value)}
          aria-pressed={isActive}
          className={"pill " + (isActive ? "pill-solid" : "pill-muted")}
        >
          {isActive ? "Sélectionné" : "Sélectionner"}
        </button>
      </div>

      <ul className="grid gap-1 mt-3 text-sm text-muted">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-[2px]">✔</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <Link href={detailsHref as any} className="pill pill-ghost">Voir détails</Link>
        <Link href={detailsHref as any} className="pill pill-muted">En savoir plus</Link>
      </div>
    </div>
  );
}

/* --------- contenu statique --------- */
const INCLUDES = [
  { emoji: "🌐", t: "Présence en ligne", d: "Fiche publique, mini-site, prise de RDV / catalogue." },
  { emoji: "🎯", t: "Accompagnement", d: "Cadrage Start (option) pour un positionnement clair." },
  { emoji: "🤝", t: "Réseau & visibilité", d: "Écosystème local & éthique, mises en avant thématiques." },
];
