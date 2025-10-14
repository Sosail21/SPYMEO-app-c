// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type NewProductInput = {
  title: string;
  slug: string;
  priceTTC: number;
  vatRate: number;       // ex 20
  stock?: number;
  sku?: string;
  category?: string;
  status: "DRAFT" | "PUBLISHED";
  description?: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<NewProductInput>({
    title: "",
    slug: "",
    priceTTC: 0,
    vatRate: 20,
    stock: undefined,
    sku: "",
    category: "",
    status: "DRAFT",
    description: "",
  });

  // slug auto (sans écraser un slug modifié manuellement)
  useEffect(() => {
    if (!form.title.trim() || form.slug.trim()) return;
    const s = form.title
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
    setForm(prev => ({ ...prev, slug: s }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  const priceHT = useMemo(() => {
    if (!form.priceTTC || !form.vatRate) return 0;
    return form.priceTTC / (1 + form.vatRate / 100);
  }, [form.priceTTC, form.vatRate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (!form.title.trim()) throw new Error("Le titre est requis.");
      if (!form.slug.trim()) throw new Error("Le slug est requis.");
      if (form.priceTTC <= 0) throw new Error("Le prix TTC doit être > 0.");

      const res = await fetch("/api/merchant/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // Fallback dev
      if (!res.ok) await new Promise(r => setTimeout(r, 400));

      router.push(`/pro/commercants/produits`);
    } catch (err: any) {
      setError(err?.message || "Impossible d’enregistrer le produit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Nouveau produit</h1>
            <p className="text-slate-600 text-sm">Renseignez les informations principales. Vous pourrez compléter ensuite.</p>
          </div>
          <Link href="/pro/commercants/produits" className="btn btn-outline">← Catalogue</Link>
        </div>
      </section>

      <section className="section">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="soft-card p-4 grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-muted">Titre</span>
              <input
                value={form.title}
                onChange={(e)=>setForm({...form, title:e.target.value})}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="Huile essentielle de lavande BIO 10ml"
                required
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-muted">Slug</span>
              <input
                value={form.slug}
                onChange={(e)=>setForm({...form, slug:e.target.value})}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="huile-essentielle-lavande-10ml"
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
                onChange={(e)=>setForm({...form, priceTTC: Number(e.target.value)})}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="8.90"
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
                onChange={(e)=>setForm({...form, vatRate: Number(e.target.value)})}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="20"
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
                onChange={(e)=>setForm({...form, stock: e.target.value ? Number(e.target.value) : undefined})}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="ex. 24"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-muted">SKU (optionnel)</span>
              <input
                value={form.sku ?? ""}
                onChange={(e)=>setForm({...form, sku:e.target.value})}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="HE-LAV-10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-muted">Catégorie (optionnel)</span>
              <input
                value={form.category ?? ""}
                onChange={(e)=>setForm({...form, category:e.target.value})}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="Aromathérapie"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-muted">Statut</span>
              <select
                value={form.status}
                onChange={(e)=>setForm({...form, status: e.target.value as any})}
                className="rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
              </select>
            </label>

            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-muted">Description (optionnel)</span>
              <textarea
                value={form.description ?? ""}
                onChange={(e)=>setForm({...form, description:e.target.value})}
                className="rounded-xl border border-slate-200 px-3 py-2"
                rows={5}
                placeholder="Composition, usage, précautions..."
              />
            </label>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <Link href="/pro/commercants/produits" className="btn btn-outline">Annuler</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
