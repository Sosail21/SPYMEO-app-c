// Cdw-Spm
// src/app/admin/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Kpis = {
  users: number;
  pros: number; // praticiens + commerçants + artisans + centres
  centers: number;
  passActive: number;
};

export default function AdminHomePage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/metrics", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const json = await r.json();
        if (!cancel) setKpis(json?.kpis);
      } catch {
        if (!cancel) setKpis(MOCK_KPIS);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <section className="section">
      <div className="grid gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#0b1239]">Admin — Tableau de bord</h1>

        {!kpis ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Utilisateurs" value={kpis.users} href="/admin/utilisateurs" />
              <StatCard label="Pros actifs" value={kpis.pros} href="/admin/pros" />
              <StatCard label="Centres" value={kpis.centers} href="/admin/centres" />
              <StatCard label="PASS actifs" value={kpis.passActive} href="/admin/pass" />
            </div>

            <div className="soft-card p-4">
              <h2 className="font-semibold">Raccourcis</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/admin/utilisateurs" className="pill pill-ghost">Gérer les utilisateurs</Link>
                <Link href="/admin/centres" className="pill pill-ghost">Centres & formations</Link>
                <Link href="/admin/pros" className="pill pill-ghost">Pros</Link>
                <Link href="/admin/pass" className="pill pill-ghost">PASS</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href as any} className="soft-card p-4 hover:no-underline hover:shadow-md transition">
      <div className="text-slate-600 text-sm">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="soft-card p-4 animate-pulse">
          <div className="h-3 w-1/2 bg-slate-200 rounded" />
          <div className="mt-3 h-6 w-1/3 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

const MOCK_KPIS: Kpis = { users: 1248, pros: 322, centers: 18, passActive: 406 };
