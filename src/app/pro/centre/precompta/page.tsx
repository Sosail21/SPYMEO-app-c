"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PeriodKey = "30D" | "90D" | "YTD" | "CUSTOM";
type PayMethod = "CB" | "SEPA" | "ESPECES" | "VIREMENT";
type PayStatus = "PAID" | "PENDING" | "REFUNDED" | "CANCELLED";

type Entry = {
  id: string;
  date: string; // ISO
  sessionId: string;
  trainingTitle: string;
  trainingSlug?: string;
  learnerName: string;
  learnerEmail: string;
  amountTTC: number;
  method: PayMethod;
  status: PayStatus;
};
type PreComptaPayload = { period: { from: string; to: string }; entries: Entry[] };

export default function PreComptaCentrePage() {
  const [period, setPeriod] = useState<PeriodKey>("30D");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<PayStatus | "ALL">("ALL");
  const [method, setMethod] = useState<PayMethod | "ALL">("ALL");
  const [q, setQ] = useState("");
  const [data, setData] = useState<PreComptaPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("preset", period);
        if (period === "CUSTOM" && from && to) { params.set("from", from); params.set("to", to); }
        if (status !== "ALL") params.set("status", status);
        if (method !== "ALL") params.set("method", method);
        const r = await fetch(`/api/center/precompta?${params.toString()}`, { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setData(json as PreComptaPayload);
      } catch {
        if (!cancel) setData(makeMockPrecompta());
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [period, from, to, status, method]);

  const filtered = useMemo(() => {
    const list = data?.entries ?? [];
    return list
      .filter(e => (status === "ALL" ? true : e.status === status))
      .filter(e => (method === "ALL" ? true : e.method === method))
      .filter(e => {
        if (!q.trim()) return true;
        const hay = `${e.trainingTitle} ${e.learnerName} ${e.learnerEmail}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data, status, method, q]);

  const totals = useMemo(() => {
    const ttc = filtered.reduce((a,b)=>a+b.amountTTC,0);
    const encaisse = filtered.filter(e=>e.status==="PAID").reduce((a,b)=>a+b.amountTTC,0);
    const attente = filtered.filter(e=>e.status==="PENDING").reduce((a,b)=>a+b.amountTTC,0);
    return { ttc, encaisse, attente };
  }, [filtered]);

  function exportCsv() {
    const rows = [
      ["date","formation","apprenant","email","montant_ttc","moyen","statut","sessionId"],
      ...filtered.map(e => [e.date, e.trainingTitle, e.learnerName, e.learnerEmail, e.amountTTC, e.method, e.status, e.sessionId]),
    ];
    const content = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `spymeo-precompta-${(data?.period.from||"")}_${(data?.period.to||"")}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* Header compact */}
      <section className="section">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Pré-compta</h1>
            <p className="text-slate-600 text-sm">Encaissements & relances, prêts à exporter vers ton outil comptable.</p>
          </div>
          <button className="pill pill-ghost" onClick={exportCsv}>Exporter CSV</button>
        </div>
      </section>

      {/* Filtres */}
      <section className="section">
        <div className="soft-card p-3 grid md:grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <nav className="chips-row">
              {(["30D","90D","YTD","CUSTOM"] as const).map(p => (
                <button key={p} className={"chip " + (period===p?"chip-active":"")} onClick={()=>setPeriod(p)}>
                  {labelPeriod(p)}
                </button>
              ))}
            </nav>
            {period === "CUSTOM" && (
              <>
                <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="rounded-xl border px-3 py-2" />
                <span className="text-slate-500">→</span>
                <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="rounded-xl border px-3 py-2" />
              </>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="rounded-xl border px-3 py-2">
              <option value="ALL">Tous statuts</option>
              <option value="PAID">Payé</option>
              <option value="PENDING">En attente</option>
              <option value="REFUNDED">Remboursé</option>
              <option value="CANCELLED">Annulé</option>
            </select>
            <select value={method} onChange={(e)=>setMethod(e.target.value as any)} className="rounded-xl border px-3 py-2">
              <option value="ALL">Tous moyens</option>
              <option value="CB">CB</option>
              <option value="SEPA">SEPA</option>
              <option value="VIREMENT">Virement</option>
              <option value="ESPECES">Espèces</option>
            </select>
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Rechercher…" className="rounded-xl border px-3 py-2 text-sm w-48" />
          </div>
        </div>
      </section>

      {/* Totaux période */}
      <section className="section">
        <div className="grid sm:grid-cols-3 gap-2">
          <div className="soft-card p-3">
            <div className="text-xs text-slate-500">CA TTC (filtré)</div>
            <div className="text-lg font-semibold mt-1">{fmtCurrency(totals.ttc)}</div>
          </div>
          <div className="soft-card p-3">
            <div className="text-xs text-slate-500">Encaissé</div>
            <div className="text-lg font-semibold mt-1">{fmtCurrency(totals.encaisse)}</div>
          </div>
          <div className="soft-card p-3">
            <div className="text-xs text-slate-500">En attente</div>
            <div className="text-lg font-semibold mt-1">{fmtCurrency(totals.attente)}</div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="section">
        {loading ? (
          <div className="soft-card p-3 h-20 animate-pulse" />
        ) : (
          <div className="soft-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#edf4f6] text-[#0b1239]">
                <tr>
                  <Th>Date</Th>
                  <Th>Formation</Th>
                  <Th>Apprenant</Th>
                  <Th>Moyen</Th>
                  <Th className="text-right">Montant TTC</Th>
                  <Th>Statut</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {(filtered).map((e) => (
                  <tr key={e.id} className="border-t">
                    <Td>{fmtDate(e.date)}</Td>
                    <Td>
                      <div className="flex flex-col">
                        <span className="font-medium">{e.trainingTitle}</span>
                        {e.trainingSlug && (
                          <Link href={`/pro/centre/formations/${e.trainingSlug}`} className="text-slate-500 hover:underline">
                            Fiche formation
                          </Link>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-col">
                        <span>{e.learnerName}</span>
                        <span className="text-slate-500">{e.learnerEmail}</span>
                      </div>
                    </Td>
                    <Td>{labelMethod(e.method)}</Td>
                    <Td className="text-right">{fmtCurrency(e.amountTTC)}</Td>
                    <Td><StatusBadge status={e.status} /></Td>
                    <Td className="text-right">
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Link href={`/pro/centre/formations/sessions/${e.sessionId}`} className="pill pill-ghost">Voir session</Link>
                        {e.status === "PENDING" && (
                          <button className="pill pill-muted" onClick={() => alert("Relance paiement (à implémenter)")}>
                            Relancer
                          </button>
                        )}
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

/* UI helpers */
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left px-4 py-2 font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2 ${className}`}>{children}</td>;
}
function StatusBadge({ status }: { status: PayStatus }) {
  const map: Record<PayStatus, { label: string; cls: string }> = {
    PAID: { label: "Payé", cls: "bg-emerald-100 text-emerald-700" },
    PENDING: { label: "En attente", cls: "bg-amber-100 text-amber-700" },
    REFUNDED: { label: "Remboursé", cls: "bg-slate-100 text-slate-700" },
    CANCELLED: { label: "Annulé", cls: "bg-slate-200 text-slate-600" },
  };
  const it = map[status];
  return <span className={`pill ${it.cls}`}>{it.label}</span>;
}
function labelMethod(m: PayMethod) {
  switch (m) { case "CB": return "CB"; case "SEPA": return "SEPA"; case "VIREMENT": return "Virement"; case "ESPECES": return "Espèces"; }
}
function labelPeriod(p: PeriodKey) {
  switch (p) { case "30D": return "30 jours"; case "90D": return "90 jours"; case "YTD": return "Depuis le 1er janv."; case "CUSTOM": return "Perso."; }
}
function fmtCurrency(v: number) { return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(v); }
function fmtDate(iso: string) { try { return new Date(iso).toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"}); } catch { return iso; } }

/* MOCK */
function makeMockPrecompta(): PreComptaPayload {
  const today = new Date(); const toISO = (d: Date) => d.toISOString().slice(0,10);
  const entries: Entry[] = [
    { id: "e1", date: toISO(today), sessionId: "s1", trainingTitle: "Réflexologie — initiation", trainingSlug: "reflexologie-plantaire-initiation", learnerName: "Alice Martin", learnerEmail: "alice@example.com", amountTTC: 190, method: "CB", status: "PAID" },
    { id: "e2", date: toISO(addDays(today,-2)), sessionId: "s1", trainingTitle: "Réflexologie — initiation", trainingSlug: "reflexologie-plantaire-initiation", learnerName: "Marc Dupont", learnerEmail: "marc@example.com", amountTTC: 190, method: "SEPA", status: "PENDING" },
    { id: "e3", date: toISO(addDays(today,-7)), sessionId: "s2", trainingTitle: "Kobido — fondamentaux", trainingSlug: "kobido-fondamentaux-posture", learnerName: "Chloé Martin", learnerEmail: "chloe@example.com", amountTTC: 320, method: "VIREMENT", status: "PAID" },
    { id: "e4", date: toISO(addDays(today,-10)), sessionId: "s3", trainingTitle: "Éthique & cadre pro", trainingSlug: "ethique-cadre-pro-cabinet-liberal", learnerName: "Claire Petit", learnerEmail: "claire@example.com", amountTTC: 0, method: "CB", status: "REFUNDED" },
  ];
  return { period: { from: toISO(addDays(today,-30)), to: toISO(today) }, entries };
}
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
