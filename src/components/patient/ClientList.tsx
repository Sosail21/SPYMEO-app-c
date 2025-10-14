// Cdw-Spm
'use client';
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import Link from 'next/link';

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ClientList() {
  const { data, error, isLoading, mutate } = useSWR<Client[]>('/api/clients', fetcher);
  const [search, setSearch] = useState('');

  // Toujours un tableau
  const clients = Array.isArray(data) ? data : [];

  const needle = (search ?? '').trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!needle) return clients;
    return clients.filter(c =>
      `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase().includes(needle)
    );
  }, [clients, needle]);

  async function addClient() {
    const body = {
      firstName: 'Nouveau',
      lastName: 'Client',
      email: 'nouveau@example.com',
      phone: '0600000010',
    };
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;
    const created: Client = await res.json();
    // mise à jour optimiste
    mutate([created, ...clients], { revalidate: false });
  }

  if (error) return <div className="text-red-600">Erreur de chargement</div>;

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un consultant…"
          className="input-pill flex-1"
        />
        <button onClick={addClient} className="btn">
          + Ajouter
        </button>
      </div>

      {isLoading ? (
        <div className="text-muted">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="page">Aucun résultat.</div>
      ) : (
        <ul className="grid gap-2">
          {filtered.map((c) => (
            <li key={c.id} className="soft-card p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.firstName} {c.lastName}</div>
                <div className="text-sm text-muted">{c.email ?? '—'} · {c.phone ?? '—'}</div>
              </div>
              <Link className="pill pill-solid" href={`/pro/praticien/fiches-clients/${c.id}`}>
                Ouvrir la fiche
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}