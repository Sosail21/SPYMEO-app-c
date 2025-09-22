// src/app/pro/formations/sessions/[sessionId]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";

type Modality = "ONLINE" | "ONSITE" | "HYBRID";
type SessionStatus = "OPEN" | "CLOSED" | "CANCELLED";

type Attendee = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  paid?: boolean;
  checkedIn?: boolean;
};

type SessionDetail = {
  id: string;
  trainingSlug?: string;       // utile pour revenir à la fiche formation
  trainingTitle: string;
  modality: Modality;
  date: string;                // ISO
  seats?: number;
  enrolled?: number;
  price?: number;
  status: SessionStatus;
  description?: string;
  notes?: string;
  attendees: Attendee[];
};

export default function SessionDetailPage() {
  const { sessionId } = useParams() as { sessionId: string };
  const router = useRouter();

  const [data, setData] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"INSCRITS" | "DETAILS" | "PARAMS">("INSCRITS");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch(`/api/center/sessions/${sessionId}`, { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const json = await r.json();
        if (!cancel) setData(json?.session ?? null);
      } catch {
        if (!cancel) setData(MOCK_SESSIONS.find((s) => s.id === sessionId) ?? null);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [sessionId]);

  if (!loading && !data) notFound();

  const enrolled = data?.attendees?.length ?? 0;
  const hasCap = typeof data?.seats === "number";
  const full = hasCap ? enrolled >= (data?.seats as number) : false;

  return (
    <main className="container-spy space-y-4 compact-sections">
      {/* Fil d’ariane */}
      <section className="section">
        <nav className="text-sm text-slate-600">
          <Link href="/pro/formations" className="hover:underline">Formations</Link>
          <span> / </span>
          {data?.trainingSlug ? (
            <Link href={`/pro/formations/${data.trainingSlug}`} className="hover:underline">
              {data.trainingTitle}
            </Link>
          ) : (
            <span>{data?.trainingTitle ?? "Formation"}</span>
          )}
          <span> / </span>
          <Link href="/pro/formations/sessions" className="hover:underline">Sessions</Link>
          <span> / </span>
          <span>Session</span>
        </nav>
      </section>

      {/* En-tête session */}
      <section className="section">
        <div className="soft-card p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">
                {data?.trainingTitle || "Session"}
              </h1>
              <p className="text-slate-600">
                {data ? (
                  <>
                    {fmtDate(data.date)} • {labelModality(data.modality)} •{" "}
                    {hasCap ? `${enrolled}/${data.seats} inscrits` : `${enrolled} inscrit${enrolled > 1 ? "s" : ""}`}
                  </>
                ) : "—"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data && <StatusBadge status={data.status} />}
              {full && <span className="pill bg-amber-100 text-amber-700" title="Capacité atteinte">Complet</span>}
              <button className="pill pill-ghost" onClick={() => alert("Exporter (à implémenter)")}>Exporter</button>
              {data?.trainingSlug && (
                <Link href={`/formations/${data.trainingSlug}`} target="_blank" className="pill pill-muted">
                  Aperçu public
                </Link>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          {!loading && data && (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.status !== "CANCELLED" && (
                <>
                  {data.status === "OPEN" ? (
                    <button className="btn btn-outline" onClick={() => alert("Fermer les inscriptions (à implémenter)")}>
                      Fermer les inscriptions
                    </button>
                  ) : (
                    <button className="btn" onClick={() => alert("Ouvrir les inscriptions (à implémenter)")}>
                      Ouvrir les inscriptions
                    </button>
                  )}
                  <button className="pill pill-muted" onClick={() => alert("Annuler la session (à implémenter)")}>
                    Annuler
                  </button>
                </>
              )}
              {data.status === "CANCELLED" && (
                <button className="btn" onClick={() => alert("Restaurer la session (à implémenter)")}>
                  Restaurer
                </button>
              )}
              <Link href={`/pro/apprenants/nouveau?sessionId=${data.id}`} className="pill pill-ghost">
                + Inscrire un apprenant
              </Link>
              <button className="pill pill-ghost" onClick={() => alert("Contacter les inscrits (à implémenter)")}>
                Contacter les inscrits
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Onglets */}
      <section className="section">
        <div className="soft-card p-3">
          <div className="chips-row">
            {(["INSCRITS", "DETAILS", "PARAMS"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={"chip " + (tab === k ? "chip-active" : "")}
                onClick={() => setTab(k)}
              >
                {k === "INSCRITS" ? `Inscrits (${enrolled})` : k === "DETAILS" ? "Détails" : "Paramètres"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenus */}
      <section className="section">
        {loading ? (
          <Skeleton />
        ) : tab === "INSCRITS" ? (
          <Roster attendees={data?.attendees ?? []} sessionId={sessionId} />
        ) : tab === "DETAILS" ? (
          <Details description={data?.description} notes={data?.notes} />
        ) : (
          <Params data={data!} onSaved={() => router.refresh()} />
        )}
      </section>
    </main>
  );
}

/* ---------- Sous-composants ---------- */

function Roster({ attendees, sessionId }: { attendees: Attendee[]; sessionId: string }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    return attendees
      .filter((a) => {
        if (!q.trim()) return true;
        const hay = `${a.name} ${a.email}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [attendees, q]);

  return (
    <div className="soft-card p-0 overflow-hidden">
      <div className="p-3 flex items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un inscrit…"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
        />
        <div className="flex flex-wrap gap-2">
          <button className="pill pill-ghost" onClick={() => alert("Envoyer un email (à implémenter)")}>
            Contacter les inscrits
          </button>
          <button className="pill pill-ghost" onClick={() => alert("Exporter les inscrits (à implémenter)")}>
            Exporter
          </button>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-[#edf4f6] text-[#0b1239]">
          <tr>
            <Th>Nom</Th>
            <Th>Email</Th>
            <Th>Téléphone</Th>
            <Th>Payé</Th>
            <Th>Présent</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {list.map((a) => (
            <tr key={a.id} className="border-t">
              <Td>{a.name}</Td>
              <Td>{a.email}</Td>
              <Td>{a.phone ?? "—"}</Td>
              <Td>
                <input type="checkbox" defaultChecked={a.paid} onChange={() => alert("Toggle payé (à implémenter)")} aria-label={`Paiement ${a.name}`} />
              </Td>
              <Td>
                <input type="checkbox" defaultChecked={a.checkedIn} onChange={() => alert("Toggle présence (à implémenter)")} aria-label={`Présence ${a.name}`} />
              </Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <Link className="pill pill-ghost" href={`/pro/apprenants/${a.id}`}>Fiche</Link>
                  <button className="pill pill-muted" onClick={() => alert("Désinscrire (à implémenter)")}>Retirer</button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-3 text-xs text-slate-500">
        Session : <code>{sessionId}</code>
      </div>
    </div>
  );
}

function Details({ description, notes }: { description?: string; notes?: string }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="soft-card p-4">
        <h3 className="font-semibold">Description</h3>
        <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{description || "Aucune description."}</p>
      </div>
      <div className="soft-card p-4">
        <h3 className="font-semibold">Notes internes</h3>
        <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{notes || "—"}</p>
      </div>
    </div>
  );
}

function Params({ data, onSaved }: { data: SessionDetail; onSaved: () => void }) {
  const [status, setStatus] = useState<SessionStatus>(data.status);
  const [date, setDate] = useState(data.date.slice(0, 10));
  const [seats, setSeats] = useState<number | "">(typeof data.seats === "number" ? data.seats : "");
  const [price, setPrice] = useState<number | "">(typeof data.price === "number" ? data.price : "");

  async function save() {
    // Brancher PATCH /api/center/sessions/[sessionId]
    alert("Enregistrer (à implémenter)");
    onSaved();
  }

  return (
    <form
      className="soft-card p-4 grid md:grid-cols-2 gap-4"
      onSubmit={(e) => { e.preventDefault(); save(); }}
    >
      <label className="grid gap-1">
        <span className="text-sm text-muted">Date</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2" required />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-muted">Statut</span>
        <select value={status} onChange={(e) => setStatus(e.target.value as SessionStatus)} className="rounded-xl border border-slate-200 px-3 py-2">
          <option value="OPEN">Ouverte</option>
          <option value="CLOSED">Fermée</option>
          <option value="CANCELLED">Annulée</option>
        </select>
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-muted">Capacité (places)</span>
        <input type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value ? Number(e.target.value) : "")} className="rounded-xl border border-slate-200 px-3 py-2" placeholder="24" />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-muted">Prix (TTC, €)</span>
        <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")} className="rounded-xl border border-slate-200 px-3 py-2" placeholder="190" />
      </label>
      <div className="md:col-span-2">
        <button className="btn" type="submit">Enregistrer</button>
      </div>
    </form>
  );
}

/* ---------- UI helpers ---------- */

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}

function Skeleton() {
  return (
    <div className="soft-card p-4 animate-pulse">
      <div className="h-4 w-1/3 bg-slate-200 rounded" />
      <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded" />
      <div className="mt-2 h-3 w-2/5 bg-slate-100 rounded" />
    </div>
  );
}

function StatusBadge({ status }: { status: SessionStatus }) {
  const map: Record<SessionStatus, { label: string; cls: string }> = {
    OPEN:      { label: "Ouverte",  cls: "bg-emerald-100 text-emerald-700" },
    CLOSED:    { label: "Fermée",   cls: "bg-slate-100 text-slate-700" },
    CANCELLED: { label: "Annulée",  cls: "bg-amber-100 text-amber-700" },
  };
  const it = map[status];
  return <span className={`pill ${it.cls}`}>{it.label}</span>;
}

function labelModality(m: Modality) {
  switch (m) {
    case "ONLINE": return "En ligne";
    case "ONSITE": return "Présentiel";
    case "HYBRID": return "Hybride";
  }
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}

/* ---------- MOCK fallback (supprime quand l’API existe) ---------- */
const MOCK_SESSIONS: SessionDetail[] = [
  {
    id: "s1",
    trainingSlug: "reflexologie-plantaire-initiation",
    trainingTitle: "Réflexologie plantaire — module d’initiation",
    modality: "ONLINE",
    date: "2025-11-05",
    seats: 40,
    enrolled: 28,
    price: 190,
    status: "OPEN",
    description: "Découverte des fondamentaux et mise en pratique guidée.",
    notes: "Prévoir un temps de questions en fin de session.",
    attendees: [
      { id: "l1", name: "Alice Martin", email: "alice@example.com", phone: "06 12 34 56 78", paid: true,  checkedIn: false },
      { id: "l2", name: "Marc Dupont",  email: "marc@example.com",                                  paid: false, checkedIn: false },
      { id: "l5", name: "Sophie Leroy", email: "sophie@example.com",                                  paid: true,  checkedIn: true  },
    ],
  },
  {
    id: "s2",
    trainingSlug: "kobido-fondamentaux-posture",
    trainingTitle: "Kobido : fondamentaux & posture",
    modality: "HYBRID",
    date: "2025-10-18",
    seats: 24,
    enrolled: 9,
    price: 320,
    status: "CLOSED",
    attendees: [{ id: "l7", name: "Chloé Martin", email: "chloe@example.com", paid: true, checkedIn: true }],
  },
];
