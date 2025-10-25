// Cdw-Spm: Admin Blog Article Edit with Real API
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useConfirm } from "@/hooks/useConfirm";

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const confirmDialog = useConfirm();

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      await confirmDialog.confirm({
        title: "Attention",
        message: "Le fichier est trop volumineux (max 10MB)",
        confirmText: "OK",
        cancelText: "",
        variant: "warning"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      await confirmDialog.confirm({
        title: "Attention",
        message: "Le fichier doit être une image",
        confirmText: "OK",
        cancelText: "",
        variant: "warning"
      });
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
        await confirmDialog.confirm({
          title: "Erreur",
          message: json.error || "Erreur lors de l'upload",
          confirmText: "OK",
          cancelText: "",
          variant: "danger"
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Erreur lors de l'upload de l'image",
        confirmText: "OK",
        cancelText: "",
        variant: "danger"
      });
    } finally {
      setUploadingImage(false);
    }
  }

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
        await confirmDialog.confirm({
          title: "Erreur",
          message: "Article introuvable",
          confirmText: "OK",
          cancelText: "",
          variant: "danger"
        });
        router.push("/admin/blog");
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Erreur de chargement",
        confirmText: "OK",
        cancelText: "",
        variant: "danger"
      });
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
    if (!title.trim()) {
      await confirmDialog.confirm({
        title: "Attention",
        message: "Le titre est requis.",
        confirmText: "OK",
        cancelText: "",
        variant: "warning"
      });
      return;
    }
    if (!slug.trim()) {
      await confirmDialog.confirm({
        title: "Attention",
        message: "Le slug est requis.",
        confirmText: "OK",
        cancelText: "",
        variant: "warning"
      });
      return;
    }
    if (!content.trim()) {
      await confirmDialog.confirm({
        title: "Attention",
        message: "Le contenu est requis.",
        confirmText: "OK",
        cancelText: "",
        variant: "warning"
      });
      return;
    }

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
        await confirmDialog.confirm({
          title: "Succès",
          message: "Article mis à jour avec succès !",
          confirmText: "OK",
          cancelText: ""
        });
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
    const confirmed = await confirmDialog.confirm({
      title: "Supprimer l'article",
      message: `Supprimer définitivement "${article?.title}" ?`,
      confirmText: "Confirmer",
      cancelText: "Annuler",
      variant: "danger"
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/blog/${params.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        await confirmDialog.confirm({
          title: "Succès",
          message: "Article supprimé",
          confirmText: "OK",
          cancelText: ""
        });
        router.push("/admin/blog");
      } else {
        await confirmDialog.confirm({
          title: "Erreur",
          message: "Erreur lors de la suppression",
          confirmText: "OK",
          cancelText: "",
          variant: "danger"
        });
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Erreur réseau",
        confirmText: "OK",
        cancelText: "",
        variant: "danger"
      });
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
                id="cover-upload-edit"
              />
              <label
                htmlFor="cover-upload-edit"
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

      <ConfirmModal
        open={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
      />
    </section>
  );
}
