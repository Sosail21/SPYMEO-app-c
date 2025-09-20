"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MOCK_ORDERS_ARTISAN,
  type ArtisanOrder,
  type OrderStatus,
} from "@/lib/mockdb/orders-artisan";

const TABS: { key: "ALL" | OrderStatus; label: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "NEW", label: "Nouvelles" },
  { key: "CONFIRMED", label: "Confirmées" },
  { key: "DONE", label: "Terminées" },
  { key: "CANCELLED", label: "Annulées" },
];

export default function ArtisanOrdersPage(){
  const [data,setData] = useState<ArtisanOrder[]>([]);
  const [loading,setLoading] = useState(true);

  const [tab,setTab] = useState<"ALL"|OrderStatus>("ALL");
  const [q,setQ] = useState("");

  useEffect(()=>{
    let cancel = false;

    (async()=>{
      try{
        const r = await fetch("/api/artisan/orders",{ cache:"no-store" });
        if(!r.ok) throw new Error("fallback");
        const json = await r.json();
        if(!cancel) setData(json?.orders ?? []);
      }catch{
        if(!cancel) setData(MOCK_ORDERS_ARTISAN);
      }finally{
        if(!cancel) setLoading(false);
      }
    })();
    return ()=>{ cancel = true; };
  },[]);

  const filtered = useMemo(()=>{
    return data
      .filter(o => tab==="ALL" ? true : o.status===tab)
      .filter(o => {
        if(!q.trim()) return true;
        const hay = `${o.ref} ${o.customerName} ${o.serviceTitle}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a,b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },[data,tab,q]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <h1 className="text-2xl font-semibold text-[#0b1239]">Commandes</h1>
          <div className="flex gap-2">
            <Link href="/pro/artisan/catalogue/services" className="btn btn-outline">← Catalogue</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="soft-card p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <nav className="chips-row my-0">
            {TABS.map(t=>(
              <button key={t.key} type="button" onClick={()=>setTab(t.key as any)}
                className={"chip "+(tab===t.key?"chip-active":"")}>{t.label}</button>
            ))}
          </nav>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher ref, client…"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"/>
        </div>
      </section>

      <section className="section">
        {loading ? <TableSkeleton/> : filtered.length===0 ? <EmptyState/> : (
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th>Réf.</Th>
                  <Th>Date</Th>
                  <Th>Client</Th>
                  <Th>Service</Th>
                  <Th>Prix</Th>
                  <Th>Statut</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o=>(
                  <tr key={o.id} className="border-t">
                    <Td><code>{o.ref}</code></Td>
                    <Td>{fmtDate(o.createdAt)}</Td>
                    <Td>{o.customerName}</Td>
                    <Td>
                      <Link href={`/pro/artisan/catalogue/services/${o.serviceSlug}`} className="hover:underline">
                        {o.serviceTitle}
                      </Link>
                    </Td>
                    <Td>{fmtCurrency(o.priceTTC)}</Td>
                    <Td><Status status={o.status}/></Td>
                    <Td>
                      <div className="flex gap-2 flex-wrap">
                        <button className="pill pill-ghost" onClick={()=>alert("Confirmer (à implémenter)")}>Confirmer</button>
                        <button className="pill pill-muted" onClick={()=>alert("Annuler (à implémenter)")}>Annuler</button>
                      </div>
                    </Td>
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
function TableSkeleton(){ return <div className="soft-card p-4 animate-pulse"><div className="h-4 w-1/3 bg-slate-200 rounded"/></div>; }
function EmptyState(){
  return(
    <div className="soft-card p-8 text-center">
      <h3 className="text-lg font-semibold">Aucune commande</h3>
      <p className="text-slate-600 mt-1">Vous n’avez pas encore de commandes.</p>
    </div>
  );
}
function Status({status}:{status:OrderStatus}){
  const m = {
    NEW:{label:"Nouvelle", cls:"bg-sky-100 text-sky-700"},
    CONFIRMED:{label:"Confirmée", cls:"bg-emerald-100 text-emerald-700"},
    DONE:{label:"Terminée", cls:"bg-slate-100 text-slate-700"},
    CANCELLED:{label:"Annulée", cls:"bg-amber-100 text-amber-700"},
  } as const;
  const it = m[status];
  return <span className={`pill ${it.cls}`}>{it.label}</span>;
}
function fmtCurrency(v:number){ return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(v); }
function fmtDate(iso:string){ try{ return new Date(iso).toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"});}catch{return iso;} }
