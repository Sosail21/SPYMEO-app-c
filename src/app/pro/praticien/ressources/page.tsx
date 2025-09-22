// Server Component (pas de "use client" ici)
import type { Metadata } from "next";
import ResourcesPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Ressources — SPYMEO",
  description: "Bibliothèque de supports à consulter, télécharger et partager aux clients.",
};

export default function ResourcesPage() {
  // On délègue toute l’UI au composant client
  return (
    <main className="section">
      <div className="container-spy">
        <ResourcesPageClient />
      </div>
    </main>
  );
}