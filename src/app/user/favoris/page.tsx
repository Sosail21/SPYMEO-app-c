// Cdw-Spm
// src/app/user/favoris/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MOCK_USER_FAVORITES, type UserFavorite } from "@/lib/mockdb/user-favorites";

export default function UserFavoritesPage() {
  const [data, setData] = useState<UserFavorite[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        // Essaie API quand elle existera
        const r = await fetch("/api/user/favorites", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setData(json?.favorites ?? []);
      } catch {
        if (!cancel) setData(MOCK_USER_FAVORITES);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const list = (data ?? [])
    .filter(f => {
      if (!q.trim()) return true;
      const hay = `${f.title} ${f.kind} ${f.meta ?? ""}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Mes favoris</h1>
            <p className="text-muted text-sm">Articles, praticiens, artisans, commerçants et produits que vous avez enregistrés.</p>
          </div>
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Rechercher un favori…"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
          />
        </div>
      </section>

      <section className="section">
        {loading ? (
          <ListSkeleton />
        ) : list.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-3">
            {list.map(f => (
              <li key={f.id} className="soft-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="truncate">{f.title}</strong>
                      <span className="affinity">{f.kind}</span>
                    </div>
                    {f.meta && <div className="text-sm text-muted">{f.meta}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Link href={f.href} className="pill pill-ghost">Ouvrir</Link>
                    <button className="pill pill-muted" onClick={()=>alert("Retirer des favoris (à implémenter)")}>Retirer</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function ListSkeleton(){
  return (
    <ul className="grid gap-3">
      {Array.from({length:4}).map((_,i)=>(
        <li key={i} className="soft-card p-4 animate-pulse">
          <div className="h-4 w-1/3 bg-slate-200 rounded"/>
          <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded"/>
        </li>
      ))}
    </ul>
  );
}
function EmptyState(){
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="text-lg font-semibold">Aucun favori</h3>
      <p className="text-slate-600 mt-1">Enregistrez des articles, des praticiens et des adresses utiles pour les retrouver plus vite.</p>
      <div className="mt-4"><Link href="/recherche" className="btn">Explorer</Link></div>
    </div>
  );
}
