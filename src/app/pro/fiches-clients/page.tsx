"use client";
import ClientList from "@/components/patient/ClientList";

export default function ClientsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fiches Clients</h1>
      <ClientList />
    </main>
  );
}
