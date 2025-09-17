"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

// --------- Types
type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type Product = {
  id: string;
  title: string;
  sku?: string;
  price: number; // en €
  stock: number;
  status: ProductStatus;
  updatedAt: string; // ISO
  thumbnail?: string;
  views?: number;
  likes?: number;
  orders?: number;
};

// --------- Mock data (branche ensuite /api/catalogue/products)
const MOCK_PRODUCTS: Product[] = [
  {
    id: "p-001",
    title: "Tisane détox bio — 100g",
    sku: "TDX-100",
    price: 12.9,
    stock: 28,
    status: "PUBLISHED",
    updatedAt: new Date().toISOString(),
    thumbnail:
      "https://images.unsplash.com/photo-1470167290877-7d5d3446de4c?q=80&w=400&auto=format&fit=crop",
    views: 184,
    likes: 12,
    orders: 7,
  },
  {
    id: "p-002",
    title: "Huile essentielle de lavande — 10ml",
    sku: "HEL-010",
    price: 9.5,
    stock: 0,
    status: "PUBLISHED",
    updatedAt: new Date(Date.now() - 864e5).toISOString(),
    views: 220,
    likes: 19,
    orders: 11,
  },
  {
    id: "p-003",
    title: "Bouillotte graines de lin",
    sku: "BGL-001",
    price: 24,
    stock: 6,
    status: "DRAFT",
    updatedAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    thumbnail:
      "https://images.unsplash.com/photo-1541516160071-54b6dcb21b86?q=80&w=400&auto=format&fit=crop",
    views: 35,
    likes: 2,
    orders: 0,
  },
  {
    id: "p-004",
    title: "Infusion sommeil — 20 sachets",
    sku: "SLP-020",
    price: 6.9,
    stock: 120,
    status: "PUBLISHED",
    updatedAt: new Date(Date.now() - 5 * 864e5).toISOString(),
    views: 540,
    likes: 42,
    orders: 31,
  },
  {
    id: "p-005",
    title: "Atelier: Découvrir les plantes locales (2h)",
    sku: "ATL-2H",
    price: 39,
    stock: 10,
    status: "ARCHIVED",
    updatedAt: new Date(Date.now() - 20 * 864e5).toISOString(),
    views: 310,
    likes: 15,
    orders: 23,
  },
];

// --------- UI atoms
const Card = ({ className = "", children }: React.PropsWithChildren<{ className?: string }>) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
);

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const map = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    DRAFT: "bg-amber-50 text-amber-700 border-amber-100",
    ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200",
  } as const;
  const label = status === "PUBLISHED" ? "Publié" : status === "DRAFT" ? "Brouillon" : "Archivé";
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${map[status]}`}>{label}</span>;
}

// --------- Page
export default function CataloguePage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProductStatus | "ALL">("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "OUT_OF_STOCK">("ALL");
  const [sort, setSort] = useState<"RECENT" | "PRICE_ASC" | "PRICE_DESC" | "STOCK_ASC" | "STOCK_DESC">(
    "RECENT"
  );
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const filtered = useMemo(() => {
    let arr = [...MOCK_PRODUCTS];

    // recherche
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    // statut
    if (status !== "ALL") arr = arr.filter((p) => p.status === status);

    // stock
    if (stockFilter === "IN_STOCK") arr = arr.filter((p) => p.stock > 0);
    if (stockFilter === "OUT_OF_STOCK") arr = arr.filter((p) => p.stock <= 0);

    // tri
    arr.sort((a, b) => {
      switch (sort) {
        case "PRICE_ASC":
          return a.price - b.price;
        case "PRICE_DESC":
          return b.price - a.price;
        case "STOCK_ASC":
          return a.stock - b.stock;
        case "STOCK_DESC":
          return b.stock - a.stock;
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return arr;
  }, [query, status, stockFilter, sort]);

  const total = filtered.length;
  const totalPublished = filtered.filter((p) => p.status === "PUBLISHED").length;
  const outOfStock = filtered.filter((p) => p.stock <= 0 && p.status === "PUBLISHED").length;

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <main className="section">
      <div className="container-spy space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Catalogue</h1>
            <p className="text-muted">Produits & formations publiés.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/pro/catalogue/nouveau-produit"
              className="rounded-xl bg-sky-600 text-white px-4 py-2 text-sm hover:bg-sky-700"
            >
              + Nouveau produit
            </Link>
            <Link
              href="/pro/formations/nouvelle"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              + Nouvelle formation
            </Link>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <StatPill label="Total" value={total} />
          <StatPill label="Publiés" value={totalPublished} />
          <StatPill label="Ruptures" value={outOfStock} />
          <StatPill
            label="Prix moyen"
            value={
              total
                ? (filtered.reduce((s, p) => s + p.price, 0) / filtered.length).toFixed(2) + " €"
                : "—"
            }
          />
          <StatPill
            label="Stock total"
            value={filtered.reduce((s, p) => s + p.stock, 0)}
          />
          <StatPill
            label="Ventes (mock)"
            value={filtered.reduce((s, p) => s + (p.orders || 0), 0)}
          />
        </div>

        {/* Filtres */}
        <Card className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                value={query}
                onChange={(e) => {
                  setPage(1);
                  setQuery(e.target.value);
                }}
                placeholder="Rechercher un titre ou un SKU…"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value as any);
                }}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PUBLISHED">Publié</option>
                <option value="DRAFT">Brouillon</option>
                <option value="ARCHIVED">Archivé</option>
              </select>

              <select
                value={stockFilter}
                onChange={(e) => {
                  setPage(1);
                  setStockFilter(e.target.value as any);
                }}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ALL">Stock : tous</option>
                <option value="IN_STOCK">En stock</option>
                <option value="OUT_OF_STOCK">Rupture</option>
              </select>
            </div>

            <div className="flex gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="RECENT">Plus récents</option>
                <option value="PRICE_ASC">Prix ↑</option>
                <option value="PRICE_DESC">Prix ↓</option>
                <option value="STOCK_ASC">Stock ↑</option>
                <option value="STOCK_DESC">Stock ↓</option>
              </select>
              <button
                onClick={() => {
                  setQuery("");
                  setStatus("ALL");
                  setStockFilter("ALL");
                  setSort("RECENT");
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </Card>

        {/* Liste */}
        {paged.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-slate-900 font-medium">Aucun article ne correspond à votre recherche.</div>
            <p className="text-muted text-sm">Essayez d’élargir vos filtres ou créez un nouvel article.</p>
            <div className="mt-4">
              <Link
                href="/pro/catalogue/nouveau-produit"
                className="rounded-xl bg-sky-600 text-white px-4 py-2 text-sm hover:bg-sky-700"
              >
                + Nouveau produit
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paged.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <div className="flex gap-3 p-4">
                  <div className="h-20 w-20 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-slate-400 text-xs">Aperçu</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 truncate">{p.title}</h3>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="text-xs text-slate-500">
                      {p.sku ? <>SKU&nbsp;{p.sku} · </> : null}
                      maj {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-700">
                        {p.price.toFixed(2)} €
                      </div>
                      <div
                        className={`rounded-lg px-2 py-1 text-xs ${
                          p.stock > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {p.stock > 0 ? `${p.stock} en stock` : "Rupture"}
                      </div>
                      <div className="rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-700">
                        {p.orders ?? 0} commandes
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>👁 {p.views ?? 0}</span>
                    <span>❤ {p.likes ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/pro/catalogue/${p.id}/editer`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
                      Éditer
                    </Link>
                    <Link
                      href={`/produit/${p.id}`}
                      className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs hover:bg-slate-800"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          >
            ← Précédent
          </button>
          <div className="text-sm text-slate-600">
            Page <span className="font-semibold">{page}</span> / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Suivant →
          </button>
        </div>
      </div>
    </main>
  );
}