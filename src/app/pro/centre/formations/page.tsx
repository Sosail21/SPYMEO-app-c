"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TrainingStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type TrainingModality = "ONLINE" | "ONSITE" | "HYBRID";

type Training = {
  id: string;
  title: string;
  slug: string;
  modality: TrainingModality;
  nextSession?: string; // ISO date
  seats?: number;
  enrolled?: number;
  price?: number; // TTC €
  status: TrainingStatus;
};

const TABS: { key: "ALL" | TrainingStatus; label: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "PUBLISHED", label: "Publiées" },
  { key: "DRAFT", label: "Brouillons" },
  { key: "ARCHIVED", label: "Archivées" },
];

// Data hook (mock fallback)
function useCenterTrainings() {
  const [data, setData] = useState<Training[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const r = await fetch("/api/center/trainings", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!canceled) setData(json?.trainings ?? []);
      } catch {
        if (!canceled) setData(MOCK_TRAININGS);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => { canceled = true; };
  }, []);

  return { data, loading };
}

export default function CenterTrainingsPage() {
  const { data, loading } = useCenterTrainings();

  const [activeTab, setActiveTab] = useState<"ALL" | TrainingStatus>("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const list = (data ?? [])
      .filter((t) => (activeTab === "ALL" ? true : t.status === activeTab))
      .filter((t) => {
        if (!q.trim()) return true;
        const hay = `${t.title} ${t.slug} ${t.modality}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => (a.title > b.title ? 1 : -1));
    return list;
  }, [data, activeTab, q]);

  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [activeTab, q]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* Header */}
      <section className="section">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Mes formations</h1>
            <p className="text-slate-600">Créez, publiez et suivez vos programmes et sessions (inscriptions, capacités, statut).</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/pro/centre/formations/nouvelle" className="btn">+ Nouvelle formation</Link>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="section">
        <div className="soft-card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <nav aria-label="Filtre par statut" className="chips-row">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key as any)}
                  className={"chip " + (activeTab === t.key ? "chip-active" : "")}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher une formation…"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
                aria-label="Rechercher"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="section">
        {loading ? (
          <ListSkeleton />
        ) : slice.length === 0 ? (
          <EmptyState onCreateHref="/pro/centre/formations/nouvelle" />
        ) : (
          <ul className="grid gap-3">
            {slice.map((t) => {
              const hasCap = typeof t.seats === "number";
              const enrolled = typeof t.enrolled === "number" ? t.enrolled : undefined;
              const full = hasCap && typeof enrolled === "number" ? enrolled >= (t.seats as number) : false;

              return (
                <li key={t.id} className="soft-card p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/pro/centre/formations/${t.slug}`}
                          className="font-semibold hover:underline truncate"
                          title={t.title}
                        >
                          {t.title}
                        </Link>
                        <StatusBadge status={t.status} />
                        {full && <span className="pill bg-amber-100 text-amber-700" title="Capacité atteinte">Complet</span>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1"><span>🎥</span> {labelModality(t.modality)}</span>
                        {t.nextSession && <span className="inline-flex items-center gap-1"><span>🗓</span> Prochaine : {fmtDate(t.nextSession)}</span>}
                        {typeof enrolled === "number" && hasCap && (
                          <span className="inline-flex items-center gap-1"><span>👥</span> {enrolled}/{t.seats} inscrits</span>
                        )}
                        {typeof t.price === "number" && (
                          <span className="inline-flex items-center gap-1"><span>💶</span> {t.price.toFixed(0)} € TTC</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link href={`/pro/centre/formations/${t.slug}`} className="pill pill-ghost" title="Voir la fiche formation et ses sessions">
                        Détails & sessions
                      </Link>
                      <Link href={`/pro/centre/formations/${t.slug}/sessions/nouvelle`} className="pill pill-ghost" title="Créer une session pour cette formation">
                        + Créer une session
                      </Link>
                      <Link href={`/centre-de-formation/${t.slug}`} className="pill pill-muted" target="_blank">
                        Aperçu public
                      </Link>
                      {t.status !== "ARCHIVED" ? (
                        <button type="button" className="pill pill-muted" onClick={() => alert("Archivage (à implémenter)")}>Archiver</button>
                      ) : (
                        <button type="button" className="pill pill-muted" onClick={() => alert("Restaurer (à implémenter)")}>Restaurer</button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Pagination */}
      <section className="section">
        <div className="soft-card p-3 flex items-center justify-between">
          <span className="text-sm text-slate-600">{total} formation{total > 1 ? "s" : ""} • page {page}/{maxPage}</span>
          <div className="flex gap-2">
            <button className="pill pill-muted" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Précédent</button>
            <button className="pill pill-muted" onClick={() => setPage((p) => Math.min(maxPage, p + 1))} disabled={page >= maxPage}>Suivant</button>
          </div>
        </div>
      </section>
    </main>
  );
}

// UI helpers
function EmptyState({ onCreateHref }: { onCreateHref: string }) {
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="text-lg font-semibold">Aucune formation pour l’instant</h3>
      <p className="text-slate-600 mt-1">Créez votre première formation en ligne, ajoutez vos sessions, puis publiez-la.</p>
      <div className="mt-4"><Link href={onCreateHref} className="btn">+ Nouvelle formation</Link></div>
    </div>
  );
}
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
function StatusBadge({ status }: { status: TrainingStatus }) {
  const map: Record<TrainingStatus, { label: string; cls: string }> = {
    DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-700" },
    PUBLISHED: { label: "Publiée", cls: "bg-emerald-100 text-emerald-700" },
    ARCHIVED: { label: "Archivée", cls: "bg-amber-100 text-amber-700" },
  };
  const it = map[status];
  return <span className={`pill ${it.cls}`}>{it.label}</span>;
}
function labelModality(m: TrainingModality) {
  switch (m) {
    case "ONLINE": return "En ligne";
    case "ONSITE": return "Présentiel";
    case "HYBRID": return "Hybride";
    default: return m;
  }
}
function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" }); }
  catch { return iso; }
}

// MOCK (remove when API ready)
const MOCK_TRAININGS: Training[] = [
  { id: "t1", title: "Réflexologie plantaire — module d’initiation", slug: "reflexologie-plantaire-initiation", modality: "ONLINE", nextSession: "2025-10-12", seats: 40, enrolled: 28, price: 190, status: "PUBLISHED" },
  { id: "t2", title: "Kobido : fondamentaux & posture", slug: "kobido-fondamentaux-posture", modality: "HYBRID", nextSession: "2025-11-05", seats: 24, enrolled: 9, price: 320, status: "DRAFT" },
  { id: "t3", title: "Éthique & cadre pro en cabinet libéral", slug: "ethique-cadre-pro-cabinet-liberal", modality: "ONLINE", nextSession: "2025-12-02", seats: 100, enrolled: 76, price: 0, status: "PUBLISHED" },
  { id: "t4", title: "Aromathérapie avancée — cas pratiques", slug: "aromatherapie-avancee-cas-pratiques", modality: "ONLINE", seats: 50, enrolled: 50, price: 240, status: "ARCHIVED" },
];
