// Cdw-Spm
'use client';

import ClientTabs from "@/components/patient/ClientTabs";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
};

export default function ClientDetailClient({ client }: { client: Client }) {
  return (
    <div className="grid gap-4">
      <div className="soft-card p-5">
        <h1 className="text-xl font-semibold">Fiche consultant n°{client.id}</h1>
        <div className="mt-4 grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-2">Identité du consultant</h2>
            <dl className="grid gap-1 text-sm">
              <div><dt>Prénom</dt><dd>{client.firstName}</dd></div>
              <div><dt>Nom</dt><dd>{client.lastName}</dd></div>
              <div><dt>Email</dt><dd>{client.email || "—"}</dd></div>
              <div><dt>Téléphone</dt><dd>{client.phone || "—"}</dd></div>
              <div><dt>Naissance</dt><dd>{client.birthDate || "—"}</dd></div>
              <div><dt>Adresse</dt><dd>{client.address || "—"}</dd></div>
            </dl>
          </div>
          <aside className="rounded-xl border bg-white p-4">
            <div className="text-sm text-muted">Récapitulatif</div>
            <div className="mt-2 grid gap-1 text-sm">
              <div>Consultations : —</div>
              <div>Documents : —</div>
              <div>Factures : —</div>
              <div>Antécédents : —</div>
            </div>
          </aside>
        </div>
      </div>
      <ClientTabs client={client as any} />
    </div>
  );
}
