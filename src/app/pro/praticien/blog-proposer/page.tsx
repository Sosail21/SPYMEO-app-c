// src/app/pro/praticien/blog-proposer/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ArticleStatus = "SUBMITTED" | "NEEDS_CHANGES" | "REJECTED" | "DRAFT" | "PUBLISHED";

export default function PractitionerBlogSubmitPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
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

  function handleTitle(v: string) {
    setTitle(v);
    if (!slug.trim()) setSlug(slugify(v));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return alert("Le titre est requis.");
    const payload = {
      id: "sub_" + Math.random().toString(36).slice(2),
      title: title.trim(),
      slug: (slug.trim() || autoSlug),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      coverUrl: coverUrl.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      content: content.trim(),
      author: (author.trim() || "Praticien"),
      status: "SUBMITTED" as ArticleStatus,
      source: "PRACTITIONER" as const,
      submittedAt: new Date().toISOString(),
      // Optionnel : si tu as l’id du pro loggé via cookie/session, ajoute-le ici
      submittedById: "me",
    };

    try {
      // 👉 À brancher le moment venu :
      // await fetch("/api/pro/praticien/blog-submissions", { method: "POST", body: JSON.stringify(payload) });

      // Fallback démo: on “push” dans localStorage (lu côté Admin list)
      const key = "__spy_admin_blog_mock";
      const current = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([payload, ...current]));
      alert("Article envoyé à la rédaction. Vous recevrez un retour par e-mail (mock).");
      router.push("/pro/praticien/academie"); // ou rester sur place
    } catch {
      alert("Erreur à l’envoi (mock). Réessayez.");
    }
  }

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Proposer un article — Spym’Blog</h1>
            <p className="text-slate-600">
              Partagez votre expertise. L’équipe édito relira et vous répondra (validation, demande de modifs ou refus).
            </p>
          </div>
          <Link href="/blog" className="pill pill-muted">Voir le blog</Link>
        </div>
      </section>

      <section className="section">
        <form className="soft-card p-4 grid gap-4" onSubmit={onSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Titre *</label>
              <input
                value={title}
                onChange={(e) => handleTitle(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Titre de l’article"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Slug (optionnel)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder={autoSlug || "slug-automatique"}
              />
              <div className="text-xs text-slate-500">URL cible : /blog/{slug || autoSlug || "slug"}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm text-slate-700">Résumé</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
                placeholder="Court chapeau (affiché en listing)…"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Auteur (nom public)</label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Votre nom"
              />
              <label className="text-sm text-slate-700 mt-2">Image de couverture (URL)</label>
              <input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm text-slate-700">Contenu (texte)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[240px]"
                placeholder="Rédigez votre article…"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Tags</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="bien-être, nutrition, ..."
              />
              <p className="text-xs text-slate-500">
                L’équipe édito peut ajuster titre/slug/structure pour SEO/charte.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="pill pill-muted" onClick={() => alert("Brouillon local (non envoyé).")}>
              Enregistrer en local (mock)
            </button>
            <button type="submit" className="btn">Envoyer à la rédaction</button>
          </div>
        </form>
      </section>
    </main>
  );
}
