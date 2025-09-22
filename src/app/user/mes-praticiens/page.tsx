// src/app/user/mes-praticiens/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MOCK_USER_PRACTITIONERS, type UserPractitioner } from "@/lib/mockdb/user-practitioners";

export default function MyPractitionersPage() {
  const [data, setData] = useState<UserPractitioner[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/user/practitioners", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setData(json?.practitioners ?? []);
      } catch {
        if (!cancel) setData(MOCK_USER_PRACTITIONERS);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const list = useMemo(() => {
    const base = (data ?? []).filter(p => {
      if (!q.trim()) return true;
      const hay = `${p.name} ${p.specialties.join(" ")} ${p.city ?? ""}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
    return base.sort((a,b)=> (b.lastVisitAt ?? "").localeCompare(a.lastVisitAt ?? ""));
  }, [data, q]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Mes praticiens</h1>
            <p className="text-muted text-sm">Retrouvez les pros déjà consultés et reprenez RDV en 2 clics.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Rechercher un praticien…"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
            />
            <Link href="/recherche" className="btn btn-outline">Trouver un pro</Link>
          </div>
        </div>
      </section>

      <section className="section">
        {loading ? (
          <ListSkeleton />
        ) : list.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-3">
            {list.map(p => (
              <li key={p.id} className="list-row">
                <div className="list-media" />
                <div className="list-body">
                  <div className="list-head">
                    <div className="flex items-center gap-2">
                      <strong>{p.name}</strong>
                      {p.city && <span className="affinity">{p.city}</span>}
                    </div>
                    <div className="text-sm text-muted">
                      {p.specialties.join(" • ")}
                    </div>
                  </div>
                  <div className="text-sm text-muted">
                    {p.lastVisitAt ? `Dernière visite : ${fmtDate(p.lastVisitAt)}` : "Jamais consulté"}
                    {p.nextAvailable && ` • Prochaine dispo : ${fmtDateTime(p.nextAvailable)}`}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href={`/praticien/${p.slug}`} className="pill pill-ghost">Voir la fiche</Link>
                    {/* Chemin de prise de RDV – à adapter au flow réel */}
                    <Link href={`/prendre-rdv?praticien=${p.slug}`} className="pill pill-muted">Reprendre RDV</Link>
                    <button className="pill pill-muted" onClick={()=>alert("Contacter (à implémenter)")}>Contacter</button>
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
        <li key={i} className="list-row animate-pulse">
          <div className="list-media" />
          <div className="list-body">
            <div className="h-4 w-1/3 bg-slate-200 rounded"/>
            <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded"/>
          </div>
        </li>
      ))}
    </ul>
  );
}
function EmptyState(){
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="text-lg font-semibold">Aucun praticien consulté</h3>
      <p className="text-slate-600 mt-1">Dès que vous prendrez un premier rendez-vous, il apparaîtra ici.</p>
      <div className="mt-4"><Link href="/recherche" className="btn">Trouver un pro</Link></div>
    </div>
  );
}
function fmtDate(iso: string){
  try{
    return new Date(iso).toLocaleDateString("fr-FR", { year:"numeric", month:"short", day:"2-digit" });
  }catch{ return iso; }
}
function fmtDateTime(iso: string){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { year:"numeric", month:"short", day:"2-digit" }) +
      " " + d.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });
  }catch{ return iso; }
}
