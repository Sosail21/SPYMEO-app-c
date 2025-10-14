// Cdw-Spm
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MOCK_ORDERS_COMMERCANT,
  type OrderDetail,
  type OrderStatus,
} from "@/lib/mockdb/orders-commercant";

const TABS: { key: "ALL" | OrderStatus; label: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "PENDING", label: "En attente" },
  { key: "PAID", label: "Payées" },
  { key: "SHIPPED", label: "Expédiées" },
  { key: "CANCELLED", label: "Annulées" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | OrderStatus>("ALL");
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/merchant/orders", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setOrders(json?.orders ?? []);
      } catch {
        if (!cancel) setOrders(MOCK_ORDERS_COMMERCANT);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const filtered = useMemo(() => {
    return (orders ?? [])
      .filter((o) => (activeTab === "ALL" ? true : o.status === activeTab))
      .filter((o) => {
        if (!q.trim()) return true;
        const hay = `${o.customer} ${o.id}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, activeTab, q]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* Header */}
      <section className="section">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Commandes</h1>
            <p className="text-slate-600 text-sm">Gérez vos ventes, suivez les paiements et expéditions.</p>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="section">
        <div className="soft-card p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <nav className="chips-row my-0">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key as any)}
                className={"chip " + (activeTab === t.key ? "chip-active" : "")}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une commande…"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
          />
        </div>
      </section>

      {/* Liste commandes */}
      <section className="section">
        {loading ? (
          <ListSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th>ID</Th>
                  <Th>Client</Th>
                  <Th>Date</Th>
                  <Th>Montant</Th>
                  <Th>Statut</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t">
                    <Td>{o.id}</Td>
                    <Td>{o.customer}</Td>
                    <Td>{fmtDate(o.date)}</Td>
                    <Td>{o.amount.toFixed(2)} €</Td>
                    <Td><StatusBadge status={o.status} /></Td>
                    <Td>
                      <div className="flex gap-2">
                        <Link href={`/pro/commercants/commandes/${o.id}`} className="pill pill-ghost">Voir</Link>
                        <button className="pill pill-muted" onClick={() => alert("Mettre à jour (à implémenter)")}>
                          Modifier
                        </button>
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

/* Helpers */
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}

function ListSkeleton() {
  return (
    <ul className="grid gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="soft-card p-4 animate-pulse">
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
      <h3 className="text-lg font-semibold">Aucune commande trouvée</h3>
      <p className="text-slate-600 mt-1">Les nouvelles commandes apparaîtront ici dès qu’un client passe une commande.</p>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; cls: string }> = {
    PENDING: { label: "En attente", cls: "bg-amber-100 text-amber-700" },
    PAID: { label: "Payée", cls: "bg-emerald-100 text-emerald-700" },
    SHIPPED: { label: "Expédiée", cls: "bg-blue-100 text-blue-700" },
    CANCELLED: { label: "Annulée", cls: "bg-slate-100 text-slate-700" },
  };
  const it = map[status];
  return <span className={`pill ${it.cls}`}>{it.label}</span>;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch { return iso; }
}
