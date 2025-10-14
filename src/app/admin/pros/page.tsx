// Cdw-Spm
// src/app/admin/pros/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type ProRole = "PRACTITIONER" | "COMMERCANT" | "ARTISAN" | "CENTER";
type Pro = { id: string; name: string; city?: string; role: ProRole; visible?: boolean; validated?: boolean };

export default function AdminProsPage() {
  const { data, loading } = useAdminPros();
  const [role, setRole] = useState<ProRole | "ALL">("ALL");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const hay = q.toLowerCase();
    return (data ?? [])
      .filter((p) => (role === "ALL" ? true : p.role === role))
      .filter((p) => (hay ? `${p.name} ${p.city}`.toLowerCase().includes(hay) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, role, q]);

  return (
    <section className="section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Pros</h1>
          <p className="text-slate-600">Validation des fiches & visibilité dans le répertoire public.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="PRACTITIONER">Praticiens</option>
            <option value="COMMERCANT">Commerçants</option>
            <option value="ARTISAN">Artisans</option>
            <option value="CENTER">Centres</option>
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher…"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
          />
        </div>
      </div>

      <div className="mt-4">
        {loading ? <ListSkeleton /> : filtered.length === 0 ? <EmptyState /> : (
          <ul className="grid gap-2">
            {filtered.map((p) => (
              <li key={p.id} className="soft-card p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-slate-600">{labelRole(p.role)} · {p.city ?? "—"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`pill ${p.validated ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.validated ? "Validé" : "En attente"}
                  </span>
                  <span className={`pill ${p.visible ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-700"}`}>
                    {p.visible ? "Visible" : "Masqué"}
                  </span>
                  <button className="pill pill-muted" onClick={() => alert("Valider (mock)")}>Valider</button>
                  <button className="pill pill-muted" onClick={() => alert("Basculer visibilité (mock)")}>Basculer</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function labelRole(r: ProRole) {
  return r === "PRACTITIONER" ? "Praticien" : r === "COMMERCANT" ? "Commerçant" : r === "ARTISAN" ? "Artisan" : "Centre";
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
      <h3 className="text-lg font-semibold">Aucun pro</h3>
      <p className="text-slate-600 mt-1">Aucun professionnel trouvé.</p>
    </div>
  );
}

function useAdminPros() {
  const [data, setData] = useState<Pro[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/pros", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const json = await r.json();
        if (!cancel) setData(json?.pros ?? []);
      } catch {
        if (!cancel) setData(MOCK_PROS);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);
  return { data, loading };
}

const MOCK_PROS: Pro[] = [
  { id: "p1", name: "Léa Roche", role: "PRACTITIONER", city: "Nantes", validated: true, visible: true },
  { id: "p2", name: "ÉcoBoutique", role: "COMMERCANT", city: "Rennes", validated: true, visible: true },
  { id: "p3", name: "Atelier Bois", role: "ARTISAN", city: "Lille", validated: false, visible: false },
  { id: "p4", name: "FormaZen", role: "CENTER", city: "Lyon", validated: true, visible: true },
];
