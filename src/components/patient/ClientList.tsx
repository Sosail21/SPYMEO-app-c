"use client";
import Link from "next/link";
import { useState } from "react";
import { MOCK_CLIENTS } from "./mock";

export default function ClientList() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Rechercher un client..."
          className="flex-1 border rounded px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bg-accent text-white px-4 py-2 rounded">
          + Ajouter
        </button>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {filtered.map((c) => (
          <li key={c.id} className="p-4 border rounded shadow-sm bg-white">
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-sm text-gray-500">{c.email}</p>
            <Link
              href={`/pro/fiches-clients/${c.id}`}
              className="text-accent text-sm mt-2 inline-block"
            >
              Voir la fiche →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
