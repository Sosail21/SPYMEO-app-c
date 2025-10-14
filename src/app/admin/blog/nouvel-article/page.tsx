// Cdw-Spm
// src/app/admin/blog/nouvel-article/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ArticleStatus = "DRAFT" | "PUBLISHED";

export default function AdminBlogNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("DRAFT");
  const [tags, setTags] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return alert("Le titre est requis.");
    if (!slug.trim()) return alert("Le slug est requis.");
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      status,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      coverUrl: coverUrl.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      content: content.trim(),
      author: author.trim() || undefined,
    };
    try {
      // À brancher : POST /api/admin/blog
      // const r = await fetch("/api/admin/blog", { method: "POST", body: JSON.stringify(payload) });
      // if (!r.ok) throw new Error();
      alert("Article créé (mock). À brancher sur l’API.");
      router.push("/admin/blog");
    } catch {
      alert("Erreur lors de la création (mock).");
    }
  }

  return (
    <section className="section">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Nouvel article</h1>
          <p className="text-slate-600">Renseignez les informations, enregistrez en brouillon ou publiez directement.</p>
        </div>
        <div className="flex gap-2">
          <button className="pill pill-muted" onClick={() => { setStatus("DRAFT"); alert("Enregistré (mock)"); }}>Enregistrer brouillon</button>
          <button className="btn" onClick={onSubmit}>Publier</button>
        </div>
      </div>

      <form className="soft-card p-4 mt-4 grid gap-4" onSubmit={onSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Titre *</label>
            <input value={title} onChange={(e) => handleTitleChange(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Titre de l’article" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Slug *</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder={autoSlug || "slug-automatique"} />
            <div className="text-xs text-slate-500">URL publique : /blog/{slug || autoSlug || "slug"}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
            </select>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm text-slate-700">Tags (séparés par des virgules)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="bien-être, nutrition, ..." />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm text-slate-700">Résumé</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[80px]" placeholder="Court résumé affiché dans les listes…" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Auteur</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Nom de l’auteur" />
            <label className="text-sm text-slate-700 mt-2">Image de couverture (URL)</label>
            <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="https://..." />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Contenu</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[240px]" placeholder="Écrivez votre article (Markdown accepté plus tard)…" />
        </div>

        {/* Aperçu très basique */}
        {content.trim() && (
          <div className="soft-card p-4">
            <div className="text-sm text-slate-500 mb-2">Aperçu rapide (texte brut) :</div>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{content}</div>
          </div>
        )}
      </form>
    </section>
  );
}
