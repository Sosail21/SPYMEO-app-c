// Cdw-Spm
"use client";

import { useEffect, useState } from "react";
import { MOCK_STATS_COMMERCANT, ShopStats } from "@/lib/mockdb/stats-commercant";

export default function StatsShopPage() {
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/merchant/stats?range=30d", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setStats(json?.stats ?? null);
      } catch {
        if (!cancel) setStats(MOCK_STATS_COMMERCANT);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <h1 className="text-2xl font-semibold text-[#0b1239]">Statistiques (shop)</h1>
        <p className="text-slate-600 text-sm">CA, panier moyen, top produits…</p>
      </section>

      <section className="section">
        {loading || !stats ? (
          <div className="soft-card p-4 animate-pulse"><div className="h-4 w-1/3 bg-slate-200 rounded" /></div>
        ) : (
          <div className="grid md:grid-cols-4 gap-3">
            <Kpi label="CA TTC" value={fmtCurrency(stats.kpis.revenueTTC)} />
            <Kpi label="Commandes" value={stats.kpis.ordersCount.toString()} />
            <Kpi label="Panier moyen" value={fmtCurrency(stats.kpis.avgBasket)} />
            <Kpi label="Clients récurrents" value={`${stats.kpis.returningRate}%`} />
          </div>
        )}
      </section>

      {/* Top produits simple (liste) */}
      <section className="section">
        {loading || !stats ? (
          <div className="soft-card p-4 animate-pulse"><div className="h-4 w-1/2 bg-slate-200 rounded" /></div>
        ) : (
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th>Produit</Th>
                  <Th>Qté</Th>
                  <Th>CA</Th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p) => (
                  <tr key={p.productId} className="border-t">
                    <Td>{p.title}</Td>
                    <Td>{p.qty}</Td>
                    <Td>{fmtCurrency(p.revenue)}</Td>
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

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="soft-card p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}
function fmtCurrency(v: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}
