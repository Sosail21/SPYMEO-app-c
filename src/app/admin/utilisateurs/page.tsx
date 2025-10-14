// Cdw-Spm
// src/app/admin/utilisateurs/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Role = "FREE_USER" | "PASS_USER" | "PRACTITIONER" | "COMMERCANT" | "ARTISAN" | "CENTER" | "ADMIN";
type User = { id: string; name: string; email: string; role: Role; passActive?: boolean };

export default function AdminUsersPage() {
  const { data, loading } = useAdminUsers();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "ALL">("ALL");

  const filtered = useMemo(() => {
    const hay = (q || "").toLowerCase();
    return (data ?? [])
      .filter((u) => (role === "ALL" ? true : u.role === role))
      .filter((u) => (hay ? `${u.name} ${u.email}`.toLowerCase().includes(hay) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, q, role]);

  return (
    <section className="section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Utilisateurs</h1>
          <p className="text-slate-600">Listing en lecture, avec actions simples (mock).</p>
        </div>
        <div className="flex gap-2">
          <Link href="/auth/signup" className="btn">+ Nouvel utilisateur</Link>
        </div>
      </div>

      <div className="soft-card p-3 mt-4 flex flex-wrap gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
          aria-label="Rechercher"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          aria-label="Filtrer par rôle"
        >
          <option value="ALL">Tous les rôles</option>
          <option value="FREE_USER">Free</option>
          <option value="PASS_USER">PASS</option>
          <option value="PRACTITIONER">Praticien</option>
          <option value="COMMERCANT">Commerçant</option>
          <option value="ARTISAN">Artisan</option>
          <option value="CENTER">Centre</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="mt-4">
        {loading ? <ListSkeleton /> : filtered.length === 0 ? <EmptyState /> : (
          <ul className="grid gap-2">
            {filtered.map((u) => (
              <li key={u.id} className="soft-card p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{u.name}</div>
                  <div className="text-sm text-slate-600 truncate">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="pill bg-slate-100 text-slate-700">{labelRole(u.role)}</span>
                  {u.role === "PASS_USER" && (
                    <span className={`pill ${u.passActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      PASS {u.passActive ? "actif" : "inactif"}
                    </span>
                  )}
                  <button className="pill pill-muted" onClick={() => alert("Toggle rôle (mock)")}>Changer rôle</button>
                  <button className="pill pill-muted" onClick={() => alert("Désactiver (mock)")}>Désactiver</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function labelRole(r: Role) {
  switch (r) {
    case "FREE_USER": return "Free";
    case "PASS_USER": return "PASS";
    case "PRACTITIONER": return "Praticien";
    case "COMMERCANT": return "Commerçant";
    case "ARTISAN": return "Artisan";
    case "CENTER": return "Centre";
    case "ADMIN": return "Admin";
  }
}

function ListSkeleton() {
  return (
    <ul className="grid gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="soft-card p-3 animate-pulse">
          <div className="h-4 w-1/3 bg-slate-200 rounded" />
          <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="text-lg font-semibold">Aucun utilisateur</h3>
      <p className="text-slate-600 mt-1">Créez un utilisateur pour commencer.</p>
      <div className="mt-4">
        <Link href="/auth/signup" className="btn">+ Créer un compte</Link>
      </div>
    </div>
  );
}

function useAdminUsers() {
  const [data, setData] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/users", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const json = await r.json();
        if (!cancel) setData(json?.users ?? []);
      } catch {
        if (!cancel) setData(MOCK_USERS);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);
  return { data, loading };
}

const MOCK_USERS: User[] = [
  { id: "u1", name: "Alice Martin", email: "alice@ex.com", role: "PASS_USER", passActive: true },
  { id: "u2", name: "Bob Durand", email: "bob@ex.com", role: "FREE_USER" },
  { id: "u3", name: "Dr. Léa Roche", email: "lea@ex.com", role: "PRACTITIONER" },
  { id: "u4", name: "ÉcoBoutique", email: "shop@ex.com", role: "COMMERCANT" },
  { id: "u5", name: "Atelier Bois", email: "atelier@ex.com", role: "ARTISAN" },
  { id: "u6", name: "FormaZen", email: "center@ex.com", role: "CENTER" },
];
