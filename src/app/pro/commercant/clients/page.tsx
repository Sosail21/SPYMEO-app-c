"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MOCK_CLIENTS_COMMERCANT,
  type Client,
} from "@/lib/mockdb/clients-commercant";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/merchant/clients", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setClients(json?.clients ?? []);
      } catch {
        if (!cancel) setClients(MOCK_CLIENTS_COMMERCANT);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const filtered = useMemo(() => {
    return clients
      .filter(c => {
        if (!q.trim()) return true;
        const hay = `${c.name} ${c.email}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a,b)=>a.name.localeCompare(b.name));
  }, [clients, q]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Clients</h1>
            <p className="text-slate-600 text-sm">Fiches client, historique achats, relances.</p>
          </div>
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Rechercher un client…"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
          />
        </div>
      </section>

      <section className="section">
        {loading ? (
          <div className="soft-card p-4 animate-pulse h-16" />
        ) : filtered.length === 0 ? (
          <div className="soft-card p-8 text-center">Aucun client.</div>
        ) : (
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th>Nom</Th>
                  <Th>Email</Th>
                  <Th>Cmd</Th>
                  <Th>Dépensé</Th>
                  <Th>Dernière commande</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t">
                    <Td>{c.name}</Td>
                    <Td>{c.email}</Td>
                    <Td>{c.ordersCount}</Td>
                    <Td>{c.totalSpent.toFixed(2)} €</Td>
                    <Td>{c.lastOrderAt ? fmtDate(c.lastOrderAt) : "—"}</Td>
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
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}
function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" }); }
  catch { return iso; }
}
