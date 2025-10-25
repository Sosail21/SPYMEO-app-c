// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ConfirmModal, { useConfirm } from "@/components/common/ConfirmModal";
import type {
  ServiceItem,
  ServiceStatus,
} from "@/types/services-artisan";

const TABS: { key: "ALL" | ServiceStatus; label: string }[] = [
  { key: "ALL", label: "Tous" },
  { key: "PUBLISHED", label: "Publiés" },
  { key: "DRAFT", label: "Brouillons" },
  { key: "ARCHIVED", label: "Archivés" },
];

export default function ArtisanServicesPage() {
  const confirmDialog = useConfirm();
  const [data, setData] = useState<ServiceItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"ALL" | ServiceStatus>("ALL");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | "ALL">("ALL");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/artisan/services", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setData(json?.services ?? []);
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
    (data ?? []).forEach(s => { if (s.category) set.add(s.category); });
    return Array.from(set).sort((a,b)=>a.localeCompare(b));
  }, [data]);

  const filtered = useMemo(() => {
    return (data ?? [])
      .filter(s => activeTab === "ALL" ? true : s.status === activeTab)
      .filter(s => cat === "ALL" ? true : s.category === cat)
      .filter(s => {
        if (!q.trim()) return true;
        const hay = `${s.title} ${s.slug} ${s.category}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a,b)=>a.title.localeCompare(b.title));
  }, [data, activeTab, q, cat]);

  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [activeTab, q, cat]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Catalogue services</h1>
            <p className="text-slate-600 text-sm">Gérez votre offre, tarifs et publication.</p>
          </div>
          <Link href="/pro/artisan/catalogue/services/nouveau" className="btn">+ Nouveau service</Link>
        </div>
      </section>

      <section className="section">
        <div className="soft-card p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <nav className="chips-row my-0">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={()=>setActiveTab(t.key as any)}
                className={"chip " + (activeTab===t.key ? "chip-active" : "")}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <select
              value={cat}
              onChange={(e)=>setCat(e.target.value as any)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="ALL">Toutes catégories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Rechercher titre, slug…"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
            />
          </div>
        </div>
      </section>

      <section className="section">
        {loading ? <ListSkeleton /> : slice.length === 0 ? <EmptyState /> : (
          <ul className="grid gap-3">
            {slice.map(s => (
              <li key={s.id} className="soft-card p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/pro/artisan/catalogue/services/${s.slug}`} className="font-semibold hover:underline truncate" title={s.title}>
                        {s.title}
                      </Link>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      {s.category && <span>🧭 {s.category}</span>}
                      {typeof s.durationMin === "number" && <span>⏱ {s.durationMin} min</span>}
                      <span>💶 {fmtCurrency(s.priceTTC)}</span>
                      {s.updatedAt && <span>MAJ: {fmtDate(s.updatedAt)}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/pro/artisan/catalogue/services/${s.slug}/edit`} className="pill pill-ghost">Éditer</Link>
                    <Link href={`/services/${s.slug}`} className="pill pill-muted" target="_blank">Aperçu public</Link>
                    {s.status !== "ARCHIVED" ? (
                      <button className="pill pill-muted" onClick={()=>confirmDialog.warning("Archiver (à implémenter)")}>Archiver</button>
                    ) : (
                      <button className="pill pill-muted" onClick={()=>confirmDialog.warning("Restaurer (à implémenter)")}>Restaurer</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <div className="soft-card p-3 flex items-center justify-between">
          <span className="text-sm text-slate-600">{total} service{total>1?"s":""} • page {page}/{maxPage}</span>
          <div className="flex gap-2">
            <button className="pill pill-muted" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Précédent</button>
            <button className="pill pill-muted" onClick={()=>setPage(p=>Math.min(maxPage,p+1))} disabled={page>=maxPage}>Suivant</button>
          </div>
        </div>
      </section>
      <ConfirmModal {...confirmDialog} />
    </main>
  );
}

function ListSkeleton(){
  return (
    <ul className="grid gap-3">
      {Array.from({length:4}).map((_,i)=>(
        <li key={i} className="soft-card p-4 animate-pulse">
          <div className="h-4 w-1/3 bg-slate-200 rounded" />
          <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded" />
        </li>
      ))}
    </ul>
  );
}
function EmptyState(){
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="text-lg font-semibold">Aucun service</h3>
      <p className="text-slate-600 mt-1">Ajoutez votre premier service à votre catalogue.</p>
      <div className="mt-4">
        <Link href="/pro/artisan/catalogue/services/nouveau" className="btn">+ Nouveau service</Link>
      </div>
    </div>
  );
}
function StatusBadge({ status }: { status: ServiceStatus }){
  const map: Record<ServiceStatus, {label:string; cls:string}> = {
    DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-700" },
    PUBLISHED: { label: "Publié", cls: "bg-emerald-100 text-emerald-700" },
    ARCHIVED: { label: "Archivé", cls: "bg-amber-100 text-amber-700" },
  };
  const it = map[status];
  return <span className={`pill ${it.cls}`}>{it.label}</span>;
}
function fmtCurrency(v: number){ return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v); }
function fmtDate(iso?: string){ if(!iso) return ""; try{ return new Date(iso).toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"});}catch{ return iso; } }
