// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgendaSettings, AppointmentType, DayKey } from "@/lib/mockdb/agendaSettings";

const DAYS: Array<{ key: DayKey; label: string }> = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
];

const BUFFER_CHOICES = [0, 10, 15, 20, 25, 30] as const;

export default function SettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AgendaSettings | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/agenda/settings")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const onToggleDay = (key: DayKey) => {
    if (!data) return;
    setData({
      ...data,
      availabilities: {
        ...data.availabilities,
        [key]: { ...data.availabilities[key], enabled: !data.availabilities[key].enabled }
      }
    });
  };

  const onAvailChange = (key: DayKey, field: "start"|"end", val: string) => {
    if (!data) return;
    setData({
      ...data,
      availabilities: {
        ...data.availabilities,
        [key]: { ...data.availabilities[key], [field]: val }
      }
    });
  };

  const addAppointmentType = () => {
    if (!data) return;
    const newType: AppointmentType = {
      id: "appt-" + (Date.now() % 100000),
      group: "Consultations individuelles",
      label: "Nouveau type",
      durationMin: 60,
      price: 0,
      mode: "individuel",
      location: "cabinet"
    };
    setData({ ...data, appointmentTypes: [newType, ...data.appointmentTypes] });
  };

  const updateType = (id: string, patch: Partial<AppointmentType>) => {
    if (!data) return;
    setData({
      ...data,
      appointmentTypes: data.appointmentTypes.map(t => t.id === id ? { ...t, ...patch } : t)
    });
  };

  const removeType = (id: string) => {
    if (!data) return;
    setData({ ...data, appointmentTypes: data.appointmentTypes.filter(t => t.id !== id) });
  };

  const grouped = useMemo(() => {
    const out: Record<string, AppointmentType[]> = {};
    if (!data) return out;
    for (const t of data.appointmentTypes) {
      out[t.group] = out[t.group] || [];
      out[t.group].push(t);
    }
    return out;
  }, [data?.appointmentTypes]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/agenda/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setMsg("Paramètres enregistrés ✅");
    } catch (e) {
      setMsg("Erreur lors de l’enregistrement ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return <div className="auth-card"><div>Chargement…</div></div>;
  }

  return (
    <div className="grid gap-6">
      {msg && <div className={`alert ${msg.includes("✅") ? "alert-success" : "alert-error"}`}>{msg}</div>}

      {/* Section — Plage horaire (par jour) */}
      <section className="card">
        <header className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Plages horaires</h2>
          <div className="text-sm text-muted">Configure tes jours et heures d’ouverture. Modifiables ponctuellement depuis l’agenda.</div>
        </header>
        <div className="grid gap-3">
          {DAYS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3 border rounded-lg px-3 py-2">
              <label className="flex items-center gap-2 min-w-[140px]">
                <input type="checkbox" checked={data.availabilities[key].enabled} onChange={() => onToggleDay(key)} />
                <span className="font-medium">{label}</span>
              </label>
              <div className="flex items-center gap-2">
                <input type="time" className="input-pill" value={data.availabilities[key].start} onChange={(e) => onAvailChange(key, "start", e.target.value)} />
                <span className="text-muted">→</span>
                <input type="time" className="input-pill" value={data.availabilities[key].end} onChange={(e) => onAvailChange(key, "end", e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section — Buffer / vue / lieux */}
      <section className="card grid gap-4">
        <h2 className="text-lg font-semibold">Préférences</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-muted">Zone tampon entre RDV</span>
            <select className="page" value={data.bufferMin} onChange={(e) => setData({ ...data, bufferMin: Number(e.target.value) as any })}>
              {BUFFER_CHOICES.map(b => <option key={b} value={b}>{b} min</option>)}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-muted">Vue par défaut</span>
            <select className="page" value={data.defaultView} onChange={(e) => setData({ ...data, defaultView: e.target.value as any })}>
              <option value="timeGridWeek">Semaine (heures)</option>
              <option value="dayGridMonth">Mois</option>
            </select>
          </label>
          <fieldset className="grid gap-1">
            <span className="text-sm text-muted">Lieux autorisés</span>
            <div className="flex flex-wrap gap-2">
              {["cabinet","domicile","visio","entreprise"].map(loc => (
                <label key={loc} className="pill pill-ghost cursor-pointer">
                  <input
                    className="mr-2"
                    type="checkbox"
                    checked={data.allowedLocations.includes(loc as any)}
                    onChange={(e) => {
                      const set = new Set(data.allowedLocations);
                      if (e.target.checked) set.add(loc as any); else set.delete(loc as any);
                      setData({ ...data, allowedLocations: Array.from(set) as any });
                    }}
                  />
                  {loc}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      {/* Section — Types de rendez-vous */}
      <section className="card grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Types de rendez-vous</h2>
          <button className="btn" type="button" onClick={addAppointmentType}>Ajouter un type</button>
        </div>

        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="grid gap-2">
            <h3 className="text-sm text-muted">{group}</h3>
            <div className="grid gap-2">
              {items.map((t) => (
                <div key={t.id} className="soft-card p-3 grid md:grid-cols-6 gap-2 items-center">
                  <input className="page md:col-span-2" value={t.label} onChange={(e) => updateType(t.id, { label: e.target.value })} />
                  <select className="page" value={t.group} onChange={(e) => updateType(t.id, { group: e.target.value })}>
                    <option>Consultations individuelles</option>
                    <option>Soins & pratiques corporelles</option>
                    <option>Accompagnements santé & bien-être</option>
                    <option>Ateliers & collectifs</option>
                    <option>Spécifiques (entreprise, scolaire, sport, parentalité)</option>
                    <option>Autres prestations</option>
                  </select>
                  <input type="number" className="page" min={15} step={5} value={t.durationMin} onChange={(e) => updateType(t.id, { durationMin: Number(e.target.value) })} />
                  <input type="number" className="page" min={0} step={1} placeholder="Tarif (€)" value={t.price ?? ""} onChange={(e) => updateType(t.id, { price: e.target.value === "" ? undefined : Number(e.target.value) })} />
                  <select className="page" value={t.mode} onChange={(e) => updateType(t.id, { mode: e.target.value as any })}>
                    <option value="individuel">Individuel</option>
                    <option value="collectif">Collectif</option>
                  </select>
                  <select className="page" value={t.location} onChange={(e) => updateType(t.id, { location: e.target.value as any })}>
                    <option value="cabinet">Cabinet</option>
                    <option value="domicile">Domicile</option>
                    <option value="visio">Visio</option>
                    <option value="entreprise">Entreprise</option>
                  </select>
                  <button className="page text-red-700" onClick={() => removeType(t.id)}>Supprimer</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="flex justify-end gap-2">
        <button className="btn btn-outline" type="button" onClick={() => location.reload()}>Annuler</button>
        <button className="btn" type="button" disabled={saving} onClick={save}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
