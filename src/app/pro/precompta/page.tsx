
"use client";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";

type Config = {
  status: "autoentrepreneur" | "ei" | "eurl" | "sasu" | "sas";
  vatScheme: "franchise" | "normal" | "simplifie";
  vatRate: number;
  socialRate: number;
  yearThresholdRevenue: number;
  bank: { iban?: string; bic?: string; bankName?: string };
  onlineConsultsSync: boolean;
};
type Tx = {
  id: string;
  date: string; // ISO
  label: string;
  type: "revenu" | "depense";
  source: "consultation" | "manuel";
  category?: string;
  amount: number; // TTC
  vatRate?: number; // if franchise, can be 0
  receiptIds?: string[];
};
type Receipt = { id: string; filename: string; uploadedAt: string; size: number; mime: string };

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: "primary" | "ghost" | "soft"}){
  const { variant="primary", className, ...rest } = props;
  return <button {...rest} className={["rounded-xl px-3 py-2 text-sm font-medium", variant==="primary"?"bg-sky-600 text-white hover:bg-sky-700": variant==="ghost"?"border border-slate-200 hover:bg-slate-50":"bg-sky-50 border border-sky-100 text-sky-700", className||""].join(" ")} />;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={["w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500", props.className||""].join(" ")} />; }
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={["w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500", props.className||""].join(" ")} />; }
function Card({ children, className=""}:{children:React.ReactNode; className?:string}){ return <div className={["rounded-2xl border border-slate-200 bg-white shadow-sm", className].join(" ")}>{children}</div>; }

export default function PrecomptaPage(){
  const [cfg, setCfg] = useState<Config | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [filterType, setFilterType] = useState<"all"|"revenu"|"depense">("all");
  const [q, setQ] = useState("");

  const [newTx, setNewTx] = useState<Partial<Tx>>({ type: "revenu", source:"manuel", vatRate: 0 });

  useEffect(()=>{
    Promise.all([
      fetchJSON<Config>("/api/precompta/config"),
      fetchJSON<Tx[]>("/api/precompta/transactions")
    ]).then(([c, list])=>{ setCfg(c); setTxs(list); })
      .catch((e)=> setErr(e.message));
  }, []);

  const totals = useMemo(()=>{
    const filtered = txs.filter(t => (filterType==="all"|| t.type===filterType) && (!q || t.label.toLowerCase().includes(q.toLowerCase())));
    const revenus = filtered.filter(t=> t.type==="revenu").reduce((a,t)=> a + t.amount, 0);
    const depenses = filtered.filter(t=> t.type==="depense").reduce((a,t)=> a + t.amount, 0);
    const caHT = cfg?.vatScheme==="franchise" ? revenus : filtered.filter(t=> t.type==="revenu").reduce((a,t)=> a + (t.amount / (1 + (t.vatRate||0))), 0);
    const tvaCollectee = cfg?.vatScheme==="franchise" ? 0 : filtered.filter(t=> t.type==="revenu").reduce((a,t)=> a + (t.amount - (t.amount / (1 + (t.vatRate||0)))), 0);
    const tvaDeductible = cfg?.vatScheme==="franchise" ? 0 : filtered.filter(t=> t.type==="depense").reduce((a,t)=> a + (t.amount - (t.amount / (1 + (t.vatRate||0)))), 0);
    const resultat = revenus - depenses;
    const socialEstime = cfg ? caHT * cfg.socialRate : 0;
    return { revenus, depenses, resultat, caHT, tvaCollectee, tvaDeductible, socialEstime };
  }, [txs, filterType, q, cfg]);

  const progressThreshold = useMemo(()=>{
    if (!cfg) return 0;
    const ca = txs.filter(t=> t.type==="revenu").reduce((a,t)=> a + t.amount, 0);
    return Math.min(100, Math.round((ca / Math.max(1, cfg.yearThresholdRevenue)) * 100));
  }, [txs, cfg]);

  function addTx(){
    if (!newTx.date || !newTx.label || !newTx.amount || !newTx.type) return;
    startTransition(()=>{
      fetchJSON<Tx>("/api/precompta/transactions", {
        method:"POST", headers: { "Content-Type":"application/json" },
        body: JSON.stringify(newTx)
      }).then((t)=> { setTxs((arr)=> [t, ...arr]); setNewTx({ type:"revenu", source:"manuel", vatRate: cfg?.vatScheme==="franchise"?0:(cfg?.vatRate||0.2) }); })
      .catch(e=> setErr(e.message));
    });
  }

  async function uploadReceipt(txId: string, file: File){
    const fd = new FormData();
    fd.append("file", file);
    fd.append("txId", txId);
    const r = await fetch("/api/precompta/receipts", { method:"POST", body: fd });
    if (!r.ok) throw new Error("upload failed");
    const data = await r.json();
    setTxs((list)=> list.map(t=> t.id===txId? {...t, receiptIds: [...(t.receiptIds||[]), data.id]}: t));
  }

  const filteredTxs = useMemo(()=> txs
    .filter(t => (filterType==="all"|| t.type===filterType))
    .filter(t => !q || t.label.toLowerCase().includes(q.toLowerCase()))
    .sort((a,b)=> new Date(b.date).getTime() - new Date(a.date).getTime())
  , [txs, filterType, q]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Pré‑compta</h1>
        <Link href="/pro/precompta/config" className="text-sm text-sky-700 hover:underline">Configurer</Link>
      </div>
      {cfg?.status==="autoentrepreneur" && (
        <p className="text-xs text-slate-500 mt-1">Mode auto‑entrepreneur : franchise TVA {cfg.vatScheme==="franchise"?"activée":"désactivée"} · seuil {cfg.yearThresholdRevenue.toLocaleString("fr-FR")} €</p>
      )}

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
        <Card><div className="p-4"><p className="text-xs text-slate-500">Revenus (TTC)</p><p className="text-xl font-semibold">{totals.revenus.toLocaleString("fr-FR")} €</p></div></Card>
        <Card><div className="p-4"><p className="text-xs text-slate-500">Dépenses (TTC)</p><p className="text-xl font-semibold">{totals.depenses.toLocaleString("fr-FR")} €</p></div></Card>
        <Card><div className="p-4"><p className="text-xs text-slate-500">Résultat</p><p className="text-xl font-semibold">{totals.resultat.toLocaleString("fr-FR")} €</p></div></Card>
        {cfg?.vatScheme!=="franchise" && (
          <Card><div className="p-4"><p className="text-xs text-slate-500">TVA à payer (net)</p><p className="text-xl font-semibold">{Math.max(0, totals.tvaCollectee - totals.tvaDeductible).toLocaleString("fr-FR")} €</p></div></Card>
        )}
      </div>

      {/* Seuil micro */}
      {cfg?.status==="autoentrepreneur" && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Progression vers le seuil annuel</span>
            <span>{progressThreshold}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 mt-1">
            <div className="h-2 rounded-full bg-sky-500" style={{ width: `${progressThreshold}%` }} />
          </div>
        </div>
      )}

      {/* Add manual tx */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Ajouter une écriture</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-3">
          <Input type="date" value={newTx.date as any || ""} onChange={(e)=> setNewTx({...newTx, date: e.target.value})} />
          <Input placeholder="Libellé" value={newTx.label||""} onChange={(e)=> setNewTx({...newTx, label: e.target.value})} />
          <Select value={newTx.type as any} onChange={(e)=> setNewTx({...newTx, type: e.target.value as any})}>
            <option value="revenu">Revenu</option>
            <option value="depense">Dépense</option>
          </Select>
          <Input type="number" step="0.01" placeholder="Montant TTC" value={newTx.amount as any || ""} onChange={(e)=> setNewTx({...newTx, amount: Number(e.target.value)})} />
          {cfg?.vatScheme!=="franchise" && (
            <Input type="number" step="0.01" placeholder="Taux TVA" value={newTx.vatRate as any || cfg?.vatRate || 0} onChange={(e)=> setNewTx({...newTx, vatRate: Number(e.target.value)})} />
          )}
          <Button onClick={addTx} disabled={isPending}>{isPending? "Ajout…" : "Ajouter"}</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex items-center gap-2">
        <Select value={filterType} onChange={(e)=> setFilterType(e.target.value as any)}>
          <option value="all">Tous types</option>
          <option value="revenu">Revenus</option>
          <option value="depense">Dépenses</option>
        </Select>
        <Input placeholder="Rechercher un libellé…" value={q} onChange={(e)=> setQ(e.target.value)} className="max-w-xs" />
      </div>

      {/* Table */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Libellé</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Montant TTC</th>
              {cfg?.vatScheme!=="franchise" && <th className="px-3 py-2">TVA</th>}
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Justificatifs</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxs.map(t=>(
              <tr key={t.id} className="border-t">
                <td className="px-3 py-2">{new Date(t.date).toLocaleDateString("fr-FR")}</td>
                <td className="px-3 py-2">{t.label}</td>
                <td className="px-3 py-2 text-center">{t.type==="revenu"?"Revenu":"Dépense"}</td>
                <td className="px-3 py-2 text-right">{t.amount.toLocaleString("fr-FR")} €</td>
                {cfg?.vatScheme!=="franchise" && <td className="px-3 py-2 text-right">{(t.vatRate||0).toLocaleString("fr-FR", { style:"percent", minimumFractionDigits:0 })}</td>}
                <td className="px-3 py-2 text-center">{t.source==="consultation"?"Consultation en ligne":"Manuel"}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <input type="file" onChange={(e)=> e.target.files?.[0] && uploadReceipt(t.id, e.target.files[0])} />
                    {(t.receiptIds||[]).map(id => (
                      <a key={id} className="text-sky-700 hover:underline" href={`/api/precompta/receipts/${id}`} target="_blank">justif_{id.slice(0,6)}</a>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {filteredTxs.length===0 && (
              <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Aucune écriture</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {err && <p className="mt-4 text-sm text-rose-700">{err}</p>}
    </div>
  );
}
