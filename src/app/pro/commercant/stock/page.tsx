// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  StockMovement,
  StockMovementType,
} from "@/types/stock-commercant";

const TABS: { key: "ALL" | StockMovementType; label: string }[] = [
  { key: "ALL", label: "Tous" },
  { key: "IN", label: "Entrées" },
  { key: "OUT", label: "Sorties" },
  { key: "ADJUSTMENT", label: "Ajustements" },
];

export default function StockPage() {
  const [data, setData] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | StockMovementType>("ALL");
  const [q, setQ] = useState("");

  const searchParams = useSearchParams();
  const skuPrefilter = searchParams.get("sku")?.trim();

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/merchant/stock", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setData(json?.movements ?? []);
      } catch {
        if (!cancel) setData([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  // On applique le préfiltre SKU (si fourni) en priorité au champ de recherche
  useEffect(() => {
    if (skuPrefilter && !q) setQ(skuPrefilter);
  }, [skuPrefilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return data
      .filter((m) => (tab === "ALL" ? true : m.type === tab))
      .filter((m) => {
        if (!q.trim()) return true;
        const hay = `${m.productName} ${m.ref ?? ""}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data, tab, q]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Stock</h1>
            <p className="text-slate-600 text-sm">Mouvements, seuils d’alerte, réassort.</p>
          </div>
          <div className="flex items-center gap-2">
            <nav className="chips-row my-0">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={"chip " + (tab === t.key ? "chip-active" : "")}
                  onClick={() => setTab(t.key as any)}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Recherche produit/référence…"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
            />
          </div>
        </div>
      </section>

      <section className="section">
        {loading ? (
          <div className="soft-card p-4 animate-pulse"><div className="h-4 w-1/3 bg-slate-200 rounded" /></div>
        ) : filtered.length === 0 ? (
          <div className="soft-card p-8 text-center">Aucun mouvement.</div>
        ) : (
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th>Date</Th>
                  <Th>Produit</Th>
                  <Th>Type</Th>
                  <Th>Quantité</Th>
                  <Th>Référence</Th>
                  <Th>Motif</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-t">
                    <Td>{fmtDate(m.date)}</Td>
                    <Td>{m.productName}</Td>
                    <Td>{labelType(m.type)}</Td>
                    <Td className={m.quantity < 0 ? "text-amber-700" : "text-emerald-700"}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </Td>
                    <Td>{m.ref ?? "—"}</Td>
                    <Td>{m.reason ?? "—"}</Td>
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
function Td({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return <td className={`px-4 py-3 ${className || ""}`} colSpan={colSpan}>{children}</td>;
}
function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch { return iso; }
}
function labelType(t: StockMovementType) {
  switch (t) {
    case "IN": return "Entrée";
    case "OUT": return "Sortie";
    case "ADJUSTMENT": return "Ajustement";
  }
}
