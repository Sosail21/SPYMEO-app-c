// Cdw-Spm: Admin Blog Article Edit with Real API
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ArticleStatus = "DRAFT" | "SUBMITTED" | "NEEDS_CHANGES" | "REJECTED" | "PUBLISHED";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  readingMinutes: number;
  status: ArticleStatus;
  authorName: string;
  source?: string;
  views: number;
  likesCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminBlogEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
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

  useEffect(() => {
    fetchArticle();
  }, [params.id]);

  async function fetchArticle() {
    try {
      const res = await fetch(`/api/admin/blog/${params.id}`);
      const json = await res.json();

      if (json.success) {
        const art = json.article;
        setArticle(art);
        setTitle(art.title);
        setSlug(art.slug);
        setStatus(art.status);
        setCategory(art.category || "");
        setTags(art.tags.join(", "));
        setCoverImage(art.coverImage || "");
        setExcerpt(art.excerpt || "");
        setContent(art.content || "");
        setReadingMinutes(art.readingMinutes);
      } else {
        alert("Article introuvable");
        router.push("/admin/blog");
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      alert("Erreur de chargement");
      router.push("/admin/blog");
    } finally {
      setLoading(false);
    }
  }

  function slugify(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}+/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(v: string) {
    setTitle(v);
  }

  async function handleSave(e: React.FormEvent, publishNow = false) {
    e.preventDefault();
    if (!title.trim()) return alert("Le titre est requis.");
    if (!slug.trim()) return alert("Le slug est requis.");
    if (!content.trim()) return alert("Le contenu est requis.");

    setError("");
    setSaveLoading(true);

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
      const res = await fetch(`/api/admin/blog/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success) {
        alert("Article mis à jour avec succès !");
        router.push("/admin/blog");
      } else {
        setError(json.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      setError("Erreur réseau lors de la mise à jour");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement "${article?.title}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/blog/${params.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("Article supprimé");
        router.push("/admin/blog");
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Erreur réseau");
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Chargement de l'article...</p>
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="section">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Article non trouvé</h1>
          <Link href="/admin/blog" className="btn">← Retour à la liste</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Éditer l'article</h1>
          <p className="text-slate-600">
            {article.source === "PRACTITIONER" && (
              <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm mr-2">
                Proposé par {article.authorName}
              </span>
            )}
            {article.views} vues · {article.likesCount} likes
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog" className="pill pill-muted">← Retour</Link>
          <button
            onClick={handleDelete}
            className="pill pill-muted hover:bg-red-100 text-red-600"
          >
            Supprimer
          </button>
        </div>
      </div>

      <form className="soft-card p-4 mt-4 grid gap-4" onSubmit={(e) => handleSave(e, false)}>
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
              required
            />
            <div className="text-xs text-slate-500">URL publique : https://spymeo.fr/blog/{slug}</div>
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
              <option value="SUBMITTED">Soumis</option>
              <option value="NEEDS_CHANGES">À corriger</option>
              <option value="REJECTED">Refusé</option>
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
            disabled={saveLoading}
          >
            {saveLoading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
          {status !== "PUBLISHED" && (
            <button
              type="button"
              onClick={(e) => handleSave(e, true)}
              className="btn"
              disabled={saveLoading}
            >
              {saveLoading ? "Publication..." : "Publier maintenant"}
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 soft-card p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Informations</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Auteur:</span>
            <span className="font-semibold">{article.authorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Source:</span>
            <span className="font-semibold">{article.source === "PRACTITIONER" ? "Praticien" : "Admin"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Créé le:</span>
            <span className="font-semibold">{new Date(article.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Mis à jour le:</span>
            <span className="font-semibold">{new Date(article.updatedAt).toLocaleDateString("fr-FR")}</span>
          </div>
          {article.publishedAt && (
            <div className="flex justify-between">
              <span className="text-muted">Publié le:</span>
              <span className="font-semibold">{new Date(article.publishedAt).toLocaleDateString("fr-FR")}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
