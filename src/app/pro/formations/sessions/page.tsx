// src/app/pro/formations/sessions/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TrainingSession = {
  id: string;
  trainingTitle: string;
  trainingSlug: string;
  modality: "ONLINE" | "ONSITE" | "HYBRID";
  date: string;     // ISO
  seats?: number;
  enrolled?: number;
  price?: number;
  status: "OPEN" | "CLOSED" | "CANCELLED";
};

const TABS = [
  { key: "ALL", label: "Toutes" },
  { key: "UPCOMING", label: "À venir" },
  { key: "PAST", label: "Passées" },
  { key: "CANCELLED", label: "Annulées" },
] as const;

export default function SessionsPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("ALL");
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/center/sessions", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setSessions(json?.sessions ?? []);
      } catch {
        if (!cancel) setSessions(MOCK_SESSIONS);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const now = new Date();

  const filtered = useMemo(() => {
    return sessions
      .filter((s) => {
        if (tab === "ALL") return true;
        if (tab === "CANCELLED") return s.status === "CANCELLED";
        const d = new Date(s.date);
        return tab === "UPCOMING" ? d >= startOfDay(now) : d < startOfDay(now);
      })
      .filter((s) => {
        if (!q.trim()) return true;
        const hay = `${s.trainingTitle} ${s.trainingSlug} ${s.modality}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, tab, q, now]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">
              Sessions & inscriptions
            </h1>
            <p className="text-slate-600">
              Suivez les effectifs, l’état des inscriptions et gérez l’ouverture/fermeture.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/pro/formations" className="btn btn-outline">← Formations</Link>
            <Link href="/pro/formations/nouvelle" className="btn">+ Nouvelle formation</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="soft-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <nav className="chips-row">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={"chip " + (tab === t.key ? "chip-active" : "")}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une session…"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
            />
          </div>
        </div>
      </section>

      <section className="section">
        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th>Formation</Th>
                  <Th>Date</Th>
                  <Th>Modalité</Th>
                  <Th>Capacité</Th>
                  <Th>Inscrits</Th>
                  <Th>Prix</Th>
                  <Th>Statut</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const full =
                    typeof s.seats === "number" && typeof s.enrolled === "number"
                      ? s.enrolled >= s.seats
                      : false;

                  return (
                    <tr key={s.id} className="border-t">
                      <Td>
                        <div className="flex flex-col">
                          <Link
                            href={`/pro/formations/${s.trainingSlug}`}
                            className="font-medium hover:underline"
                          >
                            {s.trainingTitle}
                          </Link>
                          <Link
                            href={`/formations/${s.trainingSlug}`}
                            className="text-slate-500 hover:underline"
                            target="_blank"
                          >
                            Aperçu public
                          </Link>
                        </div>
                      </Td>
                      <Td>{fmtDate(s.date)}</Td>
                      <Td>{labelModality(s.modality)}</Td>
                      <Td>{s.seats ?? "—"}</Td>
                      <Td>{s.enrolled ?? 0}</Td>
                      <Td>{typeof s.price === "number" ? `${s.price.toFixed(0)} €` : "—"}</Td>
                      <Td className="whitespace-nowrap">
                        <StatusBadge status={s.status} />
                        {full && (
                          <span className="pill bg-amber-100 text-amber-700 ml-2" title="Capacité atteinte">
                            Complet
                          </span>
                        )}
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-2">
                          {s.status !== "CANCELLED" && (
                            <button className="pill pill-muted" onClick={() => alert("Fermer la session (à implémenter)")}>
                              Fermer
                            </button>
                          )}
                          {s.status === "CANCELLED" ? (
                            <button className="pill pill-muted" onClick={() => alert("Restaurer la session (à implémenter)")}>
                              Restaurer
                            </button>
                          ) : (
                            <button className="pill pill-ghost" onClick={() => alert("Annuler la session (à implémenter)")}>
                              Annuler
                            </button>
                          )}

                          {/* 🔗 Lien de gestion par sessionId */}
                          <Link className="pill pill-ghost" href={`/pro/formations/sessions/${s.id}`}>
                            Gérer
                          </Link>

                          {/* ➕ Inscription rapide */}
                          <Link className="pill pill-ghost" href={`/pro/apprenants/nouveau?sessionId=${s.id}`}>
                            Inscrire
                          </Link>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}

function TableSkeleton() {
  return (
    <div className="soft-card p-4 animate-pulse">
      <div className="h-4 w-1/3 bg-slate-200 rounded" />
      <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded" />
      <div className="mt-2 h-3 w-2/5 bg-slate-100 rounded" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="text-lg font-semibold">Aucune session pour l’instant</h3>
      <p className="text-slate-600 mt-1">
        Créez une formation puis ajoutez vos premières sessions.
      </p>
      <div className="mt-4">
        <Link href="/pro/formations/nouvelle" className="btn">+ Nouvelle formation</Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TrainingSession["status"] }) {
  const map = {
    OPEN: { label: "Ouverte", cls: "bg-emerald-100 text-emerald-700" },
    CLOSED: { label: "Fermée", cls: "bg-slate-100 text-slate-700" },
    CANCELLED: { label: "Annulée", cls: "bg-amber-100 text-amber-700" },
  } as const;
  const it = map[status];
  return <span className={`pill ${it.cls}`}>{it.label}</span>;
}

function labelModality(m: "ONLINE" | "ONSITE" | "HYBRID") {
  switch (m) {
    case "ONLINE": return "En ligne";
    case "ONSITE": return "Présentiel";
    case "HYBRID": return "Hybride";
  }
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}

// MOCK
const MOCK_SESSIONS: TrainingSession[] = [
  {
    id: "s1",
    trainingTitle: "Réflexologie plantaire — module d’initiation",
    trainingSlug: "reflexologie-plantaire-initiation",
    modality: "ONLINE",
    date: "2025-11-05",
    seats: 40,
    enrolled: 28,
    price: 190,
    status: "OPEN",
  },
  {
    id: "s2",
    trainingTitle: "Kobido : fondamentaux & posture",
    trainingSlug: "kobido-fondamentaux-posture",
    modality: "HYBRID",
    date: "2025-10-18",
    seats: 24,
    enrolled: 9,
    price: 320,
    status: "CLOSED",
  },
  {
    id: "s3",
    trainingTitle: "Éthique & cadre pro en cabinet libéral",
    trainingSlug: "ethique-cadre-pro-cabinet-liberal",
    modality: "ONLINE",
    date: "2025-08-12",
    seats: 100,
    enrolled: 76,
    price: 0,
    status: "CANCELLED",
  },
];
