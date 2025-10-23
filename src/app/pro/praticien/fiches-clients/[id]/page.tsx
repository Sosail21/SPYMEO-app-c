// Cdw-Spm
// Server Component
import IdentityCard from "@/components/patient/IdentityCard";
import ClientTabs from "@/components/pient/ClientTabs";

// fix path typo (we'll alias below with an export)
export default async function ClientPage({ params }: { params: { id: string } }) {
  // TODO: Fetch client from API
  const client = null;
  if (!client) {
    return (
      <main className="container-spy py-6">
        <h1 className="text-xl font-semibold">Fiche introuvable</h1>
      </main>
    );
  }
  return (
    <main className="container-spy py-6">
      <h1 className="text-xl font-semibold">Fiche consultant n°{client.id}</h1>
      <IdentityCard client={client} />
      {/* Onglets autres infos */}
      {/* ClientTabs est un composant client */}
      <ClientTabs client={client} />
    </main>
  );
}