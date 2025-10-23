// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  PreComptaEntry,
  EntryType,
} from "@/types/precompta-commercant";

const TABS: { key: "ALL" | EntryType; label: string }[] = [
  { key: "ALL", label: "Tous" },
  { key: "SALE", label: "Ventes" },
  { key: "REFUND", label: "Remboursements" },
  { key: "ADJUSTMENT", label: "Ajustements" },
];

export default function PreComptaShopPage() {
  const [rows, setRows] = useState<PreComptaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | EntryType>("ALL");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/merchant/precompta", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setRows(json?.entries ?? []);
      } catch {
        if (!cancel) setRows([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const filtered = useMemo(() => {
    return rows
      .filter((e) => (tab === "ALL" ? true : e.type === tab))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [rows, tab]);

  const total = filtered.reduce((acc, e) => acc + e.amountTTC, 0);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Pré-compta (shop)</h1>
            <p className="text-slate-600 text-sm">Encaissements & exports.</p>
          </div>
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
        </div>
      </section>

      <section className="section">
        {loading ? (
          <div className="soft-card p-4 animate-pulse"><div className="h-4 w-1/3 bg-slate-200 rounded" /></div>
        ) : filtered.length === 0 ? (
          <div className="soft-card p-8 text-center">Aucune écriture.</div>
        ) : (
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th>Date</Th>
                  <Th>Libellé</Th>
                  <Th>Type</Th>
                  <Th>Montant TTC</Th>
                  <Th>TVA</Th>
                  <Th>Paiement</Th>
                  <Th>Commande</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-t">
                    <Td>{fmtDate(e.date)}</Td>
                    <Td>{e.label}</Td>
                    <Td>{labelType(e.type)}</Td>
                    <Td className={e.amountTTC < 0 ? "text-amber-700" : "text-emerald-700"}>
                      {e.amountTTC.toFixed(2)} €
                    </Td>
                    <Td>{e.vatRate != null ? `${e.vatRate}%` : "—"}</Td>
                    <Td>{e.paymentMethod ?? "—"}</Td>
                    <Td>{e.orderId ?? "—"}</Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-[#f9fcfe]">
                  <td className="px-4 py-3 font-semibold" colSpan={3}>Total période</td>
                  <td className={`px-4 py-3 font-semibold ${total < 0 ? "text-amber-700" : "text-emerald-700"}`}>
                    {total.toFixed(2)} €
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
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
function labelType(t: EntryType) {
  switch (t) {
    case "SALE": return "Vente";
    case "REFUND": return "Remboursement";
    case "ADJUSTMENT": return "Ajustement";
  }
}
