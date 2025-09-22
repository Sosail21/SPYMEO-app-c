// src/app/pro/apprenants/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type LearnerStatus = "ACTIVE" | "INACTIVE" | "WAITING" | "ARCHIVED";

type Learner = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  trainingTitle: string;
  trainingSlug: string;
  sessionDate: string; // ISO
  status: LearnerStatus;
  enrolledAt: string; // ISO
};

const TABS: { key: "ALL" | LearnerStatus; label: string }[] = [
  { key: "ALL", label: "Tous" },
  { key: "ACTIVE", label: "Actifs" },
  { key: "WAITING", label: "En attente" },
  { key: "INACTIVE", label: "Inactifs" },
  { key: "ARCHIVED", label: "Archivés" },
];

export default function LearnersPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"ALL" | LearnerStatus>("ALL");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/center/learners", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setLearners(json?.learners ?? []);
      } catch {
        if (!cancel) setLearners(MOCK_LEARNERS);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return learners
      .filter((l) => (tab === "ALL" ? true : l.status === tab))
      .filter((l) => {
        if (!q.trim()) return true;
        const hay = `${l.name} ${l.email} ${l.trainingTitle}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
  }, [learners, tab, q]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* Header */}
      <section className="section">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">
              Apprenants
            </h1>
            <p className="text-slate-600">
              Liste des personnes inscrites à vos formations, avec suivi de leur statut.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/pro/formations" className="btn btn-outline">
              ← Formations
            </Link>
          </div>
        </div>
      </section>

      {/* Filtres */}
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
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un apprenant…"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
          />
        </div>
      </section>

      {/* Table */}
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
                  <Th>Nom</Th>
                  <Th>Email</Th>
                  <Th>Formation</Th>
                  <Th>Session</Th>
                  <Th>Statut</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-t">
                    <Td>
                      <span className="font-medium">{l.name}</span>
                      {l.phone && <div className="text-xs text-slate-500">{l.phone}</div>}
                    </Td>
                    <Td>{l.email}</Td>
                    <Td>
                      <Link
                        href={`/pro/formations/${l.trainingSlug}`}
                        className="hover:underline"
                      >
                        {l.trainingTitle}
                      </Link>
                    </Td>
                    <Td>{fmtDate(l.sessionDate)}</Td>
                    <Td><StatusBadge status={l.status} /></Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/pro/apprenants/${l.id}`}
                          className="pill pill-ghost"
                        >
                          Détail
                        </Link>
                        {l.status !== "ARCHIVED" ? (
                          <button
                            className="pill pill-muted"
                            onClick={() => alert("Archiver (à implémenter)")}
                          >
                            Archiver
                          </button>
                        ) : (
                          <button
                            className="pill pill-muted"
                            onClick={() => alert("Restaurer (à implémenter)")}
                          >
                            Restaurer
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
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
      <h3 className="text-lg font-semibold">Aucun apprenant</h3>
      <p className="text-slate-600 mt-1">
        Les inscriptions apparaîtront ici au fur et à mesure.
      </p>
      <Link href="/pro/formations" className="btn mt-4">
        Voir mes formations
      </Link>
    </div>
  );
}

function StatusBadge({ status }: { status: LearnerStatus }) {
  const map: Record<LearnerStatus, { label: string; cls: string }> = {
    ACTIVE: { label: "Actif", cls: "bg-emerald-100 text-emerald-700" },
    INACTIVE: { label: "Inactif", cls: "bg-slate-100 text-slate-700" },
    WAITING: { label: "En attente", cls: "bg-amber-100 text-amber-700" },
    ARCHIVED: { label: "Archivé", cls: "bg-slate-200 text-slate-500" },
  };
  const it = map[status];
  return <span className={`pill ${it.cls}`}>{it.label}</span>;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

// MOCK
const MOCK_LEARNERS: Learner[] = [
  {
    id: "l1",
    name: "Alice Martin",
    email: "alice@example.com",
    phone: "06 12 34 56 78",
    trainingTitle: "Réflexologie plantaire — initiation",
    trainingSlug: "reflexologie-plantaire-initiation",
    sessionDate: "2025-10-05",
    status: "ACTIVE",
    enrolledAt: "2025-09-10",
  },
  {
    id: "l2",
    name: "Marc Dupont",
    email: "marc@example.com",
    trainingTitle: "Kobido : fondamentaux & posture",
    trainingSlug: "kobido-fondamentaux-posture",
    sessionDate: "2025-11-02",
    status: "WAITING",
    enrolledAt: "2025-09-12",
  },
  {
    id: "l3",
    name: "Claire Petit",
    email: "claire@example.com",
    trainingTitle: "Éthique & cadre pro en cabinet libéral",
    trainingSlug: "ethique-cadre-pro-cabinet-liberal",
    sessionDate: "2025-08-20",
    status: "ARCHIVED",
    enrolledAt: "2025-07-30",
  },
];
