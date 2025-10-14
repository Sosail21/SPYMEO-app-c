// Cdw-Spm
"use client";

import KpiCard from "./KpiCard";
import StatsCharts from "./StatsCharts";

export default function StatsShell({ stats }: { stats: any }) {
  if (!stats) return <div>Aucune donnée disponible</div>;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.kpis.map((k: any, i: number) => (
          <KpiCard key={i} label={k.label} value={k.value} />
        ))}
      </div>
      <StatsCharts data={stats.charts} />
    </div>
  );
}
