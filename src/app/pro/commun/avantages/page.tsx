// Cdw-Spm
// src/app/pro/avantages/page.tsx
"use client";

import * as React from "react";

type Advantage = {
  id: string; title: string; type: "REDUCTION"|"ECHANGE"|"INVITATION";
  description?: string; percentage?: number; active: boolean; createdAt: string;
};

export default function AvantagesPage() {
  const [items, setItems] = React.useState<Advantage[]>([]);
  const [form, setForm] = React.useState({ title: "", type: "REDUCTION", description: "", percentage: 10 });

  React.useEffect(() => { refresh(); }, []);
  async function refresh() {
    const res = await fetch("/api/pro/avantages", { cache: "no-store" });
    if (res.ok) setItems(await res.json());
  }
  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/pro/avantages", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, active: true })
    });
    if (res.ok) { await refresh(); setForm({ title: "", type: "REDUCTION", description: "", percentage: 10 }); }
  }
  async function toggle(id: string, active: boolean) {
    const res = await fetch(`/api/pro/avantages/${id}?active=${!active}`, { method: "PATCH" });
    if (res.ok) refresh();
  }

  return (
    <main className="section">
      <div className="container-spy grid gap-6">
        <header className="grid gap-1">
          <h1 className="text-2xl md:text-3xl font-bold">Avantages</h1>
          <p className="text-muted">Proposez des réductions, des échanges de services ou des invitations aux autres pros SPYMEO.</p>
        </header>

        <div className="soft-card p-5">
          <h3 className="font-medium mb-3">Publier un avantage</h3>
          <form onSubmit={create} className="grid gap-3 md:grid-cols-4">
            <input className="inp md:col-span-2" placeholder="Titre" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
            <select className="inp" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value as any}))}>
              <option value="REDUCTION">Réduction</option>
              <option value="ECHANGE">Échange de services</option>
              <option value="INVITATION">Invitation / Gratuité</option>
            </select>
            {form.type === "REDUCTION" ? (
              <select className="inp" value={form.percentage} onChange={e=>setForm(f=>({...f,percentage: Number(e.target.value)}))}>
                {[5,10,15,20,25,30].map(p=><option key={p} value={p}>{p}%</option>)}
              </select>
            ) : (
              <input className="inp" placeholder="Détail court" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
            )}
            <div className="md:col-span-4 flex justify-end">
              <button className="pill">Publier</button>
            </div>
          </form>
        </div>

        <div className="soft-card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500">
              <th className="py-2 px-4">Titre</th><th>Type</th><th>Détail</th><th>Statut</th><th></th>
            </tr></thead>
            <tbody>
              {items.length===0 && <tr><td className="px-4 py-4 text-slate-500" colSpan={5}>Aucun avantage publié pour l’instant.</td></tr>}
              {items.map(it=>(
                <tr key={it.id} className="border-t">
                  <td className="px-4 py-3">{it.title}</td>
                  <td className="py-3">{it.type}</td>
                  <td className="py-3">{it.type==="REDUCTION" ? `${it.percentage}%` : it.description}</td>
                  <td className="py-3">{it.active ? "Actif" : "Inactif"}</td>
                  <td className="py-3 text-right">
                    <button className="pill pill-ghost" onClick={()=>toggle(it.id, it.active)}>{it.active?"Désactiver":"Activer"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
