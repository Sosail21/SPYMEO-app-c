// src/app/admin/blog/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ArticleStatus = "SUBMITTED" | "NEEDS_CHANGES" | "REJECTED" | "DRAFT" | "PUBLISHED";
type Source = "ADMIN" | "PRACTITIONER";

type Article = {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  tags?: string[];
  updatedAt?: string; // ISO
  author?: string;
  source?: Source;
  submittedAt?: string;  // si SUBMITTED
  submittedById?: string;
};

const TABS: { key: "ALL" | ArticleStatus; label: string }[] = [
  { key: "ALL", label: "Tous" },
  { key: "SUBMITTED", label: "En revue" },
  { key: "NEEDS_CHANGES", label: "À corriger" },
  { key: "REJECTED", label: "Refusés" },
  { key: "DRAFT", label: "Brouillons" },
  { key: "PUBLISHED", label: "Publiés" },
];

export default function AdminBlogListPage() {
  const { data, setData, loading } = useArticles();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"ALL" | ArticleStatus>("ALL");

  const filtered = useMemo(() => {
    const hay = q.trim().toLowerCase();
    return (data ?? [])
      .filter((a) => (tab === "ALL" ? true : a.status === tab))
      .filter((a) => {
        if (!hay) return true;
        const search = `${a.title} ${a.slug} ${(a.tags || []).join(" ")} ${(a.author || "")}`.toLowerCase();
        return search.includes(hay);
      })
      .sort((a, b) => {
        // prioriser les SUBMITTED en haut si "Tous"
        if (tab === "ALL") {
          const order = (s: ArticleStatus) =>
            s === "SUBMITTED" ? 0 :
            s === "NEEDS_CHANGES" ? 1 :
            s === "DRAFT" ? 2 :
            s === "PUBLISHED" ? 3 : 4;
          const d = order(a.status) - order(b.status);
          if (d !== 0) return d;
        }
        return (b.updatedAt || "").localeCompare(a.updatedAt || "");
      });
  }, [data, q, tab]);

  function mutate(id: string, patch: Partial<Article>) {
    setData((prev) => (prev ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)));
    // démo : refléter dans localStorage si l’item vient d’une soumission praticien
    try {
      const key = "__spy_admin_blog_mock";
      const cur: Article[] = JSON.parse(localStorage.getItem(key) || "[]");
      const next = cur.map((x) => (x.id === id ? { ...x, ...patch } : x));
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  }

  return (
    <section className="section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Blog — Articles & Soumissions</h1>
          <p className="text-slate-600">Validez les contributions des praticiens ou publiez vos propres contenus.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog/nouvel-article" className="btn">+ Nouvel article</Link>
        </div>
      </div>

      <div className="soft-card p-3 mt-4 flex flex-wrap items-center gap-3 justify-between">
        <nav aria-label="Filtre par statut" className="chips-row">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as any)}
              className={"chip " + (tab === t.key ? "chip-active" : "")}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher par titre, tag…"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-72"
          aria-label="Rechercher"
        />
      </div>

      <div className="mt-4">
        {loading ? <ListSkeleton /> : filtered.length === 0 ? <EmptyState /> : (
          <ul className="grid gap-2">
            {filtered.map((a) => (
              <li key={a.id} className="soft-card p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={"/admin/blog/" + a.id} className="font-semibold hover:underline truncate">
                      {a.title}
                    </Link>
                    <StatusBadge status={a.status} />
                    {a.source === "PRACTITIONER" && (
                      <span className="pill bg-indigo-50 text-indigo-700" title="Proposée par un praticien">
                        Praticien
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 truncate">
                    /blog/{a.slug} • {a.author || "—"} • {a.updatedAt ? fmtDate(a.updatedAt) : a.submittedAt ? fmtDate(a.submittedAt) : "—"}
                  </div>
                  {a.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {a.tags.map((t) => (
                        <span key={t} className="pill bg-slate-100 text-slate-700">{t}</span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Actions par statut */}
                <div className="flex items-center gap-2">
                  {/* Éditer toujours possible */}
                  <Link href={"/admin/blog/" + a.id} className="pill pill-ghost">Ouvrir</Link>

                  {a.status === "SUBMITTED" && (
                    <>
                      <button className="pill pill-muted" onClick={() => mutate(a.id, { status: "DRAFT" })}>
                        Valider (→ Brouillon)
                      </button>
                      <button className="pill pill-muted" onClick={() => mutate(a.id, { status: "NEEDS_CHANGES" })}>
                        Demander modifs
                      </button>
                      <button className="pill pill-muted" onClick={() => mutate(a.id, { status: "REJECTED" })}>
                        Refuser
                      </button>
                    </>
                  )}

                  {a.status === "NEEDS_CHANGES" && (
                    <>
                      <button className="pill pill-muted" onClick={() => alert("Notification envoyée (mock)")}>
                        Relancer
                      </button>
                      <button className="pill pill-muted" onClick={() => mutate(a.id, { status: "SUBMITTED" })}>
                        Marquer reçu
                      </button>
                    </>
                  )}

                  {a.status === "DRAFT" && (
                    <button className="pill pill-muted" onClick={() => mutate(a.id, { status: "PUBLISHED" })}>
                      Publier
                    </button>
                  )}

                  {a.status === "PUBLISHED" && (
                    <Link href={"/blog/" + a.slug} target="_blank" className="pill pill-muted">Aperçu public</Link>
                  )}

                  <button className="pill pill-muted" onClick={() => alert("Supprimer (mock)")}>Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function useArticles() {
  const [data, _setData] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState(true);

  function setData(updater: (prev: Article[] | null) => Article[]) {
    _setData((prev) => updater(prev));
  }

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/blog", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const json = await r.json();
        if (!cancel) _setData(json?.articles ?? []);
      } catch {
        if (!cancel) {
          // Merge MOCK_ARTICLES + soumissions locales des praticiens
          const key = "__spy_admin_blog_mock";
          let subs: Article[] = [];
          try { subs = JSON.parse(localStorage.getItem(key) || "[]"); } catch {}
          _setData([...subs, ...MOCK_ARTICLES]);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  return { data, setData, loading };
}

function StatusBadge({ status }: { status: ArticleStatus }) {
  const map: Record<ArticleStatus, { label: string; cls: string }> = {
    SUBMITTED: { label: "En revue", cls: "bg-blue-100 text-blue-700" },
    NEEDS_CHANGES: { label: "À corriger", cls: "bg-amber-100 text-amber-700" },
    REJECTED: { label: "Refusé", cls: "bg-rose-100 text-rose-700" },
    DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-700" },
    PUBLISHED: { label: "Publié", cls: "bg-emerald-100 text-emerald-700" },
  };
  const it = map[status];
  return <span className={`pill ${it.cls}`}>{it.label}</span>;
}

function ListSkeleton() {
  return (
    <ul className="grid gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="soft-card p-3 animate-pulse">
          <div className="h-4 w-1/2 bg-slate-200 rounded" />
          <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="text-lg font-semibold">Aucun article</h3>
      <p className="text-slate-600 mt-1">Créez un contenu ou attendez une soumission praticien.</p>
      <div className="mt-4 flex gap-2 justify-center">
        <Link href="/admin/blog/nouvel-article" className="btn">+ Nouvel article</Link>
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch { return iso; }
}

// Contenu éditorial interne (admin)
const MOCK_ARTICLES: Article[] = [
  { id: "a1", title: "Réflexologie : bien démarrer", slug: "reflexologie-bien-demarrer", status: "PUBLISHED", tags: ["réflexologie","débuter"], author: "Équipe SPYMEO", source: "ADMIN", updatedAt: "2025-08-18" },
  { id: "a2", title: "Kobido : 5 erreurs fréquentes", slug: "kobido-5-erreurs", status: "DRAFT", tags: ["kobido"], author: "Équipe SPYMEO", source: "ADMIN", updatedAt: "2025-08-12" },
];
