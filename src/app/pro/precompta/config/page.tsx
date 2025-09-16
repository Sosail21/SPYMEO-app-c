
"use client";
import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Config = {
  status: "autoentrepreneur" | "ei" | "eurl" | "sasu" | "sas";
  vatScheme: "franchise" | "normal" | "simplifie";
  vatRate: number; // e.g. 0.2
  socialRate: number; // e.g. 0.22 micro-BNC
  yearThresholdRevenue: number; // micro threshold (services: 77 700€)
  bank: { iban?: string; bic?: string; bankName?: string };
  onlineConsultsSync: boolean;
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={["w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500", className||""].join(" ")} />;
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return <select {...rest} className={["w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500", className||""].join(" ")} />;
}
function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: "primary" | "ghost"}){
  const { variant="primary", className, ...rest } = props;
  return <button {...rest} className={["rounded-xl px-4 py-2 text-sm font-medium", variant==="primary"?"bg-sky-600 text-white hover:bg-sky-700":"border border-slate-200 hover:bg-slate-50", className||""].join(" ")} />;
}

export default function PrecomptaConfigPage(){
  const [cfg, setCfg] = useState<Config | null>(null);
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  useEffect(()=>{
    fetchJSON<Config>("/api/precompta/config").then(setCfg).catch(e=> setErr(e.message));
  }, []);

  function save(){
    if (!cfg) return;
    startTransition(()=>{
      fetchJSON<Config>("/api/precompta/config", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(cfg)
      }).then(()=> router.push("/pro/precompta")).catch(e=> setErr(e.message));
    });
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">Pré‑compta — Configuration</h1>
      {!cfg ? <p className="text-sm text-slate-500">Chargement…</p> : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-900">Statut & régimes</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600">Statut</label>
                <Select value={cfg.status} onChange={(e)=> setCfg({...cfg, status: e.target.value as any})}>
                  <option value="autoentrepreneur">Auto‑entrepreneur (micro)</option>
                  <option value="ei">EI</option>
                  <option value="eurl">EURL</option>
                  <option value="sasu">SASU</option>
                  <option value="sas">SAS</option>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-600">Régime de TVA</label>
                <Select value={cfg.vatScheme} onChange={(e)=> setCfg({...cfg, vatScheme: e.target.value as any})}>
                  <option value="franchise">Franchise en base (pas de TVA)</option>
                  <option value="simplifie">Régime simplifié</option>
                  <option value="normal">Régime normal</option>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-600">Taux de TVA (si applicable)</label>
                <Input type="number" step="0.01" value={cfg.vatRate} onChange={(e)=> setCfg({...cfg, vatRate: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-xs text-slate-600">Taux charges sociales (indicatif)</label>
                <Input type="number" step="0.01" value={cfg.socialRate} onChange={(e)=> setCfg({...cfg, socialRate: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-xs text-slate-600">Seuil annuel de CA (micro)</label>
                <Input type="number" step="100" value={cfg.yearThresholdRevenue} onChange={(e)=> setCfg({...cfg, yearThresholdRevenue: Number(e.target.value)})} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-900">Banque & intégrations</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-600">Nom de la banque</label>
                <Input value={cfg.bank.bankName||""} onChange={(e)=> setCfg({...cfg, bank: {...cfg.bank, bankName: e.target.value}})} />
              </div>
              <div>
                <label className="text-xs text-slate-600">IBAN</label>
                <Input value={cfg.bank.iban||""} onChange={(e)=> setCfg({...cfg, bank: {...cfg.bank, iban: e.target.value}})} />
              </div>
              <div>
                <label className="text-xs text-slate-600">BIC</label>
                <Input value={cfg.bank.bic||""} onChange={(e)=> setCfg({...cfg, bank: {...cfg.bank, bic: e.target.value}})} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input id="sync" type="checkbox" checked={cfg.onlineConsultsSync} onChange={(e)=> setCfg({...cfg, onlineConsultsSync: e.target.checked})} />
              <label htmlFor="sync" className="text-sm">Synchroniser automatiquement les paiements des consultations en ligne</label>
            </div>
          </section>

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={()=> location.href="/pro/precompta"}>Annuler</Button>
            <Button onClick={save} disabled={isPending}>{isPending? "Enregistrement…" : "Enregistrer et continuer"}</Button>
          </div>

          {err && <p className="text-sm text-rose-700">{err}</p>}
        </div>
      )}
    </div>
  );
}
