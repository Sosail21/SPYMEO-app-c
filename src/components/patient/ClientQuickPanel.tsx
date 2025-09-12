"use client";

import Link from "next/link";
import { Client } from "./types";

export default function ClientQuickPanel({ client }: { client: Client }) {
  return (
    <div className="grid gap-3">
      <div>
        <div className="text-sm text-muted mb-1">Consultant</div>
        <div className="font-semibold">
          {client.firstName} {client.lastName}
        </div>
      </div>

      <div className="grid gap-1 text-sm">
        <div className="text-muted">Email</div>
        <a className="link-muted" href={`mailto:${client.email}`}>{client.email || "—"}</a>
      </div>

      <div className="grid gap-1 text-sm">
        <div className="text-muted">Téléphone</div>
        <a className="link-muted" href={`tel:${client.phone}`}>{client.phone || "—"}</a>
      </div>

      <div className="grid gap-2 mt-2">
        <Link className="btn btn-outline" href={`/pro/agenda?client=${client.id}`}>Ouvrir l’agenda</Link>
        <Link className="btn btn-outline" href={`/pro/consultations?client=${client.id}`}>Listing consultations</Link>
        <Link className="btn btn-outline" href={`/pro/statistiques?client=${client.id}`}>Statistiques</Link>
        <Link className="btn btn-outline" href={`/pro/messages?to=${client.id}`}>Messagerie</Link>
      </div>
    </div>
  );
}