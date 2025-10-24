// Cdw-Spm: Practitioner Blog Submission Form
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PractitionerBlogSubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    readingMinutes: 5,
  });

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(title: string) {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/pro/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags,
        }),
      });

      const json = await res.json();

      if (json.success) {
        alert(json.message || "Article soumis avec succès !");
        router.push("/pro/dashboard");
      } else {
        setError(json.error || "Erreur lors de la soumission");
      }
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section">
      <div className="container-spy max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Proposer un article</h1>
          <p className="text-muted">
            Partagez votre expertise avec la communauté SPYMEO. Votre article sera examiné par notre équipe avant publication.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="soft-card p-6 grid gap-6">
          <div className="grid gap-2">
            <label className="font-semibold">
              Titre de l'article <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="page"
              placeholder="Ex: Les bienfaits de la réflexologie plantaire"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="font-semibold">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="page"
              placeholder="les-bienfaits-de-la-reflexologie-plantaire"
              required
            />
            <p className="text-sm text-muted">
              L'article sera accessible sur : https://spymeo.fr/blog/{formData.slug || "votre-slug"}
            </p>
          </div>

          <div className="grid gap-2">
            <label className="font-semibold">
              Résumé <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="page"
              rows={3}
              placeholder="Un court résumé qui donnera envie de lire l'article..."
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="font-semibold">
              Contenu <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="page"
              rows={20}
              placeholder="Rédigez votre article ici... (Markdown supporté: ## Titre, **gras**, *italique*, - liste)"
              required
            />
            <p className="text-sm text-muted">
              Vous pouvez utiliser le format Markdown pour mettre en forme votre texte.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="font-semibold">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="page"
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
              <label className="font-semibold">Temps de lecture (min)</label>
              <input
                type="number"
                value={formData.readingMinutes}
                onChange={(e) => setFormData({ ...formData, readingMinutes: parseInt(e.target.value) || 5 })}
                className="page"
                min="1"
                max="60"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="font-semibold">Tags (séparés par des virgules)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="page"
              placeholder="réflexologie, bien-être, santé naturelle"
            />
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Link href="/pro/dashboard" className="btn btn-outline">
              Annuler
            </Link>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Envoi en cours..." : "Soumettre l'article"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
