"use client";
import { useParams } from "next/navigation";
import ClientDetail from "@/components/patient/ClientDetail";
import { MOCK_CLIENTS } from "@/components/patient/mock";

export default function ClientDetailPage() {
  const { id } = useParams();
  const client = MOCK_CLIENTS.find((c) => c.id === id);

  if (!client) {
    return <div className="p-6">Client introuvable</div>;
  }

  return <ClientDetail client={client} />;
}
