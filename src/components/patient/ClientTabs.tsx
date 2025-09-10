"use client";
import { useState } from "react";

const tabs = [
  "Infos",
  "Consultations",
  "Agenda",
  "Statistiques",
  "Documents",
  "Factures",
  "Antécédents",
];

export default function ClientTabs() {
  const [active, setActive] = useState("Infos");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-4 py-2 rounded ${
              active === t ? "bg-accent text-white" : "bg-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="p-4 border rounded bg-white shadow">
        <h2 className="font-semibold mb-2">{active}</h2>
        <p className="text-gray-600">[Contenu à venir pour {active}]</p>
      </div>
    </div>
  );
}
