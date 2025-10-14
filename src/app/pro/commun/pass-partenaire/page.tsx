// Cdw-Spm
"use client";

import * as React from "react";

type Partner = { userId:string; enabled:boolean; rate:5|10|15|20|25|30 };

export default function PassPartnerPage() {
  const [state, setState] = React.useState<Partner | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(()=>{ (async()=>{
    const r = await fetch("/api/pro/pass",{cache:"no-store"}); if(r.ok) setState(await r.json());
  })(); }, []);

  async function save() {
    if (!state) return;
    setSaving(true);
    const r = await fetch("/api/pro/pass",{ method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(state) });
    setSaving(false);
    if (r.ok) setState(await r.json());
  }

  return (
    <main className="section">
      <div className="container-spy grid gap-6">
        <header className="grid gap-1">
          <h1 className="text-2xl md:text-3xl font-bold">PASS Partenaire</h1>
          <p className="text-muted">Devenez partenaire PASS et affichez un badge sur votre fiche. Choisissez le taux de réduction accordé aux membres PASS.</p>
        </header>

        <div className="soft-card p-5 grid gap-4 md:grid-cols-2">
          <div className="grid gap-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={!!state?.enabled} onChange={e=>setState(s=>s?{...s,enabled:e.target.checked}:s)} />
              <span>Activer le partenariat PASS</span>
            </label>
            <div>
              <div className="text-xs text-slate-600 mb-1">Taux de réduction</div>
              <select className="inp" value={state?.rate ?? 10} onChange={e=>setState(s=>s?{...s,rate:Number(e.target.value) as any}:s)}>
                {[5,10,15,20,25,30].map(p=><option key={p} value={p}>{p}%</option>)}
              </select>
            </div>
            <button className="pill w-max" onClick={save} disabled={saving}>{saving?"Enregistrement…":"Enregistrer"}</button>
          </div>

          <div className="rounded-xl border p-4 bg-slate-50">
            <div className="text-sm text-slate-500 mb-2">Aperçu badge sur votre fiche :</div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white">
              <span>🔖</span>
              <span className="text-sm font-medium">Partenaire PASS</span>
              <span className="text-xs text-slate-600">-{state?.enabled ? state.rate : 10}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Le badge s’affichera publiquement sur votre fiche quand le partenariat est activé.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}