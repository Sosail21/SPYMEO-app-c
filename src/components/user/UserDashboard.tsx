// Cdw-Spm
// src/components/user/UserDashboard.tsx
"use client";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { UserFavorite } from "@/types/user-favorites";
import type { UserPractitioner } from "@/types/user-practitioners";

type Plan = "free" | "pass";
type Message = { id: string; from: string; preview: string; at: string; unread?: boolean };

import type { Appointment } from "@/types/appointments";

export default function UserDashboard({ plan = "free", userName = "Vous" }: { plan?: Plan; userName?: string }) {
  const messages: Message[] = [
    { id: "m1", from: "A. Dupont (Pro)", preview: "Bonjour, je vous envoie…", at: "Il y a 2 h", unread: true },
    { id: "m2", from: "Système", preview: "Votre RDV de mardi a été confirmé ✅", at: "Hier" },
  ];

  const hasPass = plan === "pass";
  const [rdvTab, setRdvTab] = useState<"upcoming"|"past">("upcoming");
  const [upcomingRdvs, setUpcomingRdvs] = useState<Appointment[]>([]);
  const [pastRdvs, setPastRdvs] = useState<Appointment[]>([]);
  const [rdvsLoading, setRdvsLoading] = useState(true);

  // Teasers favoris / praticiens
  const [fav, setFav] = useState<UserFavorite[]>([]);
  const [pract, setPract] = useState<UserPractitioner[]>([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/user/favorites", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const j = await r.json();
        if (!cancel) setFav(j?.favorites ?? []);
      } catch { if (!cancel) setFav([]); }

      try {
        const r = await fetch("/api/user/practitioners", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const j = await r.json();
        if (!cancel) setPract(j?.practitioners ?? []);
      } catch { if (!cancel) setPract([]); }

      try {
        const r = await fetch("/api/user/appointments?scope=upcoming", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const j = await r.json();
        if (!cancel) setUpcomingRdvs(j?.appointments ?? []);
      } catch { if (!cancel) setUpcomingRdvs([]); }

      try {
        const r = await fetch("/api/user/appointments?scope=past", { cache: "no-store" });
        if (!r.ok) throw new Error("fallback");
        const j = await r.json();
        if (!cancel) setPastRdvs(j?.appointments ?? []);
      } catch { if (!cancel) setPastRdvs([]); }

      setRdvsLoading(false);
    })();
    return () => { cancel = true; };
  }, []);

  return (
    <main className="section">
      <div className="container-spy grid gap-6">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1">Bonjour {userName} 👋</h1>
            <p className="text-muted m-0">
              {hasPass
                ? "PASS actif : réductions, ressources mensuelles & Carnet de Vie."
                : "Compte gratuit : rdv, messagerie, documents. Passez au PASS pour débloquer plus."}
            </p>
          </div>
          <div className="flex gap-2">
            {!hasPass ? (
              <Link href="/pass" className="btn">Passer au PASS</Link>
            ) : (
              <Link href="/user/pass" className="btn btn-outline">Gérer mon PASS</Link>
            )}
            <Link href="/recherche" className="btn btn-outline">Rechercher un pro</Link>
          </div>
        </header>

        {/* Rendez-vous */}
        <section className="soft-card p-4">
          <div className="toolbar">
            <h2 className="font-semibold">Mes rendez-vous</h2>
            <div className="segmented">
              <button className={rdvTab === "upcoming" ? "is-active" : ""} onClick={() => setRdvTab("upcoming")}>À venir</button>
              <button className={rdvTab === "past" ? "is-active" : ""} onClick={() => setRdvTab("past")}>Passés</button>
            </div>
          </div>
          {rdvsLoading ? (
            <p className="text-muted mt-3">Chargement...</p>
          ) : rdvTab === "upcoming" ? (
            upcomingRdvs.length ? (
              <ul className="grid gap-3 mt-3">
                {upcomingRdvs.slice(0, 3).map((r) => (
                  <li key={r.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                    {/* Photo du praticien */}
                    {r.practitionerPhoto ? (
                      <img
                        src={r.practitionerPhoto}
                        alt={r.practitionerName}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg text-accent">
                          {r.practitionerName?.charAt(0) || "P"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-sm text-muted">
                        {r.practitionerName} • {new Date(r.date).toLocaleDateString("fr-FR")} à {r.time}
                      </div>
                    </div>
                    <Link href={`/user/rendez-vous/${r.id}`} className="pill pill-ghost flex-shrink-0">Détails</Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted mt-3">Aucun rendez-vous à venir.</p>
          ) : (
            pastRdvs.length ? (
              <ul className="grid gap-3 mt-3">
                {pastRdvs.slice(0, 3).map((r) => (
                  <li key={r.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                    {/* Photo du praticien */}
                    {r.practitionerPhoto ? (
                      <img
                        src={r.practitionerPhoto}
                        alt={r.practitionerName}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg text-accent">
                          {r.practitionerName?.charAt(0) || "P"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-sm text-muted">
                        {r.practitionerName} • {new Date(r.date).toLocaleDateString("fr-FR")} à {r.time}
                      </div>
                    </div>
                    <Link href={`/user/rendez-vous/${r.id}`} className="pill pill-ghost flex-shrink-0">Détails</Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted mt-3">Aucun rendez-vous passé.</p>
          )}
          <div className="mt-3">
            <Link
              href={rdvTab === "upcoming" ? "/user/rendez-vous/a-venir" : "/user/rendez-vous/passes"}
              className="pill pill-ghost w-full text-center"
            >
              Voir tous les rendez-vous {rdvTab === "upcoming" ? "à venir" : "passés"} →
            </Link>
          </div>
        </section>

        {/* Teaser Favoris */}
        <section className="soft-card p-4">
          <div className="toolbar">
            <h2 className="font-semibold">Favoris</h2>
            <Link href="/user/favoris" className="pill pill-ghost">Tout voir</Link>
          </div>
          {fav.length === 0 ? (
            <p className="text-muted mt-2">Vous n’avez pas encore de favoris.</p>
          ) : (
            <ul className="grid gap-2 mt-2">
              {fav.map(f => (
                <li key={f.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="truncate">{f.title}</strong>
                      <span className="affinity">{f.kind}</span>
                    </div>
                    {f.meta && <div className="text-sm text-muted">{f.meta}</div>}
                  </div>
                  <Link href={f.href} className="pill pill-ghost">Ouvrir</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Teaser Mes praticiens */}
        <section className="soft-card p-4">
          <div className="toolbar">
            <h2 className="font-semibold">Mes praticiens</h2>
            <Link href="/user/mes-praticiens" className="pill pill-ghost">Tout voir</Link>
          </div>
          {pract.length === 0 ? (
            <p className="text-muted mt-2">Vous n’avez pas encore consulté de praticien.</p>
          ) : (
            <ul className="grid gap-2 mt-2">
              {pract.map(p => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="truncate">{p.name}</strong>
                      {p.city && <span className="affinity">{p.city}</span>}
                    </div>
                    <div className="text-sm text-muted">{p.specialties.join(" • ")}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/praticien/${p.slug}`} className="pill pill-ghost">Voir la fiche</Link>
                    <Link href={`/prendre-rdv?praticien=${p.slug}`} className="pill pill-muted">Reprendre RDV</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
