"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

type Plan = "free" | "pass";

type Rdv = { id: string; with: string; title: string; date: string; place: "Cabinet"|"Visio"|"Domicile"; status: "À venir"|"Passé" };
type Favori = { id: string; name: string; kind: "Praticien"|"Artisan"|"Commerçant"|"Article"; href: string; meta?: string };
type Message = { id: string; from: string; preview: string; at: string; unread?: boolean };

export default function UserDashboard({ plan = "free", userName = "Vous" }: { plan?: Plan; userName?: string }) {
  const rdvs: Rdv[] = [
    { id: "r1", with: "Aline Dupont", title: "Naturopathie — suivi", date: "2025-09-09 10:30", place: "Cabinet", status: "À venir" },
    { id: "r0", with: "Nicolas Perrin", title: "Sophrologie — 1ère séance", date: "2025-08-28 14:00", place: "Visio", status: "Passé" },
  ];
  const favoris: Favori[] = [
    { id: "f1", name: "Aline Dupont", kind: "Praticien", href: "/praticien/aline-dupont", meta: "Dijon • Naturopathe" },
    { id: "f2", name: "Atelier Savon", kind: "Artisan", href: "/artisan/atelier-savon", meta: "Beaune • Savonnier" },
    { id: "f3", name: "Comprendre l’errance médicale", kind: "Article", href: "/blog/comprendre-errance-medicale" },
  ];
  const messages: Message[] = [
    { id: "m1", from: "A. Dupont (Pro)", preview: "Bonjour Cindy, je vous envoie…", at: "Il y a 2 h", unread: true },
    { id: "m2", from: "Système", preview: "Votre RDV de mardi a été confirmé ✅", at: "Hier" },
  ];

  const nextRdvs = useMemo(() => rdvs.filter(r => r.status === "À venir"), [rdvs]);
  const hasPass = plan === "pass";
  const [rdvTab, setRdvTab] = useState<"upcoming"|"past">("upcoming");

  return (
    <main className="section">
      <div className="container-spy grid gap-6">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1">Bonjour {userName} 👋</h1>
            <p className="text-muted m-0">
              {hasPass ? "Bienvenue dans votre PASS : carnet, ressources premium & réductions actives." : "Compte gratuit : messagerie en lecture, favoris illimités. Passez au PASS pour débloquer plus."}
            </p>
          </div>
          <div className="flex gap-2">
            {!hasPass ? (
              <Link href="/pass" className="btn">Passer au PASS</Link>
            ) : (
              <Link href="/pass" className="btn btn-outline">Gérer mon PASS</Link>
            )}
            <Link href="/recherche" className="btn btn-outline">Rechercher un pro</Link>
          </div>
        </header>
        {/* … contenu complet (rendez-vous, messages, favoris, pass …) … */}
      </div>
    </main>
  );
}
