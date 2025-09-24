// src/app/pro/apprenants/nouveau/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Modality = "ONLINE" | "ONSITE" | "HYBRID";
type SessionOption = {
  id: string;
  date: string; // ISO
  trainingTitle: string;
  trainingSlug?: string;
  modality: Modality;
  seats?: number;
  enrolled?: number;
  status: "OPEN" | "CLOSED" | "CANCELLED";
};

type NewLearnerInput = {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  sessionId: string;
  paid: boolean;
};

export default function NewLearnerPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const prefillSessionId = sp.get("sessionId") ?? "";

  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<NewLearnerInput>({
    name: "",
    email: "",
    phone: "",
    notes: "",
    sessionId: prefillSessionId,
    paid: false,
  });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/center/sessions", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setSessions((json?.sessions ?? []) as SessionOption[]);
      } catch {
        if (!cancel) setSessions(MOCK_SESSIONS);
      } finally {
        if (!cancel) setLoadingSessions(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const openSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.status === "OPEN")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [sessions]
  );

  const selected = useMemo(
    () => openSessions.find((s) => s.id === form.sessionId),
    [openSessions, form.sessionId]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (!form.sessionId) throw new Error("Sélectionnez une session.");
      if (!form.name.trim() || !form.email.trim()) {
        throw new Error("Nom et email sont requis.");
      }

      // 1) créer/inscrire l’apprenant (à brancher côté API)
      const res = await fetch("/api/center/learners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        // fallback dev
        await new Promise((r) => setTimeout(r, 600));
      }

      // 2) redirection : fiche session pour suivi
      router.push(`/pro/centre/formations/sessions/${form.sessionId}`);
    } catch (err: any) {
      setError(err?.message || "Impossible d’inscrire l’apprenant pour le moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* fil d’ariane */}
      <section className="section">
        <nav className="text-sm text-slate-600">
          <Link href="/pro/centre/formations" className="hover:underline">Formations</Link>
          <span> / </span>
          <Link href="/pro/centre/apprenants" className="hover:underline">Apprenants</Link>
          <span> / </span>
          <span>Nouvel apprenant</span>
        </nav>
      </section>

      {/* header */}
      <section className="section">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">
              Inscrire un nouvel apprenant
            </h1>
            <p className="text-slate-600">
              Renseignez les infos de l’apprenant et choisissez la session.
            </p>
          </div>
          <div className="flex gap-2">
            {form.sessionId && (
              <Link href={`/pro/centre/formations/sessions/${form.sessionId}`} className="btn btn-outline">
                ← Retour session
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* formulaire */}
      <section className="section">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="soft-card p-4 grid md:grid-cols-2 gap-4">
            {/* session */}
            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-muted">Session</span>
              {loadingSessions ? (
                <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
              ) : (
                <select
                  value={form.sessionId}
                  onChange={(e) => setForm({ ...form, sessionId: e.target.value })}
                  className="rounded-xl border border-slate-200 px-3 py-2"
                  required
                >
                  <option value="" disabled>
                    {openSessions.length ? "Sélectionnez une session ouverte…" : "Aucune session ouverte"}
                  </option>
                  {openSessions.map((s) => {
                    const full =
                      typeof s.seats === "number" && typeof s.enrolled === "number"
                        ? s.enrolled >= s.seats
                        : false;
                    return (
                      <option key={s.id} value={s.id} disabled={full}>
                        {fmtDate(s.date)} — {s.trainingTitle}
                        {full ? " (complet)" : ""}
                      </option>
                    );
                  })}
                </select>
              )}
              {selected && (
                <p className="text-xs text-slate-500 mt-1">
                  {selected.trainingTitle} • {fmtDate(selected.date)} •{" "}
                  {typeof selected.seats === "number" && typeof selected.enrolled === "number"
                    ? `${selected.enrolled}/${selected.seats} inscrits`
                    : `${selected.enrolled ?? 0} inscrits`}
                </p>
              )}
            </label>

            {/* identité */}
            <label className="grid gap-1">
              <span className="text-sm text-muted">Nom et prénom</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="Alice Martin"
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-muted">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="alice@example.com"
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-muted">Téléphone (optionnel)</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="06 12 34 56 78"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-muted">Notes internes (optionnel)</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2"
                rows={3}
                placeholder="Contexte, besoins spécifiques, prise en charge…"
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.paid}
                onChange={(e) => setForm({ ...form, paid: e.target.checked })}
              />
              <span className="text-sm">Paiement reçu</span>
            </label>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn" disabled={saving || loadingSessions}>
              {saving ? "Inscription…" : "Inscrire l’apprenant"}
            </button>
            <Link href={selected ? `/pro/formations/sessions/${selected.id}` : "/pro/apprenants"} className="btn btn-outline">
              Annuler
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

/* Utils */
function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}

/* MOCK pour dev – supprime quand API prête */
const MOCK_SESSIONS: SessionOption[] = [
  {
    id: "s1",
    date: "2025-11-05",
    trainingTitle: "Réflexologie plantaire — module d’initiation",
    trainingSlug: "reflexologie-plantaire-initiation",
    modality: "ONLINE",
    seats: 40,
    enrolled: 28,
    status: "OPEN",
  },
  {
    id: "s2",
    date: "2025-10-18",
    trainingTitle: "Kobido : fondamentaux & posture",
    trainingSlug: "kobido-fondamentaux-posture",
    modality: "HYBRID",
    seats: 24,
    enrolled: 9,
    status: "CLOSED",
  },
  {
    id: "s3",
    date: "2025-08-12",
    trainingTitle: "Éthique & cadre pro en cabinet libéral",
    trainingSlug: "ethique-cadre-pro-cabinet-liberal",
    modality: "ONLINE",
    seats: 100,
    enrolled: 100,
    status: "CANCELLED",
  },
];
