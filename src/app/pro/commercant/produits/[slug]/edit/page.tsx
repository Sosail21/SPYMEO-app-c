"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  MOCK_PRODUCTS_COMMERCANT,
  type Product,
  type ProductStatus,
} from "@/lib/mockdb/products-commercant";

type Form = {
  title: string;
  slug: string;
  priceTTC: number;
  vatRate: number;
  stock?: number;
  sku?: string;
  category?: string;
  status: ProductStatus;
  description?: string;
  imageUrl?: string;
};

export default function EditProductPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();

  const [original, setOriginal] = useState<Product | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch(`/api/merchant/products/${slug}`, { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) {
          const p: Product | null = json?.product ?? null;
          setOriginal(p);
          setForm(p ? toForm(p) : null);
        }
      } catch {
        if (!cancel) {
          const mock = MOCK_PRODUCTS_COMMERCANT.find(p => p.slug === slug) ?? null;
          setOriginal(mock);
          setForm(mock ? toForm(mock) : null);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [slug]);

  if (!loading && !original) {
    notFound();
  }

  const priceHT = useMemo(() => {
    if (!form?.priceTTC || !form?.vatRate) return 0;
    return form.priceTTC / (1 + form.vatRate / 100);
  }, [form?.priceTTC, form?.vatRate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      if (!form.title.trim()) throw new Error("Le titre est requis.");
      if (!form.slug.trim()) throw new Error("Le slug est requis.");
      if (form.priceTTC <= 0) throw new Error("Le prix TTC doit être > 0.");
      // tentative API
      const r = await fetch(`/api/merchant/products/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        // fallback mock (pas d’API)
        await new Promise((res) => setTimeout(res, 300));
      }
      router.push(`/pro/commercants/produits/${form.slug}`);
    } catch (err:any) {
      setError(err?.message ?? "Impossible d’enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  }

  function onImageChange(file?: File) {
    if (!file) return;
    // mock: preview locale (remplacer + persister côté API plus tard)
    const url = URL.createObjectURL(file);
    setForm((prev) => prev ? { ...prev, imageUrl: url } : prev);
  }

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* Fil d’Ariane */}
      <section className="section">
        <nav className="text-sm text-slate-600">
          <Link href="/pro/commercants/produits" className="hover:underline">Catalogue</Link>
          <span> / </span>
          <Link href={`/pro/commercants/produits/${slug}`} className="hover:underline">{original?.title ?? slug}</Link>
          <span> / </span>
          <span>Éditer</span>
        </nav>
      </section>

      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Éditer le produit</h1>
            {original && <p className="text-slate-600 text-sm">Créé / MAJ : {original.updatedAt ? fmtDate(original.updatedAt) : "—"}</p>}
          </div>
          <Link href={`/pro/commercants/produits/${slug}`} className="btn btn-outline">← Retour</Link>
        </div>
      </section>

      {loading || !form ? (
        <section className="section">
          <div className="soft-card p-4 animate-pulse"><div className="h-4 w-1/3 bg-slate-200 rounded" /></div>
        </section>
      ) : (
        <section className="section">
          <form onSubmit={onSubmit} className="grid gap-4">
            {/* Media */}
            <div className="soft-card p-4 grid md:grid-cols-[200px_1fr] gap-4">
              <div className="grid gap-2">
                <div className="w-full aspect-square rounded-xl bg-[#eef3f6] border border-border overflow-hidden">
                  {form.imageUrl ? <img src={form.imageUrl} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <label className="btn btn-outline text-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onImageChange(e.target.files?.[0])}
                  />
                  Importer une image
                </label>
              </div>

              {/* Champs */}
              <div className="grid md:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm text-muted">Titre</span>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                    required
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm text-muted">Slug</span>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                    required
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm text-muted">Prix TTC (€)</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.priceTTC}
                    onChange={(e) => setForm({ ...form, priceTTC: Number(e.target.value) })}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                    required
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm text-muted">TVA (%)</span>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={form.vatRate}
                    onChange={(e) => setForm({ ...form, vatRate: Number(e.target.value) })}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                    required
                  />
                </label>

                <div className="grid gap-1">
                  <span className="text-sm text-muted">Prix HT (auto)</span>
                  <div className="rounded-xl border border-slate-200 px-3 py-2 bg-[#f7fbfd]">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(priceHT)}
                  </div>
                </div>

                <label className="grid gap-1">
                  <span className="text-sm text-muted">Stock (optionnel)</span>
                  <input
                    type="number"
                    min={0}
                    value={form.stock ?? ""}
                    onChange={(e) => setForm({ ...form, stock: e.target.value ? Number(e.target.value) : undefined })}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm text-muted">SKU (optionnel)</span>
                  <input
                    value={form.sku ?? ""}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm text-muted">Catégorie (optionnel)</span>
                  <input
                    value={form.category ?? ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm text-muted">Statut</span>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <option value="DRAFT">Brouillon</option>
                    <option value="PUBLISHED">Publié</option>
                    <option value="ARCHIVED">Archivé</option>
                  </select>
                </label>

                <label className="grid gap-1 md:col-span-2">
                  <span className="text-sm text-muted">Description (optionnel)</span>
                  <textarea
                    value={form.description ?? ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                    rows={6}
                  />
                </label>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <Link href={`/pro/commercants/produits/${slug}`} className="btn btn-outline">Annuler</Link>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}

function toForm(p: Product): Form {
  return {
    title: p.title,
    slug: p.slug,
    priceTTC: p.priceTTC,
    vatRate: p.vatRate,
    stock: p.stock,
    sku: p.sku,
    category: p.category,
    status: p.status,
    description: p.description,
    imageUrl: (p as any).imageUrl,
  };
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch { return iso; }
}
