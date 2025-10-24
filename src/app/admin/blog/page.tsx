// Cdw-Spm: Admin Blog List with Real Data
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
  category?: string;
  updatedAt?: string;
  publishedAt?: string;
  author?: string;
  authorId?: string;
  source?: Source;
  views?: number;
  likesCount?: number;
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
  const [data, setData] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"ALL" | ArticleStatus>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const res = await fetch("/api/admin/blog");
      const json = await res.json();
      if (json.success) {
        setData(json.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const hay = q.trim().toLowerCase();
    return (data ?? [])
      .filter((a) => (tab === "ALL" ? true : a.status === tab))
      .filter((a) => {
        if (!hay) return true;
        const search = `${a.title} ${a.slug} ${(a.tags || []).join(" ")} ${(a.author || "")}`.toLowerCase();
        return search.includes(hay);
      });
  }, [data, q, tab]);

  async function updateStatus(id: string, newStatus: ArticleStatus) {
    if (actionLoading) return;
    setActionLoading(id);

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchArticles();
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur réseau');
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteArticle(id: string, title: string) {
    if (!confirm(`Supprimer définitivement "${title}" ?`)) return;
    if (actionLoading) return;
    setActionLoading(id);

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchArticles();
        alert('Article supprimé');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Erreur réseau');
    } finally {
      setActionLoading(null);
    }
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
              <li key={a.id} className="soft-card p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/admin/blog/${a.id}`} className="font-semibold hover:underline truncate">
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
                    /blog/{a.slug} • {a.author || "—"} • {a.updatedAt ? fmtDate(a.updatedAt) : "—"}
                    {a.views !== undefined && ` • ${a.views} vues`}
                    {a.likesCount !== undefined && ` • ${a.likesCount} ❤️`}
                  </div>
                  {a.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {a.tags.map((t) => (
                        <span key={t} className="pill bg-slate-100 text-slate-700 text-xs">{t}</span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Actions par statut */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/admin/blog/${a.id}`} className="pill pill-ghost">Éditer</Link>

                  {a.status === "SUBMITTED" && (
                    <>
                      <button
                        className="pill pill-muted"
                        onClick={() => updateStatus(a.id, "DRAFT")}
                        disabled={actionLoading === a.id}
                      >
                        {actionLoading === a.id ? '...' : 'Valider (→ Brouillon)'}
                      </button>
                      <button
                        className="pill pill-muted"
                        onClick={() => updateStatus(a.id, "NEEDS_CHANGES")}
                        disabled={actionLoading === a.id}
                      >
                        Demander modifs
                      </button>
                      <button
                        className="pill pill-muted"
                        onClick={() => updateStatus(a.id, "REJECTED")}
                        disabled={actionLoading === a.id}
                      >
                        Refuser
                      </button>
                    </>
                  )}

                  {a.status === "DRAFT" && (
                    <button
                      className="pill pill-muted bg-green-50 text-green-700"
                      onClick={() => updateStatus(a.id, "PUBLISHED")}
                      disabled={actionLoading === a.id}
                    >
                      {actionLoading === a.id ? '...' : 'Publier'}
                    </button>
                  )}

                  {a.status === "PUBLISHED" && (
                    <Link href={`/blog/${a.slug}`} target="_blank" className="pill pill-muted">Aperçu public</Link>
                  )}

                  <button
                    className="pill pill-muted hover:bg-red-100 text-red-600"
                    onClick={() => deleteArticle(a.id, a.title)}
                    disabled={actionLoading === a.id}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
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
