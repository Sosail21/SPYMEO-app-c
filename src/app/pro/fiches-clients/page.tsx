import ClientList from "@/components/patient/ClientList";

export default function Page() {
  return (
    <main className="container-spy section">
      <h1 className="text-2xl font-semibold mb-4">Fiches clients</h1>
      <ClientList />
    </main>
  );
}