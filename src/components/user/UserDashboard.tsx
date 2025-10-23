// Cdw-Spm
// src/components/user/UserDashboard.tsx
"use client";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { UserFavorite } from "@/types/user-favorites";
import type { UserPractitioner } from "@/types/user-practitioners";

type Plan = "free" | "pass";
type Rdv = { id: string; with: string; title: string; date: string; place: "Cabinet"|"Visio"|"Domicile"; status: "À venir"|"Passé" };
type Message = { id: string; from: string; preview: string; at: string; unread?: boolean };

export default function UserDashboard({ plan = "free", userName = "Vous" }: { plan?: Plan; userName?: string }) {
  // (tes mocks RDV / messages comme avant)
  const rdvs: Rdv[] = [
    { id: "r1", with: "Aline Dupont", title: "Naturopathie — suivi", date: "2025-09-30 10:00", place: "Cabinet", status: "À venir" },
    { id: "r0", with: "Nicolas Perrin", title: "Sophrologie — 1ère séance", date: "2025-08-28 14:00", place: "Visio", status: "Passé" },
  ];
  const messages: Message[] = [
    { id: "m1", from: "A. Dupont (Pro)", preview: "Bonjour, je vous envoie…", at: "Il y a 2 h", unread: true },
    { id: "m2", from: "Système", preview: "Votre RDV de mardi a été confirmé ✅", at: "Hier" },
  ];

  const nextRdvs = useMemo(() => rdvs.filter(r => r.status === "À venir"), [rdvs]);
  const hasPass = plan === "pass";
  const [rdvTab, setRdvTab] = useState<"upcoming"|"past">("upcoming");

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
          {rdvTab === "upcoming" ? (
            nextRdvs.length ? (
              <ul className="list mt-3">
                {nextRdvs.map((r) => (
                  <li key={r.id} className="list-row">
                    <div className="list-media" />
                    <div className="list-body">
                      <div className="list-head">
                        <strong>{r.title}</strong>
                        <span className="affinity">{r.place}</span>
                      </div>
                      <div className="text-sm text-muted">
                        Avec {r.with} • {r.date} • <span className="text-emerald-700">Rappel 24h activé</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Link href={`/user/rendez-vous/a-venir`} className="pill pill-ghost">Voir tous</Link>
                        <button className="pill pill-muted" onClick={()=>alert("Annuler (à implémenter)")}>Annuler</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted mt-3">Aucun rendez-vous à venir.</p>
          ) : <p className="text-muted mt-3">Historique à afficher…</p>}
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
