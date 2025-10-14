// Cdw-Spm
'use client';

import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ClientConsultations({ clientId }: { clientId: string }) {
  const { data } = useSWR(`/api/clients/${clientId}/consultations`, fetcher);
  const items = data?.items ?? [];

  if (!items.length) return <div className="text-muted">Aucune consultation.</div>;

  return (
    <ul className="grid gap-2">
      {items.map((i: any) => (
        <li key={i.id} className="page flex items-center justify-between">
          <span>{i.date} — {i.title}</span>
          <button className="pill pill-ghost">Détails</button>
        </li>
      ))}
    </ul>
  );
}
