// Cdw-Spm
// src/app/admin/pass/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PassPlan = "MONTHLY" | "ANNUAL";
type Shipment = "NOT_ELIGIBLE" | "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";

type Snapshot = {
  userId: string;
  name: string;
  email: string;
  active: boolean;
  plan: PassPlan;
  monthsPaid: number;
  carnet: { status: Shipment; eta?: string };
};

export default function AdminPassPage() {
  const { data, loading } = useAdminPass();
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const filtered = useMemo(() => {
    const hay = q.toLowerCase();
    return (data ?? [])
      .filter((s) => (onlyActive ? s.active : true))
      .filter((s) => (hay ? `${s.name} ${s.email}`.toLowerCase().includes(hay) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, q, onlyActive]);

  return (
    <section className="section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">PASS</h1>
          <p className="text-slate-600">Snapshots, envois carnet, ressources mensuelles (mock).</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher…"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
          />
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Actifs uniquement
          </label>
          <button className="pill pill-ghost" onClick={() => alert("Ajouter ressource (mock)")}>+ Ajouter ressource (mock)</button>
        </div>
      </div>

      <div className="mt-4">
        {loading ? <ListSkeleton /> : filtered.length === 0 ? <EmptyState /> : (
          <ul className="grid gap-2">
            {filtered.map((s) => (
              <li key={s.userId} className="soft-card p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-sm text-slate-600">{s.email}</div>
                  <div className="mt-1 text-sm text-slate-700 flex flex-wrap gap-3">
                    <span>Plan : {s.plan === "ANNUAL" ? "Annuel" : "Mensuel"}</span>
                    <span>Mois payés : {s.monthsPaid}</span>
                    <span className={`pill ${s.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                      {s.active ? "Actif" : "Inactif"}
                    </span>
                    <span className="pill bg-sky-100 text-sky-700">Carnet : {labelShip(s.carnet.status)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="pill pill-muted" onClick={() => alert("Toggle plan (mock)")}>Basculer plan</button>
                  <button className="pill pill-muted" onClick={() => alert("Avancer carnet (mock)")}>Avancer carnet</button>
                  <button className="pill pill-muted" onClick={() => alert("Envoyer ressource (mock)")}>Envoyer ressource</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function labelShip(s: Shipment) {
  switch (s) {
    case "NOT_ELIGIBLE": return "Non éligible";
    case "PENDING": return "En attente";
    case "PROCESSING": return "En préparation";
    case "SHIPPED": return "Expédié";
    case "DELIVERED": return "Distribué";
  }
}

function ListSkeleton() {
  return (
    <ul className="grid gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
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
      <h3 className="text-lg font-semibold">Aucun abonné PASS</h3>
      <p className="text-slate-600 mt-1">Les abonnés PASS apparaîtront ici.</p>
    </div>
  );
}

function useAdminPass() {
  const [data, setData] = useState<Snapshot[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/pass/snapshots", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const json = await r.json();
        if (!cancel) setData(json?.snapshots ?? []);
      } catch {
        if (!cancel) setData(MOCK_SNAPSHOTS);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);
  return { data, loading };
}

const MOCK_SNAPSHOTS: Snapshot[] = [
  { userId: "u1", name: "Alice Martin", email: "alice@ex.com", active: true, plan: "MONTHLY", monthsPaid: 3, carnet: { status: "PENDING" } },
  { userId: "u2", name: "Bob Durand", email: "bob@ex.com", active: false, plan: "ANNUAL", monthsPaid: 0, carnet: { status: "NOT_ELIGIBLE" } },
  { userId: "u3", name: "Carla Dubois", email: "carla@ex.com", active: true, plan: "ANNUAL", monthsPaid: 8, carnet: { status: "SHIPPED" } },
];
