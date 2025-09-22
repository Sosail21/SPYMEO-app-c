"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MOCK_USER_DOCUMENTS, type UserDocument } from "@/lib/mockdb/documents";

export default function UserDocumentsPage(){
  const [data, setData] = useState<UserDocument[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"ALL" | UserDocument["type"]>("ALL");

  useEffect(()=>{
    let cancel=false;
    (async ()=>{
      try{
        const r = await fetch("/api/user/documents", { cache: "no-store" });
        if(!r.ok) throw new Error("fallback");
        const j = await r.json();
        if(!cancel) setData(j?.documents ?? []);
      }catch{
        if(!cancel) setData(MOCK_USER_DOCUMENTS);
      }finally{
        if(!cancel) setLoading(false);
      }
    })();
    return ()=>{ cancel = true; };
  },[]);

  const list = useMemo(()=>{
    const base = (data ?? [])
      .filter(d => type==="ALL" ? true : d.type===type)
      .filter(d => {
        if(!q.trim()) return true;
        const hay = `${d.title} ${d.type} ${d.practitionerName}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
    return base;
  },[data,q,type]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Mes documents</h1>
            <p className="text-muted text-sm">Documents partagés par vos praticiens (lecture seule).</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={type} onChange={(e)=>setType(e.target.value as any)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="ALL">Tous</option>
              <option value="Bilan">Bilan</option>
              <option value="Ordonnance">Ordonnance</option>
              <option value="Conseils">Conseils</option>
              <option value="Ressource">Ressource</option>
            </select>
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Rechercher un document…" className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"/>
          </div>
        </div>
      </section>

      <section className="section">
        {loading ? <Skeleton/> : list.length===0 ? <Empty/> : (
          <ul className="grid gap-3">
            {list.map(d=>(
              <li key={d.id} className="soft-card p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <strong>{d.title}</strong>
                    <span className="affinity">{d.type}</span>
                  </div>
                  <div className="text-sm text-muted">
                    Par <Link href={`/praticien/${d.practitionerSlug}`} className="link-muted">{d.practitionerName}</Link>
                    {" • "}{fmtDate(d.createdAt)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/user/documents/${d.id}`} className="pill pill-ghost">Ouvrir</Link>
                  <button className="pill pill-muted" onClick={()=>alert("Télécharger (à implémenter)")}>Télécharger</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Skeleton(){ return <div className="soft-card p-5 animate-pulse h-28"/>; }
function Empty(){
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="font-semibold text-lg">Aucun document</h3>
      <p className="text-muted mt-1">Les documents transmis par vos praticiens apparaîtront ici.</p>
    </div>
  );
}
function fmtDate(iso:string){ try{ return new Date(iso).toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"});}catch{return iso;} }
