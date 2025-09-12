'use client';

import React from "react";
import type { Client } from "@/lib/db/mockClients";

type Props = { client: Client };

export default function IdentityCard({ client }: Props) {
  return (
    <section className="soft-card p-5 mt-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Identité du consultant</h2>
        <button className="pill pill-muted">Modifier</button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-4 text-sm">
        <div className="grid gap-2">
          <div>
            <div className="text-muted">Prénom</div>
            <div>{client.firstName}</div>
          </div>
          <div>
            <div className="text-muted">Email</div>
            <div>{client.email}</div>
          </div>
          <div>
            <div className="text-muted">Date de naissance</div>
            <div>{client.birthDate || "—"}</div>
          </div>
          <div>
            <div className="text-muted">Adresse</div>
            <div>{client.address || "—"}</div>
          </div>
        </div>

        <div className="grid gap-2">
          <div>
            <div className="text-muted">Nom</div>
            <div>{client.lastName}</div>
          </div>
          <div>
            <div className="text-muted">Téléphone</div>
            <div>{client.phone || "—"}</div>
          </div>
        </div>
      </div>
    </section>
  );
}