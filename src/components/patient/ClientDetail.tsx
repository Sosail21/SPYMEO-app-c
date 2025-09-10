"use client";
import ClientTabs from "./ClientTabs";

export default function ClientDetail({ client }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <button className="bg-accent text-white px-4 py-2 rounded">
          Enregistrer
        </button>
      </div>
      <div className="bg-white shadow rounded p-4">
        <p><strong>Email:</strong> {client.email}</p>
        <p><strong>Téléphone:</strong> {client.phone}</p>
      </div>
      <ClientTabs />
    </div>
  );
}
