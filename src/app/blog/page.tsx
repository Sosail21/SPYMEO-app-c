"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;           // ISO
  category: string;
  tags: string[];
  views: number;          // sert pour "Populaires"
  readingMinutes: number;
  author: string;
  cover?: string;         // URL image (optionnel, placeholder sinon)
};

const POSTS: Post[] = [
  {
    slug: "comprendre-errance-medicale",
    title: "Comprendre l’errance médicale",
    excerpt: "Approche globale : pratiques complémentaires, seconds avis, hygiène de vie…",
    date: "2025-08-20",
    category: "Santé globale",
    tags: ["Parcours de soin", "Prévention"],
    views: 4321,
    readingMinutes: 6,
    author: "Équipe SPYMEO",
  },
  {
    slug: "consommer-local-responsable",
    title: "Consommer local & responsable",
    excerpt: "Repères simples pour mieux choisir au quotidien, sans dogme.",
    date: "2025-08-05",
    category: "Vie locale",
    tags: ["Local", "Consommation"],
    views: 3880,
    readingMinutes: 5,
    author: "Équipe SPYMEO",
  },
  {
    slug: "bien-choisir-son-praticien",
    title: "Bien choisir son praticien",
    excerpt: "Ce qui compte vraiment : écoute, compétence, cadre, suivi.",
    date: "2025-07-28",
    category: "Pratique",
    tags: ["Praticiens", "Méthodologie"],
    views: 5270,
    readingMinutes: 7,
    author: "Équipe SPYMEO",
  },
  {
    slug: "mon-carnet-de-vie-par-ou-commencer",
    title: "Mon carnet de vie : par où commencer ?",
    excerpt: "Objectifs, routines, partages avec les pros : la méthode pas à pas.",
    date: "2025-07-10",
    category: "PASS",
    tags: ["Carnet de vie"],
    views: 2410,
    readingMinutes: 4,
    author: "Équipe SPYMEO",
  },
  {
    slug: "sommeil-et-energie-3-leviers",
    title: "Sommeil & énergie : 3 leviers concrets",
    excerpt: "Micro-habitudes utiles sans bouleverser votre quotidien.",
    date: "2025-06-22",
    category: "Pratique",
    tags: ["Sommeil", "Énergie"],
    views: 6150,
    readingMinutes: 5,
    author: "Équipe SPYMEO",
  },
];

const CATEGORIES = ["Santé globale", "Pratique", "Vie locale", "PASS"];
const TAGS = ["Prévention", "Praticiens", "Sommeil", "Local", "Carnet de vie", "Énergie"];

export default function BlogIndex() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const featured = useMemo(
    () =>
      [...POSTS].sort((a, b) => b.views - a.views)[0], // la “Une” = le plus lu
    []
  );

  const latest = useMemo(() => {
    const filtered = POSTS
      .filter((p) => (cat ? p.category === cat : true))
      .filter((p) => (q ? (p.title + p.excerpt).toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    return filtered;
  }, [q, cat]);

  const popular = useMemo(
    () => [...POSTS].sort((a, b) => b.views - a.views).slice(0, 5),
    []
  );

  // Archives par mois (YYYY-MM)
  const archives = useMemo(() => {
    const map = new Map<string, Post[]>();
    POSTS.forEach((p) => {
      const key = p.date.slice(0, 7); // YYYY-MM
      map.set(key, [...(map.get(key) ?? []), p]);
    });
    // tri décroissant des mois
    return [...map.entries()].sort(([a], [b]) => (a < b ? 1 : -1));
  }, []);

  return (
    <main>
      {/* HERO Blog */}
      <section className="post-hero">
        <div className="post-hero-inner">
          {/* côté image */}
          <div className="post-hero-media" />
          {/* côté texte */}
          <div>
            <span className="badge">SPYM'Blog</span>
            <h1 className="section-title" style={{ marginTop: 8 }}>
              Inspirations & repères pour une santé globale
            </h1>
            <p className="muted">
              Des guides pratico-pratiques, des éclairages sans blabla, et des retours d’expérience. On ne vend pas du rêve, on construit du solide.
            </p>

            {/* recherche dans le blog */}
            <form
              className="search mt-3"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                name="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un article (ex : sommeil, praticien, local...)"
              />
              <button className="btn rounded-full" type="submit">
                Rechercher
              </button>
            </form>

            {/* filtres catégories */}
            <div className="chips-row">
              <button
                type="button"
                className={`chip ${cat === null ? "is-active" : ""}`}
                onClick={() => setCat(null)}
              >
                Tous
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${cat === c ? "is-active" : ""}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Layout principal */}
      <section className="section">
        <div className="post-layout">
          {/* COLONNE PRINCIPALE */}
          <div className="grid gap-6">
            {/* À la une */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="post-card transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
              >
                <span className="post-cover" />
                <div className="post-body">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <span>{formatDate(featured.date)}</span>·
                    <span>{featured.readingMinutes} min</span>·
                    <span>{featured.category}</span>
                  </div>
                  <h2 className="text-xl font-semibold">{featured.title}</h2>
                  <p className="text-muted">{featured.excerpt}</p>
                  <div className="flex gap-2">
                    {featured.tags.map((t) => (
                      <span key={t} className="pill pill-muted">{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            )}

            {/* Derniers articles (grille cartes) */}
            <section>
              <h3 className="section-title" style={{ marginBottom: 12 }}>Derniers articles</h3>
              <div className="post-grid">
                {latest.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="post-card transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
                  >
                    <span className="post-cover" />
                    <div className="post-body">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <span>{formatDate(p.date)}</span>·
                        <span>{p.readingMinutes} min</span>·
                        <span>{p.category}</span>
                      </div>
                      <h3 className="font-semibold">{p.title}</h3>
                      <p className="text-muted">{p.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Liste (mode Meetic-like) pour varier le rendu */}
            <section>
              <h3 className="section-title" style={{ marginBottom: 12 }}>En continu</h3>
              <ul className="list">
                {latest.map((p) => (
                  <li key={p.slug} className="list-row">
                    <div className="list-media" />
                    <div className="list-body">
                      <div className="list-head">
                        <h4 className="list-title">
                          <Link className="link-muted" href={`/blog/${p.slug}`}>
                            {p.title}
                          </Link>
                        </h4>
                        <span className="muted text-sm">{formatDate(p.date)} · {p.readingMinutes} min</span>
                      </div>
                      <p className="list-desc">{p.excerpt}</p>
                      <div className="list-actions">
                        <Link className="btn btn-outline" href={`/blog/${p.slug}`}>Lire</Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="grid gap-6">
            {/* Populaires */}
            <section className="soft-card p-4">
              <h3 className="m-0 mb-2">Les plus populaires</h3>
              <ul className="grid gap-3">
                {popular.map((p, i) => (
                  <li key={p.slug} className="grid grid-cols-[56px_1fr] gap-3 items-center">
                    <span className="block w-14 h-14 rounded-md bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)]" />
                    <div className="grid">
                      <Link className="font-semibold leading-tight" href={`/blog/${p.slug}`}>
                        {p.title}
                      </Link>
                      <span className="text-sm text-muted">{abbrViews(p.views)} vues · {p.readingMinutes} min</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Catégories */}
            <section className="soft-card p-4">
              <h3 className="m-0 mb-2">Catégories</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat((prev) => (prev === c ? null : c))}
                    className={`pill ${cat === c ? "pill-solid" : "pill-muted"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>

            {/* Tags */}
            <section className="soft-card p-4">
              <h3 className="m-0 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((t) => (
                  <span key={t} className="pill pill-ghost">{t}</span>
                ))}
              </div>
            </section>

            {/* Archives (par mois) */}
            <section className="soft-card p-4">
              <h3 className="m-0 mb-2">Archives</h3>
              <ul className="grid gap-2">
                {archives.map(([ym, posts]) => (
                  <li key={ym} className="flex items-center justify-between">
                    <span className="text-sm">{formatMonth(ym)}</span>
                    <span className="pill pill-muted">{posts.length}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}
function formatMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}
function abbrViews(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `${v}`;
}