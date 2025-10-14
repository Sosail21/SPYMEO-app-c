// Cdw-Spm
// src/app/admin/centres/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Center = { id: string; name: string; city?: string; trainings: number; sessions: number; learners: number; published: number };

export default function AdminCentersPage() {
  const { data, loading } = useAdminCenters();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const hay = q.toLowerCase();
    return (data ?? [])
      .filter((c) => (hay ? `${c.name} ${c.city}`.toLowerCase().includes(hay) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, q]);

  return (
    <section className="section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Centres & formations</h1>
          <p className="text-slate-600">Supervision globale des centres, formations et sessions.</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un centre…"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
        />
      </div>

      <div className="mt-4">
        {loading ? <ListSkeleton /> : filtered.length === 0 ? <EmptyState /> : (
          <ul className="grid gap-2">
            {filtered.map((c) => (
              <li key={c.id} className="soft-card p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-slate-600">{c.city ?? "—"}</div>
                  <div className="mt-1 text-sm text-slate-700 flex gap-3">
                    <span>🎓 {c.trainings} formations</span>
                    <span>🗓 {c.sessions} sessions</span>
                    <span>👥 {c.learners} apprenants</span>
                    <span>✅ {c.published} publiées</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/pro/centre/formations" className="pill pill-ghost">Voir formations</Link>
                  <button className="pill pill-muted" onClick={() => alert("Masquer du répertoire (mock)")}>Masquer</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ListSkeleton() {
  return (
    <ul className="grid gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="soft-card p-3 animate-pulse">
          <div className="h-4 w-1/3 bg-slate-200 rounded" />
          <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="text-lg font-semibold">Aucun centre</h3>
      <p className="text-slate-600 mt-1">Aucun centre détecté pour l’instant.</p>
    </div>
  );
}

function useAdminCenters() {
  const [data, setData] = useState<Center[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/centers", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const json = await r.json();
        if (!cancel) setData(json?.centers ?? []);
      } catch {
        if (!cancel) setData(MOCK_CENTERS);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);
  return { data, loading };
}

const MOCK_CENTERS: Center[] = [
  { id: "c1", name: "FormaZen", city: "Lyon", trainings: 12, sessions: 24, learners: 310, published: 9 },
  { id: "c2", name: "École Kobido", city: "Paris", trainings: 6, sessions: 14, learners: 160, published: 6 },
  { id: "c3", name: "AromaLab", city: "Bordeaux", trainings: 8, sessions: 10, learners: 120, published: 5 },
];
