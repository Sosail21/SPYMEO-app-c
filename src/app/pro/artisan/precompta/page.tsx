// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import { MOCK_PRECOMPTA_ARTISAN, type ArtisanLedgerItem } from "@/lib/mockdb/precompta-artisan";

export default function ArtisanPrecomptaPage(){
  const [rows,setRows] = useState<ArtisanLedgerItem[]>([]);
  const [loading,setLoading] = useState(true);
  const [q,setQ] = useState("");

  useEffect(()=>{
    let cancel=false;
    (async()=>{
      try{
        const r = await fetch("/api/artisan/precompta",{ cache:"no-store" });
        if(!r.ok) throw new Error("fallback");
        const json = await r.json();
        if(!cancel) setRows(json?.ledger ?? []);
      }catch{
        if(!cancel) setRows(MOCK_PRECOMPTA_ARTISAN);
      }finally{
        if(!cancel) setLoading(false);
      }
    })();
    return ()=>{ cancel = true; };
  },[]);

  const filtered = useMemo(()=>{
    return rows
      .filter(l=>{
        if(!q.trim()) return true;
        const hay = `${l.ref} ${l.label}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a,b)=> (b.date ?? "").localeCompare(a.date ?? ""));
  },[rows,q]);

  const total = useMemo(()=> filtered.reduce((acc,l)=> acc + l.amount, 0), [filtered]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <h1 className="text-2xl font-semibold text-[#0b1239]">Pré-compta</h1>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Filtrer libellé, réf…"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"/>
        </div>
      </section>

      <section className="section">
        {loading ? (
          <div className="soft-card p-4 animate-pulse"><div className="h-4 w-1/3 bg-slate-200 rounded"/></div>
        ) : (
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th>Date</Th>
                  <Th>Réf.</Th>
                  <Th>Libellé</Th>
                  <Th>Type</Th>
                  <Th>TVA</Th>
                  <Th>Montant</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l=>(
                  <tr key={l.id} className="border-t">
                    <Td>{fmtDate(l.date)}</Td>
                    <Td><code>{l.ref}</code></Td>
                    <Td>{l.label}</Td>
                    <Td>{l.type==="INVOICE"?"Facture":"Dépense"}</Td>
                    <Td>{l.vatRate}%</Td>
                    <Td className={l.amount<0?"text-amber-700":"text-emerald-700"}>
                      {fmtCurrency(l.amount)}
                    </Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <Td colSpan={5}>Total</Td>
                  <Td className={total<0?"text-amber-700":"text-emerald-700"}>{fmtCurrency(total)}</Td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Th({children}:{children:React.ReactNode}){ return <th className="text-left px-4 py-3 font-semibold">{children}</th>; }
function Td({children,colSpan,className}:{children:React.ReactNode; colSpan?:number; className?:string}){ return <td className={`px-4 py-3 ${className||""}`} colSpan={colSpan}>{children}</td>; }
function fmtCurrency(v:number){ return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(v); }
function fmtDate(iso:string){ try{ return new Date(iso).toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"});}catch{return iso;} }
