// Cdw-Spm
// src/app/admin/utilisateurs/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Role = "FREE_USER" | "PASS_USER" | "PRACTITIONER" | "COMMERCANT" | "ARTISAN" | "CENTER" | "ADMIN";
type UserStatus = "ACTIVE" | "PENDING_VALIDATION" | "PENDING_PAYMENT" | "REJECTED" | "SUSPENDED";
type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  passActive?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
};

export default function AdminUsersPage() {
  const { data, loading, refetch } = useAdminUsers();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const hay = (q || "").toLowerCase();
    return (data ?? [])
      .filter((u) => (role === "ALL" ? true : u.role === role))
      .filter((u) => (hay ? `${u.name} ${u.email}`.toLowerCase().includes(hay) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, q, role]);

  const handleChangeRole = async (userId: string, currentRole: Role) => {
    const roles: Role[] = ["FREE_USER", "PASS_USER", "PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER", "ADMIN"];
    const currentIndex = roles.indexOf(currentRole);
    const newRole = roles[(currentIndex + 1) % roles.length];

    const confirmed = confirm(`Changer le rôle vers "${labelRole(newRole)}" ?`);
    if (!confirmed) return;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'changeRole', value: newRole }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Rôle modifié avec succès !');
        refetch();
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      alert('Erreur réseau');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId: string, userName: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const confirmed = confirm(
      `${newStatus === 'SUSPENDED' ? 'Suspendre' : 'Activer'} le compte de "${userName}" ?`
    );
    if (!confirmed) return;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleStatus' }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Statut modifié avec succès !');
        refetch();
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      alert('Erreur réseau');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = confirm(
      `⚠️ ATTENTION: Supprimer définitivement l'utilisateur "${userName}" ?\n\nCette action est irréversible !`
    );
    if (!confirmed) return;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        alert('Utilisateur supprimé avec succès !');
        refetch();
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      alert('Erreur réseau');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <section className="section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Utilisateurs</h1>
          <p className="text-slate-600">Gérez les utilisateurs : changez les rôles, suspendez ou supprimez des comptes.</p>
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
              <li key={u.id} className="soft-card p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{u.name}</div>
                  <div className="text-sm text-slate-600 truncate">{u.email}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="pill bg-slate-100 text-slate-700">{labelRole(u.role)}</span>
                  <span className={`pill ${
                    u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                    u.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                    u.status === 'PENDING_PAYMENT' ? 'bg-amber-100 text-amber-700' :
                    u.status === 'PENDING_VALIDATION' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {labelStatus(u.status)}
                  </span>
                  {u.role === "PASS_USER" && (
                    <span className={`pill ${u.passActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      PASS {u.passActive ? "actif" : "inactif"}
                    </span>
                  )}
                  <button
                    className="pill pill-muted hover:bg-slate-200"
                    onClick={() => handleChangeRole(u.id, u.role)}
                    disabled={actionLoading === u.id}
                  >
                    {actionLoading === u.id ? '...' : 'Changer rôle'}
                  </button>
                  <button
                    className={`pill ${u.status === 'ACTIVE' ? 'pill-muted hover:bg-red-100' : 'pill-muted hover:bg-green-100'}`}
                    onClick={() => handleToggleStatus(u.id, u.name, u.status)}
                    disabled={actionLoading === u.id}
                  >
                    {actionLoading === u.id ? '...' : u.status === 'ACTIVE' ? 'Suspendre' : 'Activer'}
                  </button>
                  <button
                    className="pill pill-muted hover:bg-red-100 text-red-600"
                    onClick={() => handleDeleteUser(u.id, u.name)}
                    disabled={actionLoading === u.id}
                  >
                    {actionLoading === u.id ? '...' : 'Supprimer'}
                  </button>
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

function labelStatus(s: UserStatus) {
  switch (s) {
    case "ACTIVE": return "Actif";
    case "SUSPENDED": return "Suspendu";
    case "PENDING_VALIDATION": return "En attente validation";
    case "PENDING_PAYMENT": return "En attente paiement";
    case "REJECTED": return "Rejeté";
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
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => setRefreshKey(prev => prev + 1);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    (async () => {
      try {
        const r = await fetch("/api/admin/users", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const json = await r.json();
        if (!cancel) setData(json?.users ?? []);
      } catch (error) {
        console.error('[ADMIN_USERS] Error fetching users:', error);
        if (!cancel) setData([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [refreshKey]);

  return { data, loading, refetch };
}
