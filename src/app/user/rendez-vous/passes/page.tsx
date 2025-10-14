// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Appointment, MOCK_APPTS_PAST } from "@/lib/mockdb/appointments";

export default function PastAppointmentsPage() {
  const [data, setData] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;
    (async ()=>{
      try{
        const r = await fetch("/api/user/appointments?scope=past", { cache: "no-store" });
        if(!r.ok) throw new Error("fallback");
        const j = await r.json();
        if(!cancel) setData(j?.appointments ?? []);
      }catch{
        if(!cancel) setData(MOCK_APPTS_PAST);
      }finally{
        if(!cancel) setLoading(false);
      }
    })();
    return ()=>{ cancel = true; };
  }, []);

  const list = useMemo(()=>{
    const base=(data??[]).filter(a=>{
      if(!q.trim()) return true;
      const hay = `${a.title} ${a.practitionerName} ${a.place}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
    return base.sort((a,b)=> b.date.localeCompare(a.date));
  },[data,q]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Historique des rendez-vous</h1>
            <p className="text-muted text-sm">Téléchargez vos justificatifs pour vos remboursements.</p>
          </div>
          <div className="flex gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Rechercher un RDV…" className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"/>
            <button className="pill pill-muted" onClick={()=>alert("Export PDF (à implémenter)")}>Exporter PDF</button>
          </div>
        </div>
      </section>

      <section className="section">
        {loading ? <SkeletonList/> : list.length===0 ? <Empty/> : (
          <ul className="list">
            {list.map(a=>(
              <li key={a.id} className="list-row">
                <div className="list-media"/>
                <div className="list-body">
                  <div className="list-head">
                    <strong>{a.title}</strong>
                    <span className="affinity">{a.place}</span>
                  </div>
                  <div className="text-sm text-muted">
                    Avec <Link className="link-muted" href={`/praticien/${a.practitionerSlug}`}>{a.practitionerName}</Link>
                    {" • "}{fmtDateTime(a.date)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href={`/user/rendez-vous/${a.id}`} className="pill pill-ghost">Détails</Link>
                    <button className="pill pill-muted" onClick={()=>alert("Reprendre RDV (à implémenter)")}>Reprendre RDV</button>
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

function SkeletonList(){ /* idem page précédente */ 
  return (
    <ul className="list">
      {Array.from({length:3}).map((_,i)=>(
        <li key={i} className="list-row animate-pulse">
          <div className="list-media"/>
          <div className="list-body">
            <div className="h-4 w-1/3 bg-slate-200 rounded"/>
            <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded"/>
          </div>
        </li>
      ))}
    </ul>
  );
}
function Empty(){
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="font-semibold text-lg">Aucun RDV passé</h3>
      <p className="text-muted mt-1">Vos rendez-vous passés s’afficheront ici.</p>
      <div className="mt-4"><Link href="/user/rendez-vous/a-venir" className="btn">Voir mes RDV</Link></div>
    </div>
  );
}
function fmtDateTime(iso: string){
  try{
    const d=new Date(iso);
    return d.toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"})+" "+d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  }catch{return iso;}
}
