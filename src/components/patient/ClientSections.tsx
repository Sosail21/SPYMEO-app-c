"use client";

import Section from "./Section";

export default function ClientSections({ clientId }: { clientId: string }) {
  return (
    <div className="grid gap-4">
      <Section title="Consultations">
        <div className="text-muted">[Contenu à venir pour les consultations du consultant {clientId}].</div>
      </Section>
      <Section title="Agenda">
        <div className="text-muted">[Intégration agenda + création de créneau].</div>
      </Section>
      <Section title="Statistiques">
        <div className="text-muted">[KPIs, suivi, graphiques].</div>
      </Section>
      <Section title="Documents">
        <div className="text-muted">[Upload et listing de documents].</div>
      </Section>
      <Section title="Factures">
        <div className="text-muted">[Pré-compta / facturation].</div>
      </Section>
      <Section title="Antécédents">
        <div className="text-muted">[Notes cliniques / historique / tags].</div>
      </Section>
    </div>
  );
}