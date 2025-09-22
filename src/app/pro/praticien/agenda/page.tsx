export const metadata = {
  title: "Agenda / RDV — SPYMEO",
  description: "Gérer vos rendez-vous, modifier, supprimer, configurer votre agenda.",
};

import AgendaPageClient from "./page.client";

export default async function AgendaPage() {
  return <AgendaPageClient />;
}
