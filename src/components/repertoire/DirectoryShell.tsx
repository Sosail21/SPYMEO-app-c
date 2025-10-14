// Cdw-Spm
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PROS } from "./mock";
import type { ProContact, ProRole } from "./types";

// (contenu raccourci ici pour la lisibilité dans cette cellule, déjà complet ci-dessus)
export default function DirectoryShell() {
  return (
    <div className="container-spy">
      <h1 className="text-2xl font-bold mb-4">Répertoire SPYMEO</h1>
      <p className="text-muted">Coordonnées des membres pro, accès rapides et liens de messagerie.</p>
      <div className="mt-4 grid gap-2">
        {PROS.map((p) => (
          <div key={p.id} className="soft-card p-3 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-muted">{p.city}</p>
              <p className="text-sm"><a href={`mailto:${p.email}`}>{p.email}</a></p>
              {p.phone && <p className="text-sm"><a href={`tel:${p.phone}`}>{p.phone}</a></p>}
            </div>
            <div className="flex gap-2">
              <Link className="pill pill-ghost" href={`/pro/messages?to=${p.id}`}>Message</Link>
              {p.slug && <Link className="pill pill-solid" href={`/${p.role === "PRACTITIONER" ? "praticien" : p.role === "ARTISAN" ? "artisan" : p.role === "COMMERÇANT" ? "commercant" : "centre-de-formation"}/${p.slug}`}>Voir la fiche</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
