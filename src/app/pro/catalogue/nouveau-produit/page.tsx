"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Types
type ProductStatus = "DRAFT" | "PUBLISHED";

type NewProduct = {
  title: string;
  slug: string;
  sku?: string;
  price: number | "";
  stock: number | "";
  status: ProductStatus;
  shortDesc?: string;
  description?: string;
  categories: string[];
  tags: string[];
  images: string[]; // dataURL ou URL
};

// Utils
function toSlug(input: string) {
  return input
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim().toLowerCase().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 border border-slate-200">{children}</span>;
}

export default function NouveauProduitPage() {
  const r = useRouter();

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<NewProduct>({
    title: "",
    slug: "",
    sku: "",
    price: "",
    stock: 0,
    status: "DRAFT",
    shortDesc: "",
    description: "",
    categories: [],
    tags: [],
    images: [],
  });

  // Slug auto depuis le titre (modifiable)
  useEffect(() => {
    if (!form.title) {
      setForm((f) => ({ ...f, slug: "" }));
      return;
    }
    setForm((f) => ({ ...f, slug: toSlug(f.title) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  // Validations mini
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Titre requis";
    if (!form.slug.trim()) e.slug = "Slug requis";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = "Prix invalide";
    if (form.stock === "" || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = "Stock invalide";
    return e;
  }, [form]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(errors).length) {
      setErr("Merci de corriger les champs en erreur.");
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch("/api/catalogue/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Erreur serveur");
      }
      // Redirection vers le catalogue
      r.replace("/pro/catalogue");
    } catch (e: any) {
      setErr(e.message || "Échec de l’enregistrement");
      setSaving(false);
    }
  }

  // Gestion images (DataURL en mock)
  async function onPickImages(files: FileList | null) {
    if (!files || !files.length) return;
    const arr = await Promise.all(
      Array.from(files).slice(0, 6).map(
        (f) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(f);
          })
      )
    );
    setForm((f) => ({ ...f, images: [...f.images, ...arr].slice(0, 6) }));
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  function addChip(kind: "categories" | "tags", value: string) {
    const v = value.trim();
    if (!v) return;
    setForm((f) => ({ ...f, [kind]: Array.from(new Set([...(f as any)[kind], v])) }));
  }

  // UI
  return (
    <main className="section">
      <div className="container-spy space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Nouveau produit</h1>
            <p className="text-muted">Créez un produit (ou une formation) puis publiez-le.</p>
          </div>
          <Link
            href="/pro/catalogue"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            ← Retour au catalogue
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Colonne 1-2 : infos principales */}
          <div className="lg:col-span-2 space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Titre *</label>
                  <input
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      errors.title ? "border-rose-400" : "border-slate-300"
                    }`}
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Huile essentielle de lavande — 10ml"
                    maxLength={120}
                  />
                  {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Slug *</label>
                  <input
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                      errors.slug ? "border-rose-400" : "border-slate-300"
                    }`}
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: toSlug(e.target.value) }))}
                    placeholder="huile-essentielle-lavande-10ml"
                    maxLength={140}
                  />
                  {errors.slug && <p className="text-xs text-rose-600 mt-1">{errors.slug}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    value={form.sku || ""}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    placeholder="REF-001"
                    maxLength={40}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prix TTC (€) *</label>
                  <input
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                      errors.price ? "border-rose-400" : "border-slate-300"
                    }`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.valueAsNumber || "" }))}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-xs text-rose-600 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Stock *</label>
                  <input
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                      errors.stock ? "border-rose-400" : "border-slate-300"
                    }`}
                    type="number"
                    min={0}
                    step="1"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.valueAsNumber || 0 }))}
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-xs text-rose-600 mt-1">{errors.stock}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProductStatus }))}
                  >
                    <option value="DRAFT">Brouillon</option>
                    <option value="PUBLISHED">Publié</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Description courte</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    value={form.shortDesc || ""}
                    onChange={(e) => setForm((f) => ({ ...f, shortDesc: e.target.value }))}
                    placeholder="Accroche en une phrase…"
                    maxLength={160}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description détaillée</label>
                <textarea
                  className="mt-1 w-full h-40 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={form.description || ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Bénéfices, composition, conseils d’usage…"
                />
              </div>
            </section>

            {/* Images */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Images</h3>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onPickImages(e.target.files)}
                  className="text-sm"
                />
              </div>
              {form.images.length === 0 ? (
                <p className="text-sm text-muted">Ajoutez jusqu’à 6 images (la première sera l’image principale).</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {form.images.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt={`img-${i}`} className="w-full h-40 object-cover rounded-xl border" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="opacity-0 group-hover:opacity-100 transition absolute top-2 right-2 rounded-lg bg-rose-600 text-white text-xs px-2 py-1"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Colonne 3 : catégories/tags + actions */}
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Catégories</label>
                <CategoryInput
                  values={form.categories}
                  onAdd={(v) => addChip("categories", v)}
                  onRemove={(v) =>
                    setForm((f) => ({ ...f, categories: f.categories.filter((x) => x !== v) }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags</label>
                <TagInput
                  values={form.tags}
                  onAdd={(v) => addChip("tags", v)}
                  onRemove={(v) => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== v) }))}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
              {err && <p className="text-sm text-rose-600">{err}</p>}
              <button
                disabled={saving}
                type="submit"
                className="w-full rounded-xl bg-sky-600 text-white px-4 py-2 text-sm hover:bg-sky-700 disabled:opacity-50"
              >
                {saving ? "Enregistrement…" : form.status === "PUBLISHED" ? "Publier" : "Enregistrer le brouillon"}
              </button>
              <Link
                href="/pro/catalogue"
                className="block text-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
              >
                Annuler
              </Link>
              <div className="text-xs text-muted">
                Le <strong>slug</strong> détermine l’URL publique (ex : <code>/produit/{form.slug || "mon-produit"}</code>).
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <div className="text-sm font-medium mb-2">Aperçu SEO</div>
              <div className="text-sky-700 text-sm truncate">{form.title || "Titre du produit"}</div>
              <div className="text-emerald-700 text-xs truncate">https://spymeo.fr/produit/{form.slug || "slug"}</div>
              <div className="text-slate-600 text-sm mt-1 line-clamp-2">
                {form.shortDesc || "Votre description courte apparaîtra ici."}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-2">
              <div className="text-sm font-medium">Récap</div>
              <div className="flex flex-wrap gap-2">
                <Pill>{form.status === "PUBLISHED" ? "Publié" : "Brouillon"}</Pill>
                <Pill>{form.price ? `${form.price} €` : "Prix —"}</Pill>
                <Pill>{typeof form.stock === "number" ? `${form.stock} en stock` : "Stock —"}</Pill>
                {form.sku && <Pill>SKU {form.sku}</Pill>}
              </div>
            </section>
          </div>
        </form>
      </div>
    </main>
  );
}

// Inputs chips
function Chip({ text, onRemove }: { text: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs">
      {text}
      <button onClick={onRemove} type="button" className="text-slate-500 hover:text-slate-800">×</button>
    </span>
  );
}

function CategoryInput({
  values,
  onAdd,
  onRemove,
}: {
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [val, setVal] = useState("");
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd(val);
              setVal("");
            }
          }}
          placeholder="Ex: Bien-être"
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            onAdd(val);
            setVal("");
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
        >
          Ajouter
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v) => (
            <Chip key={v} text={v} onRemove={() => onRemove(v)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TagInput({
  values,
  onAdd,
  onRemove,
}: {
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [val, setVal] = useState("");
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd(val);
              setVal("");
            }
          }}
          placeholder="Ex: sommeil, lavande"
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            onAdd(val);
            setVal("");
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
        >
          Ajouter
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v) => (
            <Chip key={v} text={v} onRemove={() => onRemove(v)} />
          ))}
        </div>
      )}
    </div>
  );
}
