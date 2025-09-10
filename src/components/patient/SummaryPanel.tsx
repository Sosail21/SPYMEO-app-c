"use client";
import { Patient } from "./types";

export default function SummaryPanel({ patient }: { patient: Patient }) {
  return (
    <aside className="bg-white border border-border rounded-lg p-4 shadow-sm h-fit">
      <h2 className="font-semibold mb-2">{patient.name}</h2>
      <p>Né(e) le : {patient.birthdate}</p>
      <p>Email : {patient.email}</p>
      <p>Téléphone : {patient.phone}</p>
      <nav className="mt-3 text-sm">
        <a className="link-muted">Remarques</a> |{" "}
        <a className="link-muted">Antécédents</a>
      </nav>
    </aside>
  );
}
