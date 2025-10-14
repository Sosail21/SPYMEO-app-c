// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PeriodKey = "7D" | "30D" | "90D" | "YTD" | "CUSTOM";

type Kpis = { revenueTTC: number; learners: number; sessions: number; fillRatePct: number };
type TopTraining = { slug: string; title: string; revenueTTC: number; enrolled: number; sessions: number };
type TimeBucket = { label: string; value: number };
type StatsPayload = {
  period: { from: string; to: string };
  kpis: Kpis;
  trendRevenue: TimeBucket[];
  trendLearners: TimeBucket[];
  topTrainings: TopTraining[];
};

export default function StatsCentrePage() {
  const [period, setPeriod] = useState<PeriodKey>("30D");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [data, setData] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("preset", period);
        if (period === "CUSTOM" && from && to) {
          params.set("from", from);
          params.set("to", to);
        }
        const r = await fetch(`/api/center/stats?${params.toString()}`, { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setData(json as StatsPayload);
      } catch {
        if (!cancel) setData(makeMock(period, from, to));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [period, from, to]);

  const k = data?.kpis;
  const revMax = Math.max(...(data?.trendRevenue.map(b => b.value) ?? [1]));
  const leaMax = Math.max(...(data?.trendLearners.map(b => b.value) ?? [1]));

  function exportCsv() {
    if (!data) return;
    const rows = [
      ["Période", data.period.from, data.period.to], [],
      ["KPI","Valeur"],
      ["CA TTC (€)", k?.revenueTTC ?? 0],
      ["Apprenants", k?.learners ?? 0],
      ["Sessions", k?.sessions ?? 0],
      ["Taux remplissage (%)", k?.fillRatePct ?? 0], [],
      ["Top formations"],
      ["Titre","Slug","CA TTC (€)","Inscrits","Sessions"],
      ...(data.topTrainings ?? []).map(t => [t.title, t.slug, t.revenueTTC, t.enrolled, t.sessions]),
    ];
    const content = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `spymeo-stats-${data.period.from}_${data.period.to}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* Header compact */}
      <section className="section">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Statistiques</h1>
            <p className="text-slate-600 text-sm">Vue d’ensemble : revenus, volumes et performance par formation.</p>
          </div>
          <button className="pill pill-ghost" onClick={exportCsv}>Exporter CSV</button>
        </div>
      </section>

      {/* Filtres période */}
      <section className="section">
        <div className="soft-card p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <nav className="chips-row">
            {(["7D","30D","90D","YTD","CUSTOM"] as const).map(p => (
              <button key={p} type="button" className={"chip " + (period===p ? "chip-active" : "")} onClick={()=>setPeriod(p)}>
                {labelPeriod(p)}
              </button>
            ))}
          </nav>
          {period === "CUSTOM" && (
            <div className="flex items-center gap-2">
              <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="rounded-xl border px-3 py-2" />
              <span className="text-slate-500">→</span>
              <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="rounded-xl border px-3 py-2" />
            </div>
          )}
        </div>
      </section>

      {/* KPIs */}
      <section className="section">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="soft-card p-3 h-20 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <KpiCard label="CA TTC" value={fmtCurrency(k?.revenueTTC ?? 0)} />
            <KpiCard label="Apprenants" value={`${k?.learners ?? 0}`} />
            <KpiCard label="Taux de remplissage" value={`${Math.round(k?.fillRatePct ?? 0)} %`} />
            <KpiCard label="Sessions" value={`${k?.sessions ?? 0}`} />
          </div>
        )}
      </section>

      {/* Tendances */}
      <section className="section">
        <div className="grid md:grid-cols-2 gap-2">
          <div className="soft-card p-3">
            <h3 className="font-semibold mb-2">Tendance CA</h3>
            <MiniBars data={data?.trendRevenue ?? []} max={revMax} />
          </div>
          <div className="soft-card p-3">
            <h3 className="font-semibold mb-2">Tendance Apprenants</h3>
            <MiniBars data={data?.trendLearners ?? []} max={leaMax} />
          </div>
        </div>
      </section>

      {/* Top formations */}
      <section className="section">
        <div className="soft-card p-0 overflow-hidden">
          <div className="p-3 flex items-center justify-between">
            <h3 className="font-semibold">Top formations</h3>
            <Link href="/pro/centre/formations" className="pill pill-ghost">Voir toutes</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#edf4f6] text-[#0b1239]">
              <tr>
                <Th>Formation</Th>
                <Th className="text-right">CA TTC</Th>
                <Th className="text-right">Inscrits</Th>
                <Th className="text-right">Sessions</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {(data?.topTrainings ?? []).map((t) => (
                <tr key={t.slug} className="border-t">
                  <Td>
                    <Link href={`/pro/centre/formations/${t.slug}`} className="font-medium hover:underline">
                      {t.title}
                    </Link>
                  </Td>
                  <Td className="text-right">{fmtCurrency(t.revenueTTC)}</Td>
                  <Td className="text-right">{t.enrolled}</Td>
                  <Td className="text-right">{t.sessions}</Td>
                  <Td className="text-right">
                    <Link href={`/pro/centre/formations/${t.slug}`} className="pill pill-ghost">Détails</Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

/* UI helpers compact */
function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="soft-card p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
function MiniBars({ data, max }: { data: TimeBucket[]; max: number }) {
  if (!data?.length) return <div className="text-slate-500 text-sm">Aucune donnée.</div>;
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((b, i) => {
        const pct = max ? Math.max(4, Math.round((b.value / max) * 100)) : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-[#cfe5ea] rounded-t-md" style={{ height: `${pct}%` }} />
            <div className="text-[10px] mt-1 text-slate-500">{b.label}</div>
          </div>
        );
      })}
    </div>
  );
}
function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`text-left px-4 py-2 font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2 ${className}`}>{children}</td>;
}
function labelPeriod(p: PeriodKey) {
  switch (p) {
    case "7D": return "7 jours";
    case "30D": return "30 jours";
    case "90D": return "90 jours";
    case "YTD": return "Depuis le 1er janv.";
    case "CUSTOM": return "Personnalisé";
  }
}
function fmtCurrency(v: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}
/* MOCK */
function makeMock(preset: PeriodKey, from?: string, to?: string): StatsPayload {
  const today = new Date();
  const buckets = 10;
  const trendRevenue = Array.from({ length: buckets }).map((_, i) => ({ label: `S${i+1}`, value: 1500 + Math.round(Math.random()*5000) }));
  const trendLearners = Array.from({ length: buckets }).map((_, i) => ({ label: `S${i+1}`, value: 5 + Math.round(Math.random()*18) }));
  return {
    period: { from: (from || new Date(today.getFullYear(),0,1).toISOString().slice(0,10)), to: (to || today.toISOString().slice(0,10)) },
    kpis: { revenueTTC: trendRevenue.reduce((a,b)=>a+b.value,0), learners: trendLearners.reduce((a,b)=>a+b.value,0), sessions: 22, fillRatePct: 78 },
    trendRevenue, trendLearners,
    topTrainings: [
      { slug: "reflexologie-plantaire-initiation", title: "Réflexologie plantaire — initiation", revenueTTC: 12450, enrolled: 64, sessions: 6 },
      { slug: "kobido-fondamentaux-posture", title: "Kobido — fondamentaux & posture", revenueTTC: 8200, enrolled: 31, sessions: 4 },
      { slug: "ethique-cadre-pro-cabinet-liberal", title: "Éthique & cadre pro", revenueTTC: 0, enrolled: 76, sessions: 2 },
    ],
  };
}
