"use client";

import { useEffect, useState, useMemo } from "react";
import KpiCard from "@/components/stats/KpiCard";
import StatsCharts from "@/components/stats/StatsCharts";

type Range = "week" | "month" | "year";

export default function StatsPageClient() {
  const [range, setRange] = useState<Range>("week");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/stats?range=${range}`).then(r => r.json()).then(setStats).catch(() => {});
  }, [range]);

  const kpis = useMemo(() => stats?.kpis ?? [], [stats]);
  const charts = useMemo(() => stats?.charts ?? {}, [stats]);

  return (
    <main className="section">
      <div className="container-spy grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Statistiques</h1>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="border rounded p-1 text-sm"
          >
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="year">Année</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((k: any, i: number) => (
            <KpiCard key={i} label={k.label} value={k.value} />
          ))}
        </div>

        <StatsCharts data={charts} />
      </div>
    </main>
  );
}
