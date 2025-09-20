"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ServiceStatus } from "@/lib/mockdb/services-artisan";

type Form = {
  title: string;
  slug: string;
  category?: string;
  durationMin?: number;
  priceTTC: number;
  vatRate: number;
  status: ServiceStatus;
  description?: string;
};

export default function NewServicePage(){
  const router = useRouter();
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState<string|null>(null);
  const [form,setForm] = useState<Form>({
    title: "", slug: "", priceTTC: 0, vatRate: 10, status: "DRAFT",
    category: "", durationMin: 60, description: "",
  });

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setSaving(true); setError(null);
    try{
      if(!form.title.trim()) throw new Error("Le titre est requis.");
      if(!form.slug.trim()) throw new Error("Le slug est requis.");
      if(form.priceTTC <= 0) throw new Error("Le prix TTC doit être > 0.");
      const r = await fetch("/api/artisan/services",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(form)
      });
      if(!r.ok){ await new Promise(res=>setTimeout(res,250)); }
      router.push(`/pro/artisan/catalogue/services/${form.slug}`);
    }catch(err:any){
      setError(err?.message ?? "Impossible de créer le service.");
    }finally{ setSaving(false); }
  }

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <h1 className="text-2xl font-semibold text-[#0b1239]">Nouveau service</h1>
          <Link href="/pro/artisan/catalogue/services" className="btn btn-outline">← Retour</Link>
        </div>
      </section>

      <section className="section">
        <form onSubmit={onSubmit} className="soft-card p-4 grid md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-muted">Titre</span>
            <input className="rounded-xl border border-slate-200 px-3 py-2" required
              value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-muted">Slug</span>
            <input className="rounded-xl border border-slate-200 px-3 py-2" required
              value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})}/>
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-muted">Catégorie</span>
            <input className="rounded-xl border border-slate-200 px-3 py-2"
              value={form.category ?? ""} onChange={e=>setForm({...form, category:e.target.value})}/>
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-muted">Durée (min)</span>
            <input type="number" min={0} className="rounded-xl border border-slate-200 px-3 py-2"
              value={form.durationMin ?? 0} onChange={e=>setForm({...form, durationMin:Number(e.target.value)})}/>
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-muted">Prix TTC (€)</span>
            <input type="number" min={0} step="0.01" className="rounded-xl border border-slate-200 px-3 py-2" required
              value={form.priceTTC} onChange={e=>setForm({...form, priceTTC:Number(e.target.value)})}/>
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-muted">TVA (%)</span>
            <input type="number" min={0} step="1" className="rounded-xl border border-slate-200 px-3 py-2" required
              value={form.vatRate} onChange={e=>setForm({...form, vatRate:Number(e.target.value)})}/>
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-muted">Statut</span>
            <select className="rounded-xl border border-slate-200 px-3 py-2"
              value={form.status} onChange={e=>setForm({...form, status:e.target.value as Form["status"]})}>
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm text-muted">Description</span>
            <textarea rows={6} className="rounded-xl border border-slate-200 px-3 py-2"
              value={form.description ?? ""} onChange={e=>setForm({...form, description:e.target.value})}/>
          </label>

          {error && <div className="alert alert-error md:col-span-2">{error}</div>}

          <div className="md:col-span-2 flex gap-2">
            <button className="btn" disabled={saving}>{saving?"Création…":"Créer"}</button>
            <Link href="/pro/artisan/catalogue/services" className="btn btn-outline">Annuler</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
