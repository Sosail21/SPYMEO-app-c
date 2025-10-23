// Cdw-Spm
"use client";

import { useEffect, useState } from "react";
import type { ArtisanStats } from "@/types/stats-artisan";

export default function ArtisanStatsPage(){
  const [stats,setStats] = useState<ArtisanStats|null>(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    let cancel=false;
    (async()=>{
      try{
        const r = await fetch("/api/artisan/stats",{ cache:"no-store" });
        if(!r.ok) throw new Error("fallback");
        const json = await r.json();
        if(!cancel) setStats(json?.stats ?? null);
      }catch{
        if(!cancel) setStats(null);
      }finally{
        if(!cancel) setLoading(false);
      }
    })();
    return ()=>{ cancel = true; };
  },[]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <h1 className="text-2xl font-semibold text-[#0b1239]">Statistiques</h1>
      </section>

      <section className="section">
        {loading || !stats ? (
          <div className="soft-card p-4 animate-pulse"><div className="h-4 w-1/3 bg-slate-200 rounded"/></div>
        ) : (
          <div className="grid md:grid-cols-4 gap-3">
            <div className="soft-card p-4"><div className="text-sm text-muted">Chiffre d’affaires</div><div className="text-2xl font-semibold">{fmtCurrency(stats.kpi.revenue)}</div></div>
            <div className="soft-card p-4"><div className="text-sm text-muted">Commandes</div><div className="text-2xl font-semibold">{stats.kpi.orders}</div></div>
            <div className="soft-card p-4"><div className="text-sm text-muted">Panier moyen</div><div className="text-2xl font-semibold">{fmtCurrency(stats.kpi.avgBasket)}</div></div>
            <div className="soft-card p-4"><div className="text-sm text-muted">Nouveaux clients</div><div className="text-2xl font-semibold">{stats.kpi.newClients}</div></div>
          </div>
        )}
      </section>

      <section className="section">
        <div className="soft-card p-4">
          <div className="text-sm text-muted mb-2">Tendance (placeholder)</div>
          <div className="h-36 rounded-lg bg-[#eef3f6] border border-border grid place-content-center text-muted">
            Graph à brancher
          </div>
        </div>
      </section>
    </main>
  );
}

function fmtCurrency(v:number){ return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(v); }
