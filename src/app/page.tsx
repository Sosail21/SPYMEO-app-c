// src/app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      {/* ===== HERO / MEGA SEARCH ===== */}
      <section className="hero py-10 md:py-14">
        <div className="container-spy">
          <div className="mx-auto w-[90%] md:w-[70%] text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Au cœur de la santé globale
            </h1>
            <p className="text-muted max-w-2xl mx-auto">
              Trouvez le bon praticien, découvrez des artisans engagés et avancez
              pas à pas vers votre bien-être au niveau local.
            </p>

            {/* Mega search */}
            <form className="search-wrap flex flex-col md:flex-row flex-wrap md:flex-nowrap gap-2 mt-6" action="/recherche">
              <input name="q" placeholder="Praticien, spécialité…" className="input-pill flex-1 min-w-0" />
              <input name="city" placeholder="Ville ou code postal" className="input-pill flex-1 min-w-0" />
              <select name="radius" className="pill pill-muted shrink-0 w-full md:w-auto" defaultValue="20" aria-label="Rayon">
                <option value="10">10 km</option>
                <option value="20">20 km</option>
                <option value="50">50 km</option>
              </select>
              <button className="pill pill-solid shrink-0 w-full md:w-auto" type="submit">Rechercher</button>
            </form>

            {/* quick chips */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button className="chip chip-active" type="button">Proche de moi</button>
              <button className="chip" type="button">Première consult.</button>
              <button className="chip" type="button">Téléconsultation</button>
              <button className="chip" type="button">Bio / Local</button>
            </div>

            {/* KPIs */}
            <div className="kpi-band mt-4 justify-center">
              <div>✨ 98% de satisfaction</div>
              <div>🔒 Éthique vérifiée</div>
              <div>📍 Local & circuits courts</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== UNIVERS ===== */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Parcourir par univers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {UNIVERSES.map((u, idx) => (
              <article
                key={u.href}
                className="group relative overflow-hidden rounded-2xl shadow-sm bg-white ring-1 ring-[rgba(11,18,57,.08)]"
              >
                {/* image responsive optimisée */}
                <div className="relative h-36 sm:h-40">
                  <Image
                    src={u.img}
                    alt={u.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    // priorité légère sur les 2 premiers tuiles au-dessus de la ligne de flottaison
                    priority={idx < 2}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{u.title}</h3>
                  <p className="text-muted">{u.desc}</p>
                </div>
                {/* overlay on hover */}
                <div className="uni-overlay pointer-events-none group-hover:pointer-events-auto">
                  <div className="uni-overlay-inner">
                    <Link className="btn" href={u.href}>Découvrir</Link>
                    <Link className="btn btn-outline" href={`/recherche?type=${u.query}`}>Rechercher</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED ===== */}
      <section className="section bg-[#edf4f6]">
        <div className="container-spy">
          <h2 className="section-title">Sélection près de chez vous</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURED.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="card pro-card transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
              >
                <div className="pro-avatar" />
                <h3 className="pro-name font-semibold">{c.title}</h3>
                <p className="pro-meta">{c.meta}</p>
                <span className="btn btn-outline">Voir la fiche</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Pourquoi SPYMEO ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.t} className="card transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]">
                <div className="text-2xl mb-2">{b.emoji}</div>
                <h3 className="font-semibold mb-1">{b.t}</h3>
                <p className="muted">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PASS ===== */}
      <section className="section">
        <div className="container-spy">
          <div className="soft-card p-6 md:p-8 bg-[linear-gradient(135deg,#0ea5b7,#54dbe9)] text-white grid md:grid-cols-[1.2fr_.8fr] items-center gap-6 rounded-2xl">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold">Le PASS SPYMEO</h3>
              <p className="opacity-90 mt-1">
                Tarifs préférentiels chez nos partenaires, ressources premium et carnet de vie. Un accélérateur pour votre bien-être.
              </p>
              <div className="flex gap-2 mt-3">
                <Link href="/pass" className="btn btn-light">Découvrir le PASS</Link>
                <Link href="/devenir-membre-pro" className="btn btn-outline-light">Devenir partenaire</Link>
              </div>
            </div>
            <div className="h-36 md:h-40 rounded-xl bg-white/15" />
          </div>
        </div>
      </section>

      {/* ===== POSTS ===== */}
      <section className="section bg-[#edf4f6]">
        <div className="container-spy">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="section-title m-0">Derniers articles</h2>
            <Link href="/blog" className="pill pill-ghost">Voir le blog</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {POSTS.map((p, idx) => (
              <Link
                key={p.href}
                href={p.href}
                className="post-card transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
              >
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={p.img}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>
                <div className="post-body">
                  <h3 className="font-semibold">{p.t}</h3>
                  <p className="text-muted">{p.d}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="section cta">
        <div className="container-spy cta-inner">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-1">Envie d’aller plus loin ?</h3>
            <p className="opacity-90">Créez votre compte ou découvrez le PASS.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/signup" className="btn">Créer mon compte</Link>
            <Link href="/pass" className="btn btn-outline">Découvrir le PASS</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ----------------------- Data ----------------------- */
/* NB: les chemins pointent vers /public/images/...  */

const UNIVERSES = [
  {
    href: "/praticiens",
    query: "praticien",
    title: "Praticiens",
    desc: "Naturopathes, sophrologues, réflexologues…",
    img: "/images/univers/praticiens.png",
    alt: "Illustration de l’univers Praticiens",
  },
  {
    href: "/artisans",
    query: "artisan",
    title: "Artisans",
    desc: "Cosmétiques naturels, apiculteurs, savonniers…",
    img: "/images/univers/artisans.png",
    alt: "Illustration de l’univers Artisans",
  },
  {
    href: "/commercants",
    query: "commercant",
    title: "Commerçants",
    desc: "Boutiques locales engagées.",
    img: "/images/univers/commercants.png",
    alt: "Illustration de l’univers Commerçants",
  },
  {
    href: "/centres-de-formation",
    query: "centre",
    title: "Centres de formation",
    desc: "Formations éthiques & sérieuses.",
    img: "/images/univers/centres.png",
    alt: "Illustration de l’univers Centres de formation",
  },
];

const FEATURED = [
  { href: "/praticien/aline-dupont", title: "Aline Dupont", meta: "Naturopathe — Dijon" },
  { href: "/artisan/atelier-savon", title: "Atelier Savon", meta: "Artisan — Beaune" },
  { href: "/centre-de-formation/centre-horizon", title: "Centre Horizon", meta: "Centre de formation — Dijon" },
];

const BENEFITS = [
  { emoji: "🧭", t: "Éthique vérifiée", d: "Charte claire, pratiques cadrées, avis authentifiés." },
  { emoji: "📍", t: "Local & circuits courts", d: "Des pros près de chez vous, engagés pour le territoire." },
  { emoji: "⏱️", t: "Prise de RDV simple", d: "En cabinet, à distance, ou à domicile selon vos besoins." },
  { emoji: "🔖", t: "Avantages PASS", d: "Réductions, ressources premium et suivi de vos actions." },
];

const POSTS = [
  {
    href: "/blog/comprendre-errance-medicale",
    t: "Comprendre l’errance médicale",
    d: "Approche globale : pratiques alternatives, seconds avis, hygiène de vie…",
    img: "/images/blog/errance.png",
    alt: "Couverture article : Comprendre l’errance médicale",
  },
  {
    href: "/blog/consommer-local-responsable",
    t: "Consommer local & responsable",
    d: "Des repères simples pour mieux choisir au quotidien.",
    img: "/images/blog/local.jpg",
    alt: "Couverture article : Consommer local & responsable",
  },
  {
    href: "/blog/bien-choisir-son-praticien",
    t: "Bien choisir son praticien",
    d: "Ce qui compte vraiment : écoute, compétence, cadre, suivi.",
    img: "/images/blog/praticien.png",
    alt: "Couverture article : Bien choisir son praticien",
  },
];
