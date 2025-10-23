// Cdw-Spm
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Conversation } from "@/types/messages";

export default function MessagingListPage() {
  const [data, setData] = useState<Conversation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(()=>{
    let cancel=false;
    (async ()=>{
      try{
        const r = await fetch("/api/user/conversations", { cache: "no-store" });
        if(!r.ok) throw new Error("fallback");
        const j = await r.json();
        if(!cancel) setData(j?.conversations ?? []);
      }catch{
        if(!cancel) setData([]);
      }finally{
        if(!cancel) setLoading(false);
      }
    })();
    return ()=>{ cancel=true; };
  },[]);

  const list = useMemo(()=>{
    const base=(data??[]).filter(c=>{
      if(!q.trim()) return true;
      const hay = `${c.practitionerName}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
    return base.sort((a,b)=> b.lastMessageAt.localeCompare(a.lastMessageAt));
  },[data,q]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Messagerie</h1>
            <p className="text-muted text-sm">Discutez avec vos praticiens.</p>
          </div>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Rechercher un praticien…" className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"/>
        </div>
      </section>

      <section className="section">
        {loading ? <Skeleton/> : list.length===0 ? <Empty/> : (
          <ul className="grid gap-3">
            {list.map(c=>(
              <li key={c.id} className="soft-card p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="truncate">{c.practitionerName}</strong>
                    {c.unreadCount ? <span className="affinity">{c.unreadCount} non lu{c.unreadCount>1?"s":""}</span> : null}
                  </div>
                  <div className="text-sm text-muted">Dernier message — {fmtDateTime(c.lastMessageAt)}</div>
                </div>
                <Link href={`/user/messagerie/${c.id}`} className="pill pill-ghost">Ouvrir</Link>
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
      <h3 className="font-semibold text-lg">Aucune conversation</h3>
      <p className="text-muted mt-1">Contactez un praticien depuis sa fiche ou depuis un rendez-vous.</p>
    </div>
  );
}
function fmtDateTime(iso: string){ try{const d=new Date(iso); return d.toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"})+" "+d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});}catch{return iso;} }
