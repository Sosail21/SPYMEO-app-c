// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ArtisanClient } from "@/types/clients-artisan";

export default function ArtisanClientsPage(){
  const [data,setData] = useState<ArtisanClient[]>([]);
  const [loading,setLoading] = useState(true);
  const [q,setQ] = useState("");

  useEffect(()=>{
    let cancel=false;
    (async()=>{
      try{
        const r = await fetch("/api/artisan/clients",{ cache:"no-store" });
        if(!r.ok) throw new Error("fallback");
        const json = await r.json();
        if(!cancel) setData(json?.clients ?? []);
      }catch{
        if(!cancel) setData([]);
      }finally{
        if(!cancel) setLoading(false);
      }
    })();
    return ()=>{ cancel = true; };
  },[]);

  const filtered = useMemo(()=>{
    return data
      .filter(c=>{
        if(!q.trim()) return true;
        const hay = `${c.name} ${c.email ?? ""} ${c.phone ?? ""} ${c.city ?? ""}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a,b)=> (b.lastOrderAt ?? "").localeCompare(a.lastOrderAt ?? ""));
  },[data,q]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <h1 className="text-2xl font-semibold text-[#0b1239]">Clients</h1>
          <Link href="/pro/artisan/ventes/commandes" className="btn btn-outline">← Commandes</Link>
        </div>
      </section>

      <section className="section">
        <div className="soft-card p-3">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher nom, email, téléphone…"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"/>
        </div>
      </section>

      <section className="section">
        {loading ? <Skeleton/> : filtered.length===0 ? <Empty/> : (
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th>Nom</Th>
                  <Th>Email</Th>
                  <Th>Téléphone</Th>
                  <Th>Ville</Th>
                  <Th>Commandes</Th>
                  <Th>Dernière commande</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c=>(
                  <tr key={c.id} className="border-t">
                    <Td>{c.name}</Td>
                    <Td>{c.email ?? "—"}</Td>
                    <Td>{c.phone ?? "—"}</Td>
                    <Td>{c.city ?? "—"}</Td>
                    <Td>{c.ordersCount ?? 0}</Td>
                    <Td>{c.lastOrderAt ? fmtDate(c.lastOrderAt) : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Th({children}:{children:React.ReactNode}){ return <th className="text-left px-4 py-3 font-semibold">{children}</th>; }
function Td({children}:{children:React.ReactNode}){ return <td className="px-4 py-3">{children}</td>; }
function Skeleton(){ return <div className="soft-card p-4 animate-pulse"><div className="h-4 w-1/3 bg-slate-200 rounded"/></div>; }
function Empty(){ return <div className="soft-card p-8 text-center">Aucun client pour l’instant.</div>; }
function fmtDate(iso:string){ try{ return new Date(iso).toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"});}catch{return iso;} }
