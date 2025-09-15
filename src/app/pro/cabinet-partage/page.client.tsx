
// src/app/pro/cabinet-partage/page.client.tsx
"use client";

import { useMemo, useState } from "react";
import type { Annonce } from "@/components/cabinet/types";
import CardAnnonce from "@/components/cabinet/CardAnnonce";
import ModalAnnonce from "@/components/cabinet/ModalAnnonce";

type Props = { initial: Annonce[] };

export default function CabinetPartageClient({ initial }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "offer" | "demand">("all");
  const [equiped, setEquiped] = useState<"all" | "yes" | "no">("all");
  const [minSurface, setMinSurface] = useState<number | "">("");
  const [maxSurface, setMaxSurface] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [selected, setSelected] = useState<Annonce | null>(null);

  const filtered = useMemo(() => {
    return initial.filter((a) => {
      if (query && !(a.title + " " + a.description).toLowerCase().includes(query.toLowerCase()))
        return false;
      if (type !== "all" && a.kind !== type) return false;
      if (equiped !== "all" && (equiped === "yes") !== !!a.equiped) return false;
      if (minSurface !== "" && a.surface < Number(minSurface)) return false;
      if (maxSurface !== "" && a.surface > Number(maxSurface)) return false;
      if (city && !a.city.toLowerCase().includes(city.toLowerCase())) return false;
      return true;
    });
  }, [initial, query, type, equiped, minSurface, maxSurface, city]);

  return (
    <main className="section">
      <div className="container-spy grid gap-4">
        <h1 className="text-2xl font-semibold">Cabinet partagé</h1>
        <form className="soft-card p-4 grid gap-3 md:grid-cols-4" onSubmit={(e) => e.preventDefault()}>
          <input className="input" placeholder="Recherche…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="all">Offres & Demandes</option>
            <option value="offer">Offres</option>
            <option value="demand">Demandes</option>
          </select>
          <select className="input" value={equiped} onChange={(e) => setEquiped(e.target.value as any)}>
            <option value="all">Équipé ou non</option>
            <option value="yes">Équipé</option>
            <option value="no">Non équipé</option>
          </select>
          <input className="input" placeholder="Ville / localisation" value={city} onChange={(e) => setCity(e.target.value)} />
        </form>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <CardAnnonce key={a.id} ann={a} onOpen={() => setSelected(a)} />
          ))}
          {filtered.length === 0 && <div className="text-muted">Aucune annonce.</div>}
        </div>
      </div>

      {selected && <ModalAnnonce ann={selected} onClose={() => setSelected(null)} onContact={() => {
        window.location.href = `/pro/messages?to=${encodeURIComponent(selected.author.id)}`;
      }} />}
    </main>
  );
}
