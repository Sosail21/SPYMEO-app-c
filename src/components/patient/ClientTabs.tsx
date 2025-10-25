// Cdw-Spm
'use client';

import React, {useState} from "react";
import Link from "next/link";
import type { Client } from "@/types/clients";

type Props = { client: Client };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="soft-card p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </section>
  );
}

export default function ClientTabs({ client }: Props) {
  const [tab, setTab] = useState<
    "consultations" | "agenda" | "statistiques" | "documents" | "factures" | "antecedents"
  >("consultations");

  const TabBtn = (k: typeof tab, label: string) => (
    <button
      key={k}
      onClick={() => setTab(k)}
      className={`page ${tab === k ? "page-active" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-4 grid gap-4">
      <div className="flex flex-wrap gap-2">
        {TabBtn("consultations", "Consultations")}
        {TabBtn("agenda", "Agenda")}
        {TabBtn("statistiques", "Statistiques")}
        {TabBtn("documents", "Documents")}
        {TabBtn("factures", "Factures")}
        {TabBtn("antecedents", "Antécédents")}
      </div>

      {tab === "consultations" && (
        <Section title="Historique des consultations">
          {client.consultations && client.consultations.length ? (
            <ul className="divide-y">
              {client.consultations.map((c) => (
                <li key={c.id} className="py-2 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{new Date(c.date).toLocaleString()}</div>
                    <div className="text-muted text-sm">{c.motif}</div>
                    {c.notes && <div className="text-sm mt-1">{c.notes}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/pro/praticien/consultations/${c.id}`} className="pill pill-ghost">
                      Voir
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted">Aucune consultation.</div>
          )}
        </Section>
      )}

      {tab === "agenda" && (
        <Section title="Rendez-vous">
          {client.appointments && client.appointments.length > 0 ? (
            <ul className="divide-y">
              {client.appointments
                .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
                .map((appt) => {
                  const isPast = new Date(appt.startAt) < new Date();
                  const status = appt.status;
                  const isCompleted = status === "COMPLETED";
                  const isCancelled = status === "CANCELLED" || status === "NO_SHOW";
                  const isUpcoming = (status === "SCHEDULED" || status === "CONFIRMED") && !isPast;

                  // Code couleur selon le statut
                  let statusBadge = "pill pill-muted";
                  let statusText = status;
                  if (isCompleted) {
                    statusBadge = "pill pill-solid bg-green-100 text-green-700";
                    statusText = "✓ Honoré";
                  } else if (isCancelled) {
                    statusBadge = "pill pill-solid bg-red-100 text-red-700";
                    statusText = status === "NO_SHOW" ? "✕ Absent" : "✕ Annulé";
                  } else if (isUpcoming) {
                    statusBadge = "pill pill-solid bg-blue-100 text-blue-700";
                    statusText = "→ À venir";
                  }

                  return (
                    <li key={appt.id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-medium">{appt.title}</div>
                          <div className="text-muted text-sm">
                            📅 {new Date(appt.startAt).toLocaleString("fr-FR", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {appt.location && (
                            <div className="text-muted text-sm">
                              📍 {appt.location}
                            </div>
                          )}
                          {appt.description && (
                            <div className="text-sm mt-1">{appt.description}</div>
                          )}
                        </div>
                        <span className={statusBadge}>{statusText}</span>
                      </div>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <div className="text-muted">Aucun rendez-vous.</div>
          )}
        </Section>
      )}

      {tab === "statistiques" && (
        <Section title="Statistiques du client">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="soft-card p-4">
              <div className="text-muted text-sm">Total visites</div>
              <div className="text-2xl font-extrabold">
                {client.stats?.totalVisits ?? 0}
              </div>
            </div>
            <div className="soft-card p-4">
              <div className="text-muted text-sm">Dernière visite</div>
              <div className="text-lg">{client.stats?.lastVisit || "—"}</div>
            </div>
            <div className="soft-card p-4">
              <div className="text-muted text-sm">Documents</div>
              <div className="text-2xl font-extrabold">
                {client.documents?.length ?? 0}
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === "documents" && (
        <Section title="Documents">
          {client.documents && client.documents.length ? (
            <ul className="grid md:grid-cols-2 gap-3">
              {client.documents.map((d) => (
                <li key={d.id} className="soft-card p-4">
                  <div className="font-medium">{d.title}</div>
                  <div className="text-muted text-sm">{d.type} • {new Date(d.createdAt).toLocaleString()} • {d.sizeKb} Ko</div>
                  <div className="mt-2 flex gap-2">
                    <button className="pill pill-ghost">Télécharger</button>
                    <button className="pill pill-muted">Partager</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted">Aucun document.</div>
          )}
        </Section>
      )}

      {tab === "factures" && (
        <Section title="Factures">
          {client.invoices && client.invoices.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-2">Date</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {client.invoices.map((f) => (
                  <tr key={f.id} className="border-t">
                    <td className="py-2">{f.date}</td>
                    <td>{f.amount}€</td>
                    <td>
                      <span className={`pill ${f.status === "paid" ? "pill-solid" : "pill-muted"}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="pill pill-ghost">Voir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-muted">Aucune facture.</div>
          )}
        </Section>
      )}

      {tab === "antecedents" && (
        <Section title="Antécédents & remarques">
          {client.antecedents && client.antecedents.length ? (
            <ul className="list-disc pl-6">
              {client.antecedents.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          ) : (
            <div className="text-muted">Aucun antécédent.</div>
          )}
        </Section>
      )}
    </div>
  );
}