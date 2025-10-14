// Cdw-Spm
// src/app/admin/blog/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
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
  coverUrl?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  updatedAt?: string;
  source?: Source;
  submittedAt?: string;
  submittedById?: string;
};

export default function AdminBlogEditPage() {
  const params = useParams<{ id: string }>();
  const articleId = params?.id as string;

  const { data, setData, loading } = useArticle(articleId);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("DRAFT");
  const [tags, setTags] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!data) return;
    setTitle(data.title || "");
    setSlug(data.slug || "");
    setStatus(data.status || "DRAFT");
    setTags((data.tags || []).join(", "));
    setCoverUrl(data.coverUrl || "");
    setExcerpt(data.excerpt || "");
    setContent(data.content || "");
    setAuthor(data.author || "");
  }, [data]);

  const autoSlug = useMemo(() => slugify(title), [title]);
  function slugify(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}+/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slug.trim()) setSlug(slugify(v));
  }

  function mutate(patch: Partial<Article>) {
    setData((prev) => prev ? { ...prev, ...patch } : prev);
    // miroir démo localStorage si soumission praticien
    try {
      const key = "__spy_admin_blog_mock";
      const list: Article[] = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify(list.map(x => x.id === articleId ? { ...x, ...patch } : x)));
    } catch {}
  }

  function onSave() {
    // À brancher : PUT /api/admin/blog/:id
    mutate({
      title: title.trim(),
      slug: (slug.trim() || autoSlug),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      coverUrl: coverUrl.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      content: content.trim(),
      author: author.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
    alert("Enregistré (mock).");
  }

  function onPublish() {
    mutate({ status: "PUBLISHED", updatedAt: new Date().toISOString() });
    alert("Publié (mock).");
  }

  function onRequestChanges() {
    mutate({ status: "NEEDS_CHANGES" });
    alert("Demande de modifications envoyée (mock).");
    setFeedback("");
  }

  function onReject() {
    mutate({ status: "REJECTED" });
    alert("Soumission refusée (mock).");
  }

  function onApproveToDraft() {
    mutate({ status: "DRAFT" });
    alert("Soumission validée → Brouillon (mock).");
  }

  if (loading || !data) {
    return (
      <section className="section">
        <div className="soft-card p-4 animate-pulse">
          <div className="h-5 w-1/3 bg-slate-200 rounded" />
          <div className="mt-3 h-3 w-2/3 bg-slate-100 rounded" />
          <div className="mt-3 h-40 w-full bg-slate-100 rounded" />
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Éditer l’article</h1>
          <div className="text-slate-600 text-sm">
            Dernière maj : {data.updatedAt ? fmtDate(data.updatedAt) : data.submittedAt ? fmtDate(data.submittedAt) : "—"}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="pill pill-muted" onClick={onSave}>Enregistrer</button>
          {status === "DRAFT" ? (
            <button className="btn" onClick={onPublish}>Publier</button>
          ) : (
            <Link href={`/blog/${slug || autoSlug}`} target="_blank" className="pill pill-muted">Aperçu public</Link>
          )}
        </div>
      </div>

      {/* Bandeau soumission praticien */}
      {data.source === "PRACTITIONER" && (
        <div className="soft-card p-3 mt-4 flex flex-wrap items-center gap-2">
          <span className="pill bg-indigo-50 text-indigo-700">Soumission praticien</span>
          <span className="pill bg-blue-100 text-blue-700">{statusLabel(status)}</span>
          {data.submittedAt && <span className="text-sm text-slate-600">Reçue le {fmtDate(data.submittedAt)}</span>}
          <span className="ml-auto flex gap-2">
            {status === "SUBMITTED" && (
              <>
                <button className="pill pill-muted" onClick={onApproveToDraft}>Valider (→ Brouillon)</button>
                <button className="pill pill-muted" onClick={onReject}>Refuser</button>
              </>
            )}
            {status === "NEEDS_CHANGES" && (
              <button className="pill pill-muted" onClick={() => mutate({ status: "SUBMITTED" })}>Marquer reçu</button>
            )}
          </span>
        </div>
      )}

      {/* Feedback éditeur */}
      {data.source === "PRACTITIONER" && (
        <div className="soft-card p-4 mt-3 grid gap-3">
          <div className="text-sm text-slate-700 font-medium">Feedback à l’auteur</div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[100px]"
            placeholder="Points à améliorer, consignes de réécriture, longueur, sources, etc."
          />
          <div className="flex gap-2 justify-end">
            <button className="pill pill-muted" onClick={onRequestChanges}>Demander des modifications</button>
          </div>
        </div>
      )}

      {/* Form principal */}
      <form className="soft-card p-4 mt-4 grid gap-4" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Titre *</label>
            <input value={title} onChange={(e) => handleTitleChange(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Slug *</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <div className="text-xs text-slate-500">URL publique : /blog/{slug || autoSlug || "slug"}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="SUBMITTED">En revue</option>
              <option value="NEEDS_CHANGES">À corriger</option>
              <option value="REJECTED">Refusé</option>
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
            </select>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm text-slate-700">Tags</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm text-slate-700">Résumé</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[80px]" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Auteur</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <label className="text-sm text-slate-700 mt-2">Image de couverture (URL)</label>
            <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Contenu</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[240px]" />
        </div>
      </form>
    </section>
  );
}

function useArticle(id: string) {
  const [data, _setData] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  function setData(updater: (prev: Article | null) => Article | null) {
    _setData((prev) => updater(prev));
  }

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch(`/api/admin/blog/${id}`, { cache: "no-store" });
        if (!r.ok) throw new Error();
        const json = await r.json();
        if (!cancel) _setData(json?.article ?? null);
      } catch {
        if (!cancel) {
          // On cherche d’abord la soumission locale, sinon fallback mock
          let fromLocal: Article | undefined;
          try {
            const key = "__spy_admin_blog_mock";
            const list: Article[] = JSON.parse(localStorage.getItem(key) || "[]");
            fromLocal = list.find((x) => x.id === id);
          } catch {}
          _setData(fromLocal ?? MOCK.find((x) => x.id === id) ?? MOCK[0]);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  return { data, setData, loading };
}

function statusLabel(s: ArticleStatus) {
  switch (s) {
    case "SUBMITTED": return "En revue";
    case "NEEDS_CHANGES": return "À corriger";
    case "REJECTED": return "Refusé";
    case "DRAFT": return "Brouillon";
    case "PUBLISHED": return "Publié";
    default: return s;
  }
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch { return iso; }
}

const MOCK: Article[] = [
  {
    id: "a1",
    title: "Réflexologie : bien démarrer",
    slug: "reflexologie-bien-demarrer",
    status: "PUBLISHED",
    tags: ["réflexologie","débuter"],
    author: "Équipe SPYMEO",
    source: "ADMIN",
    updatedAt: "2025-08-18",
    content: "Contenu mock…"
  },
  {
    id: "a2",
    title: "Kobido : 5 erreurs fréquentes",
    slug: "kobido-5-erreurs",
    status: "DRAFT",
    tags: ["kobido"],
    author: "Équipe SPYMEO",
    source: "ADMIN",
    updatedAt: "2025-08-12",
    content: "Contenu mock…"
  },
];
