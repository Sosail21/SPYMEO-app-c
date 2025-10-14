// Cdw-Spm
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  MOCK_ORDERS_COMMERCANT,
  type OrderDetail,
  type OrderStatus,
} from "@/lib/mockdb/orders-commercant";

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch(`/api/merchant/orders/${id}`, { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setOrder(json?.order ?? null);
      } catch {
        if (!cancel) setOrder(MOCK_ORDERS_COMMERCANT.find((o) => o.id === id) ?? null);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  if (!loading && !order) {
    notFound();
  }

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* Fil d’Ariane */}
      <section className="section">
        <nav className="text-sm text-slate-600">
          <Link href="/pro/commercants/commandes" className="hover:underline">Commandes</Link>
          <span> / </span>
          <span>Commande {order?.id ?? id}</span>
        </nav>
      </section>

      {/* Header */}
      <section className="section">
        <div className="soft-card p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-[#0b1239]">Commande {order?.id ?? id}</h1>
              {order && (
                <p className="text-slate-600">Passée le {fmtDate(order.date)} • Montant total : {order.amount.toFixed(2)} €</p>
              )}
            </div>
            {order && <StatusBadge status={order.status} />}
          </div>
          {order && (
            <div className="mt-4 flex gap-2">
              {order.status === "PENDING" && (
                <button className="btn" onClick={() => alert("Marquer comme payée (à implémenter)")}>
                  Marquer comme payée
                </button>
              )}
              {order.status === "PAID" && (
                <button className="btn" onClick={() => alert("Expédier la commande (à implémenter)")}>
                  Expédier
                </button>
              )}
              {order.status !== "CANCELLED" && (
                <button className="pill pill-muted" onClick={() => alert("Annuler la commande (à implémenter)")}>
                  Annuler
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Client */}
      {order && (
        <section className="section">
          <div className="soft-card p-4">
            <h2 className="font-semibold text-lg">Client</h2>
            <p className="mt-1 text-slate-700">{order.customer}</p>
            <p className="text-slate-600 text-sm">{order.email}</p>
            {order.phone && <p className="text-slate-600 text-sm">{order.phone}</p>}
          </div>
        </section>
      )}

      {/* Produits */}
      {order && (
        <section className="section">
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th>Produit</Th>
                  <Th>Quantité</Th>
                  <Th>Prix unitaire</Th>
                  <Th>Total</Th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, i) => (
                  <tr key={i} className="border-t">
                    <Td>{it.name}</Td>
                    <Td>{it.qty}</Td>
                    <Td>{it.price.toFixed(2)} €</Td>
                    <Td>{(it.qty * it.price).toFixed(2)} €</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
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
