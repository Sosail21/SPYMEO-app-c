// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  Product,
  ProductStatus,
} from "@/types/products-commercant";
import { downloadCsv, toCsv } from "@/lib/csv";

const TABS: { key: "ALL" | ProductStatus; label: string }[] = [
  { key: "ALL", label: "Tous" },
  { key: "PUBLISHED", label: "Publiés" },
  { key: "DRAFT", label: "Brouillons" },
  { key: "ARCHIVED", label: "Archivés" },
];

type SortKey =
  | "TITLE_ASC" | "TITLE_DESC"
  | "PRICE_ASC" | "PRICE_DESC"
  | "STOCK_ASC" | "STOCK_DESC"
  | "UPDATED_DESC";

export default function MerchantProductsPage() {
  const [data, setData] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);

  // filtres
  const [activeTab, setActiveTab] = useState<"ALL" | ProductStatus>("ALL");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | "ALL">("ALL");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [onlyOutOfStock, setOnlyOutOfStock] = useState(false);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");

  // tri + pagination
  const [sort, setSort] = useState<SortKey>("UPDATED_DESC");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // sélection multiple
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);
  const someSelected = selectedIds.length > 0;

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/merchant/products", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setData(json?.products ?? []);
      } catch {
        if (!cancel) setData([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((p) => { if (p.category) set.add(p.category); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filtered = useMemo(() => {
    let list = (data ?? [])
      .filter((p) => (activeTab === "ALL" ? true : p.status === activeTab))
      .filter((p) => (cat === "ALL" ? true : p.category === cat))
      .filter((p) => {
        if (!q.trim()) return true;
        const hay = `${p.title} ${p.slug} ${p.sku ?? ""} ${p.category ?? ""}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      });

    if (onlyLowStock) list = list.filter((p) => typeof p.stock === "number" && p.stock > 0 && p.stock <= 3);
    if (onlyOutOfStock) list = list.filter((p) => (p.stock ?? 0) <= 0);

    // prix
    const min = priceMin ? Number(priceMin) : undefined;
    const max = priceMax ? Number(priceMax) : undefined;
    if (min != null && !Number.isNaN(min)) list = list.filter((p) => p.priceTTC >= min);
    if (max != null && !Number.isNaN(max)) list = list.filter((p) => p.priceTTC <= max);

    // tri
    list = list.slice().sort((a, b) => {
      switch (sort) {
        case "TITLE_ASC": return a.title.localeCompare(b.title);
        case "TITLE_DESC": return b.title.localeCompare(a.title);
        case "PRICE_ASC": return a.priceTTC - b.priceTTC;
        case "PRICE_DESC": return b.priceTTC - a.priceTTC;
        case "STOCK_ASC": return (a.stock ?? -1) - (b.stock ?? -1);
        case "STOCK_DESC": return (b.stock ?? -1) - (a.stock ?? -1);
        case "UPDATED_DESC":
        default: {
          const da = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const db = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return db - da;
        }
      }
    });

    return list;
  }, [data, activeTab, q, cat, sort, onlyLowStock, onlyOutOfStock, priceMin, priceMax]);

  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  // reset pagination quand filtres changent
  useEffect(() => { setPage(1); }, [activeTab, q, cat, sort, onlyLowStock, onlyOutOfStock, priceMin, priceMax, pageSize]);

  // Sélection
  function toggleAllCurrentPage() {
    const allSelected = slice.every((p) => selected[p.id]);
    const next: Record<string, boolean> = { ...selected };
    slice.forEach((p) => { next[p.id] = !allSelected; });
    setSelected(next);
  }
  function clearSelection() { setSelected({}); }

  // Actions groupées (optimiste + mock)
  function bulkPublish() {
    if (!data) return;
    const updated = data.map((p) => selectedIds.includes(p.id) ? { ...p, status: "PUBLISHED" as ProductStatus } : p);
    setData(updated);
    clearSelection();
    alert(`Publié ${selectedIds.length} produit(s). (mock)`);
  }
  function bulkArchive() {
    if (!data) return;
    const updated = data.map((p) => selectedIds.includes(p.id) ? { ...p, status: "ARCHIVED" as ProductStatus } : p);
    setData(updated);
    clearSelection();
    alert(`Archivé ${selectedIds.length} produit(s). (mock)`);
  }
  function bulkDuplicate() {
    if (!data) return;
    const clones: Product[] = [];
    for (const id of selectedIds) {
      const p = data.find((x) => x.id === id);
      if (!p) continue;
      const clone: Product = {
        ...p,
        id: `${p.id}-copy-${Math.random().toString(36).slice(2, 7)}`,
        title: `${p.title} (copie)`,
        slug: `${p.slug}-copie-${Math.random().toString(36).slice(2, 4)}`,
        status: "DRAFT",
        updatedAt: new Date().toISOString(),
      };
      clones.push(clone);
    }
    setData([...(data ?? []), ...clones]);
    clearSelection();
    alert(`Dupliqué ${clones.length} produit(s). (mock)`);
  }
  function bulkExport() {
    const rows = (data ?? []).filter((p) => selectedIds.includes(p.id));
    const source = rows.length > 0 ? rows : filtered; // si rien sélectionné ➜ export la vue filtrée
    const csv = toCsv(
      source.map((p) => ({
        id: p.id,
        titre: p.title,
        slug: p.slug,
        prixTTC: p.priceTTC,
        tva: p.vatRate,
        stock: p.stock ?? "",
        sku: p.sku ?? "",
        categorie: p.category ?? "",
        statut: p.status,
        maj: p.updatedAt ?? "",
      })),
      ["id", "titre", "slug", "prixTTC", "tva", "stock", "sku", "categorie", "statut", "maj"]
    );
    downloadCsv(`produits_${new Date().toISOString().slice(0,10)}.csv`, csv);
  }

  // actions ligne (optimiste)
  function linePublish(slug: string) {
    if (!data) return;
    setData(data.map((p) => p.slug === slug ? { ...p, status: "PUBLISHED" } : p));
  }
  function lineArchive(slug: string) {
    if (!data) return;
    setData(data.map((p) => p.slug === slug ? { ...p, status: "ARCHIVED" } : p));
  }

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* Header */}
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Catalogue produits</h1>
            <p className="text-slate-600 text-sm">Gérez votre offre, prix, stocks et mise en ligne.</p>
          </div>
          <div className="flex gap-2">
            <button className="pill pill-muted" onClick={bulkExport} title="Exporter CSV de la sélection (ou de la vue filtrée)">
              Exporter CSV
            </button>
            <Link href="/pro/commercants/produits/nouveau" className="btn">+ Nouveau produit</Link>
          </div>
        </div>
      </section>

      {/* Filtres & tri */}
      <section className="section">
        <div className="soft-card p-3 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <nav className="chips-row my-0">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key as any)}
                  className={"chip " + (activeTab === t.key ? "chip-active" : "")}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as any)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="ALL">Toutes catégories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher titre, SKU…"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyLowStock} onChange={(e) => setOnlyLowStock(e.target.checked)} />
              Stock faible (≤ 3)
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyOutOfStock} onChange={(e) => setOnlyOutOfStock(e.target.checked)} />
              Rupture (0)
            </label>

            <div className="flex items-center gap-2 text-sm">
              <span>Prix (€)</span>
              <input
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="min"
                className="rounded-xl border border-slate-200 px-3 py-1.5 w-20"
                inputMode="decimal"
              />
              <span>—</span>
              <input
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="max"
                className="rounded-xl border border-slate-200 px-3 py-1.5 w-20"
                inputMode="decimal"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                title="Tri"
              >
                <option value="UPDATED_DESC">Tri : Dernière MAJ</option>
                <option value="TITLE_ASC">Nom A→Z</option>
                <option value="TITLE_DESC">Nom Z→A</option>
                <option value="PRICE_ASC">Prix ↑</option>
                <option value="PRICE_DESC">Prix ↓</option>
                <option value="STOCK_ASC">Stock ↑</option>
                <option value="STOCK_DESC">Stock ↓</option>
              </select>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                title="Taille de page"
              >
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>

          {/* Barre d’actions groupées */}
          </div>
          {someSelected && (
            <div className="soft-card p-3 border border-accent/30 bg-[#f7fbfd] flex items-center justify-between">
              <div className="text-sm">
                {selectedIds.length} élément{selectedIds.length > 1 ? "s" : ""} sélectionné{selectedIds.length > 1 ? "s" : ""}
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="pill pill-ghost" onClick={bulkPublish}>Publier</button>
                <button className="pill pill-muted" onClick={bulkArchive}>Archiver</button>
                <button className="pill pill-ghost" onClick={bulkDuplicate}>Dupliquer</button>
                <button className="pill pill-muted" onClick={bulkExport}>Exporter CSV</button>
                <button className="pill pill-muted" onClick={clearSelection}>Annuler sélection</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Liste */}
      <section className="section">
        {loading ? (
          <ListSkeleton />
        ) : slice.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th className="w-[44px]">
                    <input
                      aria-label="Tout sélectionner (page)"
                      type="checkbox"
                      checked={slice.length > 0 && slice.every((p) => selected[p.id])}
                      onChange={toggleAllCurrentPage}
                    />
                  </Th>
                  <Th>Produit</Th>
                  <Th className="hidden md:table-cell">SKU</Th>
                  <Th>Prix</Th>
                  <Th>Stock</Th>
                  <Th className="hidden md:table-cell">Catégorie</Th>
                  <Th className="hidden md:table-cell">MAJ</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {slice.map((p) => {
                  const low = typeof p.stock === "number" && p.stock > 0 && p.stock <= 3;
                  const out = (p.stock ?? 0) <= 0;

                  return (
                    <tr key={p.id} className="border-t">
                      <Td>
                        <input
                          aria-label={`Sélectionner ${p.title}`}
                          type="checkbox"
                          checked={!!selected[p.id]}
                          onChange={(e) => setSelected((prev) => ({ ...prev, [p.id]: e.target.checked }))}
                        />
                      </Td>
                      <Td>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[#eef3f6] border border-border shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/pro/commercants/produits/${p.slug}`}
                                className="font-medium hover:underline truncate"
                                title={p.title}
                              >
                                {p.title}
                              </Link>
                              <StatusBadge status={p.status} />
                              {low && <span className="pill bg-amber-100 text-amber-700">Stock faible</span>}
                              {out && <span className="pill bg-rose-100 text-rose-700">Rupture</span>}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {p.slug}
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td className="hidden md:table-cell">{p.sku ?? "—"}</Td>
                      <Td>{fmtCurrency(p.priceTTC)}</Td>
                      <Td>{typeof p.stock === "number" ? p.stock : "—"}</Td>
                      <Td className="hidden md:table-cell">{p.category ?? "—"}</Td>
                      <Td className="hidden md:table-cell">{p.updatedAt ? fmtDate(p.updatedAt) : "—"}</Td>
                      <Td>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/pro/commercants/produits/${p.slug}/edit`} className="pill pill-ghost">Éditer</Link>
                          {p.status !== "PUBLISHED" ? (
                            <button className="pill pill-ghost" onClick={() => linePublish(p.slug)}>Publier</button>
                          ) : (
                            <button className="pill pill-muted" onClick={() => lineArchive(p.slug)}>Archiver</button>
                          )}
                          <Link href={`/pro/commercants/stock?sku=${encodeURIComponent(p.sku ?? "")}`} className="pill pill-ghost">
                            Gérer stock
                          </Link>
                          <button className="pill pill-muted" onClick={() => alert("Dupliquer (à implémenter)")}>
                            Dupliquer
                          </button>
                          <Link href={`/produits/${p.slug}`} className="pill pill-muted" target="_blank">
                            Aperçu public
                          </Link>
                          <button
                            className="pill pill-ghost"
                            onClick={async () => {
                              await navigator.clipboard.writeText(`${location.origin}/produits/${p.slug}`);
                              alert("Lien copié !");
                            }}
                          >
                            Copier lien
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination */}
      <section className="section">
        <div className="soft-card p-3 flex items-center justify-between">
          <span className="text-sm text-slate-600">
            {total} produit{total > 1 ? "s" : ""} • page {page}/{maxPage}
          </span>
          <div className="flex gap-2">
            <button className="pill pill-muted" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Précédent
            </button>
            <button className="pill pill-muted" onClick={() => setPage((p) => Math.min(maxPage, p + 1))} disabled={page >= maxPage}>
              Suivant
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* UI helpers */
function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`text-left px-4 py-3 font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
function ListSkeleton() {
  return (
    <ul className="grid gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="soft-card p-4 animate-pulse">
          <div className="h-4 w-1/3 bg-slate-200 rounded" />
          <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded" />
        </li>
      ))}
    </ul>
  );
}
function EmptyState() {
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="text-lg font-semibold">Aucun produit</h3>
      <p className="text-slate-600 mt-1">Ajoutez votre premier produit au catalogue.</p>
      <div className="mt-4">
        <Link href="/pro/commercants/produits/nouveau" className="btn">+ Nouveau produit</Link>
      </div>
    </div>
  );
}
function StatusBadge({ status }: { status: ProductStatus }) {
  const map: Record<ProductStatus, { label: string; cls: string }> = {
    DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-700" },
    PUBLISHED: { label: "Publié", cls: "bg-emerald-100 text-emerald-700" },
    ARCHIVED: { label: "Archivé", cls: "bg-amber-100 text-amber-700" },
  };
  const it = map[status];
  return <span className={`pill ${it.cls}`}>{it.label}</span>;
}
function fmtCurrency(v: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}
function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch { return iso; }
}
