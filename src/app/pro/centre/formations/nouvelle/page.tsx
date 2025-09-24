"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TrainingModality = "ONLINE" | "ONSITE" | "HYBRID";
type TrainingStatus = "DRAFT" | "PUBLISHED";

type TrainingInput = {
  title: string;
  slug: string;
  modality: TrainingModality;
  price?: number;
  seats?: number;
  description?: string;
  status: TrainingStatus;
  firstSession?: string; // ISO date
};

export default function NewTrainingPage() {
  const router = useRouter();

  const [form, setForm] = useState<TrainingInput>({
    title: "", slug: "", modality: "ONLINE", price: undefined, seats: undefined, description: "", status: "DRAFT", firstSession: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoSlug = useMemo(() => {
    return form.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }, [form.title]);

  useEffect(() => { if (!form.slug) setForm((f) => ({ ...f, slug: autoSlug })); /* eslint-disable-next-line */ }, [autoSlug]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      const r = await fetch("/api/center/trainings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) await new Promise((res) => setTimeout(res, 600)); // mock ok
      router.push("/pro/centre/formations");
    } catch (err: any) {
      setError(err?.message || "Impossible d’enregistrer pour le moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Nouvelle formation</h1>
            <p className="text-slate-600">Renseignez les informations principales. Vous pourrez ajouter des sessions ensuite.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/pro/centre/formations" className="btn btn-outline">Retour à la liste</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="soft-card p-4 grid md:grid-cols-2 gap-4">
            <label className="grid gap-1"><span className="text-sm text-muted">Titre</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded-xl border border-slate-200 px-3 py-2" placeholder="Kobido — fondamentaux & posture" />
            </label>
            <label className="grid gap-1"><span className="text-sm text-muted">Slug</span>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="rounded-xl border border-slate-200 px-3 py-2" placeholder="kobido-fondamentaux-posture" />
            </label>
            <label className="grid gap-1"><span className="text-sm text-muted">Modalité</span>
              <select value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value as TrainingModality })} className="rounded-xl border border-slate-200 px-3 py-2">
                <option value="ONLINE">En ligne</option><option value="ONSITE">Présentiel</option><option value="HYBRID">Hybride</option>
              </select>
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1"><span className="text-sm text-muted">Prix (TTC, €)</span>
                <input type="number" inputMode="decimal" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : undefined })} className="rounded-xl border border-slate-200 px-3 py-2" placeholder="190" min={0} />
              </label>
              <label className="grid gap-1"><span className="text-sm text-muted">Capacité (places)</span>
                <input type="number" inputMode="numeric" value={form.seats ?? ""} onChange={(e) => setForm({ ...form, seats: e.target.value ? Number(e.target.value) : undefined })} className="rounded-xl border border-slate-200 px-3 py-2" placeholder="24" min={1} />
              </label>
            </div>

            <label className="grid gap-1 md:col-span-2"><span className="text-sm text-muted">Description</span>
              <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="rounded-xl border border-slate-200 px-3 py-2" placeholder="Objectifs pédagogiques, prérequis, modules, évaluation…" />
            </label>

            <div className="grid md:grid-cols-2 gap-4 md:col-span-2">
              <label className="grid gap-1"><span className="text-sm text-muted">Statut</span>
                <div className="chips-row">
                  {(["DRAFT", "PUBLISHED"] as TrainingStatus[]).map((s) => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className={"chip " + (form.status === s ? "chip-active" : "")}>
                      {s === "DRAFT" ? "Brouillon" : "Publiée"}
                    </button>
                  ))}
                </div>
              </label>

              <label className="grid gap-1"><span className="text-sm text-muted">Première session (optionnel)</span>
                <input type="date" value={form.firstSession ?? ""} onChange={(e) => setForm({ ...form, firstSession: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2" />
              </label>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn" disabled={saving}>{saving ? "Enregistrement…" : "Créer la formation"}</button>
            <Link href="/pro/centre/formations" className="btn btn-outline">Annuler</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
