// Cdw-Spm: Admin Blog Article Creation with Real API
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";

type ArticleStatus = "DRAFT" | "PUBLISHED";

export default function AdminBlogNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("DRAFT");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [readingMinutes, setReadingMinutes] = useState(5);

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

  async function onSubmit(e: React.FormEvent, publishNow = false) {
    e.preventDefault();
    if (!title.trim()) return alert("Le titre est requis.");
    if (!slug.trim()) return alert("Le slug est requis.");
    if (!content.trim()) return alert("Le contenu est requis.");

    setError("");
    setLoading(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      status: publishNow ? "PUBLISHED" : status,
      category: category.trim() || undefined,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      coverImage: coverImage.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      content: content.trim(),
      readingMinutes
    };

    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success) {
        alert(`Article ${publishNow ? 'publié' : 'créé'} avec succès !`);
        router.push("/admin/blog");
      } else {
        setError(json.error || "Erreur lors de la création");
      }
    } catch (err) {
      setError("Erreur réseau lors de la création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Nouvel article</h1>
          <p className="text-slate-600">Renseignez les informations, enregistrez en brouillon ou publiez directement. L'auteur sera automatiquement "Équipe SPYMEO".</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog" className="pill pill-muted">Annuler</Link>
        </div>
      </div>

      <form className="soft-card p-4 mt-4 grid gap-4" onSubmit={(e) => onSubmit(e, false)}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">Titre <span className="text-red-500">*</span></label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Titre de l'article"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">Slug <span className="text-red-500">*</span></label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder={autoSlug || "slug-automatique"}
              required
            />
            <div className="text-xs text-slate-500">URL publique : https://spymeo.fr/blog/{slug || autoSlug || "slug"}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">-- Choisir --</option>
              <option value="Santé globale">Santé globale</option>
              <option value="Pratique">Pratique</option>
              <option value="Vie locale">Vie locale</option>
              <option value="Témoignage">Témoignage</option>
              <option value="Conseils">Conseils</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">Temps de lecture (min)</label>
            <input
              type="number"
              value={readingMinutes}
              onChange={(e) => setReadingMinutes(parseInt(e.target.value) || 5)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              min="1"
              max="60"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Tags (séparés par des virgules)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="bien-être, nutrition, santé naturelle..."
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Image de couverture (URL)</label>
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Résumé</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
            placeholder="Court résumé affiché dans les listes et aperçus…"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Contenu <span className="text-red-500">*</span></label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[320px]"
            placeholder="Écrivez votre article... (Markdown supporté: ## Titre, **gras**, *italique*, - liste)"
            required
          />
          <p className="text-xs text-slate-500">Vous pouvez utiliser le format Markdown pour mettre en forme votre texte.</p>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            type="submit"
            className="btn btn-outline"
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer en brouillon"}
          </button>
          <button
            type="button"
            onClick={(e) => onSubmit(e, true)}
            className="btn"
            disabled={loading}
          >
            {loading ? "Publication..." : "Publier maintenant"}
          </button>
        </div>
      </form>
    </section>
  );
}
