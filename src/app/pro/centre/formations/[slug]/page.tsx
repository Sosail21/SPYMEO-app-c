// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

type Modality = "ONLINE" | "ONSITE" | "HYBRID";
type SessionStatus = "OPEN" | "CLOSED" | "CANCELLED";

type SessionSummary = { id: string; date: string; seats?: number; enrolled?: number; price?: number; status: SessionStatus; };
type TrainingDetail = { slug: string; title: string; modality: Modality; description?: string; totalEnrolled?: number; sessions: SessionSummary[]; };

export default function TrainingDetailPage() {
  const { slug } = useParams() as { slug: string };

  const [data, setData] = useState<TrainingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"UPCOMING" | "PAST" | "ALL">("UPCOMING");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch(`/api/center/trainings/${slug}`, { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setData(json?.training ?? null);
      } catch {
        if (!cancel) setData(MOCK_TRAINING_DETAIL.find((t) => t.slug === slug) ?? null);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [slug]);

  if (!loading && !data) notFound();

  const now = new Date();
  const sessions = data?.sessions ?? [];

  const filtered = useMemo(() => {
    return sessions
      .filter((s) => {
        if (tab === "ALL") return true;
        const d = new Date(s.date);
        return tab === "UPCOMING" ? d >= startOfDay(now) : d < startOfDay(now);
      })
      .filter((s) => {
        if (!q.trim()) return true;
        const hay = `${fmtDate(s.date)} ${s.status}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, tab, q, now]);

  const nextSession = useMemo(() => {
    return sessions
      .filter((s) => new Date(s.date) >= startOfDay(now))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [sessions, now]);

  const totalSessions = sessions.length;
  const totalEnrolled = data?.totalEnrolled ?? sessions.reduce((acc, s) => acc + (s.enrolled ?? 0), 0);

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* Fil d’Ariane */}
      <section className="section">
        <nav className="text-sm text-slate-600">
          <Link href="/pro/centre/formations" className="hover:underline">Formations</Link>
          <span> / </span>
          <span>{data?.title ?? slug}</span>
        </nav>
      </section>

      {/* Header */}
      <section className="section">
        <div className="soft-card p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">{data?.title || "Formation"}</h1>
              <p className="text-slate-600">
                {data ? (<>{labelModality(data.modality)} • {totalSessions} session{totalSessions > 1 ? "s" : ""} • {totalEnrolled} inscrit{totalEnrolled > 1 ? "s" : ""}{nextSession && <> • Prochaine : {fmtDate(nextSession.date)}</>}</>) : "—"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/centre-de-formation/${slug}`} target="_blank" className="pill pill-muted">Aperçu public</Link>
              <Link href={`/pro/centre/formations/sessions`} className="pill pill-ghost">Voir toutes les sessions</Link>
            </div>
          </div>

          {data?.description && <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{data.description}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/pro/centre/formations/${slug}/sessions/nouvelle`} className="btn">+ Créer une session</Link>
            {nextSession && <Link href={`/pro/centre/formations/sessions/${nextSession.id}`} className="btn btn-outline">Gérer la prochaine session</Link>}
          </div>
        </div>
      </section>

      {/* Filtres sessions */}
      <section className="section">
        <div className="soft-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <nav className="chips-row">
            {(["UPCOMING", "PAST", "ALL"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setTab(k)} className={"chip " + (tab === k ? "chip-active" : "")}>
                {k === "UPCOMING" ? "À venir" : k === "PAST" ? "Passées" : "Toutes"}
              </button>
            ))}
          </nav>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une session…" className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64" />
        </div>
      </section>

      {/* Liste des sessions */}
      <section className="section">
        {loading ? (
          <ListSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState slug={slug} />
        ) : (
          <ul className="grid gap-3">
            {filtered.map((s) => {
              const enrolled = s.enrolled ?? 0;
              const seats = s.seats ?? undefined;
              const full = typeof seats === "number" ? enrolled >= seats : false;

              return (
                <li key={s.id} className="soft-card p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{fmtDate(s.date)}</h3>
                        <SessionStatusBadge status={s.status} />
                        {full && <span className="pill bg-amber-100 text-amber-700" title="Capacité atteinte">Complet</span>}
                      </div>
                      <div className="mt-1 text-sm text-slate-600 flex flex-wrap items-center gap-3">
                        {typeof seats === "number" ? (
                          <span className="inline-flex items-center gap-1"><span>👥</span> {enrolled}/{seats} inscrits</span>
                        ) : (
                          <span className="inline-flex items-center gap-1"><span>👥</span> {enrolled} inscrit{enrolled > 1 ? "s" : ""}</span>
                        )}
                        {typeof s.price === "number" && <span className="inline-flex items-center gap-1"><span>💶</span> {s.price.toFixed(0)} € TTC</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link href={`/pro/centre/formations/sessions/${s.id}`} className="pill pill-ghost" title="Gérer la session (inscriptions, présence, actions)">Gérer</Link>
                      <Link href={`/pro/centre/apprenants/nouveau?sessionId=${s.id}`} className="pill pill-ghost" title="Inscrire un nouvel apprenant à cette session">+ Nouvel apprenant</Link>
                      <button type="button" className="pill pill-muted" onClick={() => alert("Contacter les inscrits (à implémenter)")} title="Envoyer un email aux inscrits">Joindre les inscrits</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

/* --- UI helpers --- */
function ListSkeleton() {
  return (
    <ul className="grid gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="soft-card p-4 animate-pulse">
          <div className="h-4 w-1/3 bg-slate-200 rounded" />
          <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded" />
        </li>
      ))}
    </ul>
  );
}
function EmptyState({ slug }: { slug: string }) {
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="text-lg font-semibold">Aucune session pour l’instant</h3>
      <p className="text-slate-600 mt-1">Créez votre première session pour cette formation.</p>
      <div className="mt-4"><Link href={`/pro/centre/formations/${slug}/sessions/nouvelle`} className="btn">+ Créer une session</Link></div>
    </div>
  );
}
function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const map: Record<SessionStatus, { label: string; cls: string }> = {
    OPEN: { label: "Ouverte", cls: "bg-emerald-100 text-emerald-700" },
    CLOSED: { label: "Fermée", cls: "bg-slate-100 text-slate-700" },
    CANCELLED: { label: "Annulée", cls: "bg-amber-100 text-amber-700" },
  };
  const it = map[status]; return <span className={`pill ${it.cls}`}>{it.label}</span>;
}
function labelModality(m: Modality) { switch (m) { case "ONLINE": return "En ligne"; case "ONSITE": return "Présentiel"; case "HYBRID": return "Hybride"; default: return m; } }
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function fmtDate(iso: string) { try { return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" }); } catch { return iso; } }

/* --- MOCK fallback --- */
const MOCK_TRAINING_DETAIL: TrainingDetail[] = [
  { slug: "reflexologie-plantaire-initiation", title: "Réflexologie plantaire — module d’initiation", modality: "ONLINE", description: "Découverte des fondamentaux et mise en pratique guidée.", sessions: [
    { id: "s1", date: "2025-11-05", seats: 40, enrolled: 28, price: 190, status: "OPEN" },
    { id: "s3", date: "2025-08-12", seats: 100, enrolled: 100, price: 0, status: "CANCELLED" },
  ]},
  { slug: "kobido-fondamentaux-posture", title: "Kobido : fondamentaux & posture", modality: "HYBRID", sessions: [
    { id: "s2", date: "2025-10-18", seats: 24, enrolled: 9, price: 320, status: "CLOSED" },
  ]},
];
