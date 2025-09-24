"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  MOCK_PRODUCTS_COMMERCANT,
  type Product,
} from "@/lib/mockdb/products-commercant";

type TabKey = "INFOS" | "STOCK" | "VARIANTS";

export default function ProductDetailPage() {
  const { slug } = useParams() as { slug: string };

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("INFOS");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch(`/api/merchant/products/${slug}`, { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setProduct(json?.product ?? null);
      } catch {
        if (!cancel) {
          const mock = MOCK_PRODUCTS_COMMERCANT.find(p => p.slug === slug) ?? null;
          setProduct(mock);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [slug]);

  if (!loading && !product) {
    notFound();
  }

  const low = typeof product?.stock === "number" && product.stock > 0 && product.stock <= 3;
  const out = (product?.stock ?? 0) <= 0;

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* Fil d’Ariane */}
      <section className="section">
        <nav className="text-sm text-slate-600">
          <Link href="/pro/commercants/produits" className="hover:underline">Catalogue</Link>
          <span> / </span>
          <span>{product?.title ?? slug}</span>
        </nav>
      </section>

      {/* Header produit */}
      <section className="section">
        <div className="soft-card p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239] truncate">
                {product?.title || "Produit"}
              </h1>
              {product && (
                <p className="text-slate-600">
                  {fmtCurrency(product.priceTTC)}
                  {product.category && <> • {product.category}</>}
                  {product.sku && <> • SKU: {product.sku}</>}
                  {product.updatedAt && <> • MAJ: {fmtDate(product.updatedAt)}</>}
                </p>
              )}
              <div className="mt-2 flex gap-2 flex-wrap">
                {low && <span className="pill bg-amber-100 text-amber-700">Stock faible</span>}
                {out && <span className="pill bg-rose-100 text-rose-700">Rupture</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/pro/commercants/produits/${slug}/edit`} className="btn">Éditer</Link>
              <Link href={`/produits/${slug}`} target="_blank" className="pill pill-muted">Aperçu public</Link>
              <Link href={`/pro/commercants/stock?sku=${encodeURIComponent(product?.sku ?? "")}`} className="pill pill-ghost">Gérer stock</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="section">
        <div className="soft-card p-3">
          <div className="chips-row my-0">
            {(["INFOS","STOCK","VARIANTS"] as const).map(k => (
              <button
                key={k}
                type="button"
                onClick={()=>setTab(k)}
                className={"chip " + (tab===k ? "chip-active" : "")}
              >
                {k==="INFOS"?"Infos":k==="STOCK"?"Stock":"Variantes"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        {loading ? (
          <div className="soft-card p-4 animate-pulse"><div className="h-4 w-1/3 bg-slate-200 rounded" /></div>
        ) : !product ? (
          <div className="soft-card p-4">Produit introuvable.</div>
        ) : tab === "INFOS" ? (
          <Infos product={product} />
        ) : tab === "STOCK" ? (
          <Stock product={product} />
        ) : (
          <Variants product={product} />
        )}
      </section>
    </main>
  );
}

function Infos({ product }: { product: Product }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="soft-card p-4">
        <h3 className="font-semibold">Résumé</h3>
        <ul className="mt-2 text-sm text-slate-700 grid gap-1">
          <li><b>Prix TTC :</b> {fmtCurrency(product.priceTTC)}</li>
          <li><b>TVA :</b> {product.vatRate}%</li>
          <li><b>Catégorie :</b> {product.category ?? "—"}</li>
          <li><b>SKU :</b> {product.sku ?? "—"}</li>
          <li><b>Statut :</b> {product.status}</li>
          <li><b>MAJ :</b> {product.updatedAt ? fmtDate(product.updatedAt) : "—"}</li>
        </ul>
      </div>
      <div className="soft-card p-4">
        <h3 className="font-semibold">Description</h3>
        <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
          {product.description ?? "Aucune description."}
        </p>
      </div>
    </div>
  );
}

function Stock({ product }: { product: Product }) {
  // Mini historique mock (à brancher sur /api/merchant/stock?sku=)
  const rows = useMemo(() => {
    const now = new Date();
    const iso = (d: Date) => d.toISOString().slice(0,10);
    return [
      { date: iso(new Date(now.getTime() - 86400000*15)), type: "IN", qty: +5, ref: "Réassort" },
      { date: iso(new Date(now.getTime() - 86400000*9)), type: "OUT", qty: -2, ref: "Commande #1024" },
      { date: iso(new Date(now.getTime() - 86400000*3)), type: "OUT", qty: -1, ref: "Commande #1066" },
    ];
  }, []);

  return (
    <div className="grid gap-4">
      <div className="soft-card p-4">
        <h3 className="font-semibold">Niveau de stock</h3>
        <p className="text-sm text-slate-700 mt-1">
          Disponible : <b>{typeof product.stock === "number" ? product.stock : "—"}</b>
          {product.sku && <> • SKU : <code>{product.sku}</code></>}
        </p>
        <div className="mt-3">
          <Link href={`/pro/commercants/stock?sku=${encodeURIComponent(product.sku ?? "")}`} className="pill pill-ghost">
            Voir les mouvements dans Stock
          </Link>
        </div>
      </div>

      <div className="soft-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#edf4f6] text-[#0b1239]">
            <tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Quantité</Th>
              <Th>Référence</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="border-t">
                <Td>{fmtDate(r.date)}</Td>
                <Td>{r.type==="IN"?"Entrée":"Sortie"}</Td>
                <Td className={r.qty<0?"text-amber-700":"text-emerald-700"}>{r.qty>0?`+${r.qty}`:r.qty}</Td>
                <Td>{r.ref}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Variants({ product }: { product: Product }) {
  // Placeholder variantes — à remplacer par de vraies données
  const base = product.sku?.replace(/-S| -S| -M| -L/g,"") ?? product.slug;
  const variants = [
    { id: product.id+"-S", title: product.title+" — S", sku: base+"-S", priceTTC: product.priceTTC, stock: (product.stock ?? 0) - 1 },
    { id: product.id+"-M", title: product.title+" — M", sku: base+"-M", priceTTC: product.priceTTC, stock: (product.stock ?? 0) },
    { id: product.id+"-L", title: product.title+" — L", sku: base+"-L", priceTTC: product.priceTTC, stock: (product.stock ?? 0) + 2 },
  ];

  return (
    <div className="soft-card p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#edf4f6] text-[#0b1239]">
          <tr>
            <Th>Variante</Th>
            <Th>SKU</Th>
            <Th>Prix</Th>
            <Th>Stock</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {variants.map(v => (
            <tr key={v.id} className="border-t">
              <Td>{v.title}</Td>
              <Td>{v.sku}</Td>
              <Td>{fmtCurrency(v.priceTTC)}</Td>
              <Td>{v.stock}</Td>
              <Td>
                <div className="flex gap-2">
                  <button className="pill pill-ghost" onClick={()=>alert("Éditer variante (à implémenter)")}>Éditer</button>
                  <button className="pill pill-muted" onClick={()=>alert("Réassort (à implémenter)")}>Réassort</button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* helpers */
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}
function fmtCurrency(v?: number) {
  if (typeof v !== "number") return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}
function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch { return iso; }
}
