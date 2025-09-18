"use client";

import * as React from "react";

type Opp = { id:string; kind:"EMPLOI"|"INTERVENTION_B2B"; title:string; company:string; location?:string; description:string; createdAt:string; open:boolean; applyUrl?:string };

export default function ImpactPage() {
  const [items, setItems] = React.useState<Opp[]>([]);
  const [sending, setSending] = React.useState<string | null>(null);

  React.useEffect(()=>{ (async()=>{
    const r = await fetch("/api/pro/impact",{cache:"no-store"}); if(r.ok) setItems(await r.json());
  })(); }, []);

  async function postuler(id: string) {
    setSending(id);
    const r = await fetch("/api/pro/impact/candidature", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ opportunityId:id }) });
    setSending(null);
    if (r.ok) alert("Candidature envoyée ✅");
  }

  return (
    <main className="section">
      <div className="container-spy grid gap-6">
        <header className="grid gap-1">
          <h1 className="text-2xl md:text-3xl font-bold">Impact</h1>
          <p className="text-muted">Offres d’emploi et interventions B2B publiées par SPYMEO. Postulez en 1 clic.</p>
        </header>

        <div className="grid gap-3">
          {items.map(o=>(
            <div key={o.id} className="soft-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-sm text-slate-500">{o.kind === "EMPLOI" ? "Offre d’emploi" : "Intervention B2B"}</div>
                <div className="text-lg font-semibold">{o.title}</div>
                <div className="text-sm text-slate-600">{o.company} · {o.location || "—"}</div>
                <p className="text-sm text-slate-600 mt-2">{o.description}</p>
              </div>
              <div className="flex gap-2">
                {o.applyUrl ? (
                  <a className="pill" href={o.applyUrl} target="_blank">Candidater</a>
                ) : (
                  <button className="pill" onClick={()=>postuler(o.id)} disabled={sending===o.id}>{sending===o.id?"Envoi…":"Candidater"}</button>
                )}
              </div>
            </div>
          ))}
          {items.length===0 && <div className="soft-card p-5 text-slate-500">Pas d’opportunité pour le moment.</div>}
        </div>
      </div>
    </main>
  );
}