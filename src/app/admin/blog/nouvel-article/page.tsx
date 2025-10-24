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
  const [uploadingImage, setUploadingImage] = useState(false);

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Le fichier doit être une image");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'blog');
    formData.append('userId', 'admin');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();

      if (json.success && json.url) {
        setCoverImage(json.url);
      } else {
        alert(json.error || "Erreur lors de l'upload");
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setUploadingImage(false);
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
          <label className="text-sm font-semibold text-slate-700">Image de couverture</label>

          {coverImage && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100">
              <img
                src={coverImage}
                alt="Aperçu de l'image de couverture"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className={`btn btn-outline w-full cursor-pointer ${uploadingImage ? 'opacity-50' : ''}`}
              >
                {uploadingImage ? 'Upload en cours...' : 'Uploader une image'}
              </label>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-full"
                placeholder="ou entrer une URL..."
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">Format recommandé: 16:9, max 10MB (JPG, PNG, WebP)</p>
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
