// Cdw-Spm
// src/components/admin/Topbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CommandPalette, { type Command } from "./CommandPalette";
import ConfirmModal, { useConfirm } from "@/components/common/ConfirmModal";

export default function AdminTopbar() {
  const confirmDialog = useConfirm();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const commands: Command[] = useMemo(
    () => [
      { id: "go-dashboard", title: "Aller • Tableau de bord", section: "Navigation", href: "/admin", icon: "🏠" },
      { id: "go-users",     title: "Aller • Utilisateurs",     section: "Navigation", href: "/admin/utilisateurs", icon: "👥" },
      { id: "go-centers",   title: "Aller • Centres",          section: "Navigation", href: "/admin/centres", icon: "🎓" },
      { id: "go-pros",      title: "Aller • Pros",             section: "Navigation", href: "/admin/pros", icon: "🧩" },
      { id: "go-pass",      title: "Aller • PASS",             section: "Navigation", href: "/admin/pass", icon: "🔖" },
      { id: "go-blog",      title: "Aller • Blog",             section: "Navigation", href: "/admin/blog", icon: "✍️" },
      { id: "go-database",  title: "Aller • Base de données",  section: "Navigation", href: "/admin/database", icon: "📊" },

      { id: "new-user", title: "Créer un nouvel utilisateur", section: "Actions", href: "/auth/signup", icon: "➕", subtitle: "Redirige vers l'inscription" },
      { id: "new-article", title: "Créer un article", section: "Actions", href: "/admin/blog/nouvel-article", icon: "📝" },
      { id: "add-pass-resource", title: "Ajouter ressource PASS (mock)", section: "Actions", icon: "🗂️", onRun: () => confirmDialog.warning("Créer ressource PASS — à brancher API") },
      { id: "advance-carnet", title: "Avancer un envoi carnet (mock)", section: "Actions", icon: "🚚", onRun: () => confirmDialog.warning("Avancement carnet — à brancher API") },
      { id: "recompute-stats", title: "Recalculer les statistiques (mock)", section: "Actions", icon: "📊", onRun: () => confirmDialog.warning("Recalcul stats — à brancher backend/cron") },
    ],
    [confirmDialog]
  );

  return (
    <>
      <header className="soft-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="brand">
            <span className="brand-dot" />
            <span className="brand-word">SPYMEO</span>
          </Link>
          <span className="pill bg-slate-100 text-slate-700">Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="pill pill-ghost"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir la recherche (⌘K)"
            title="Recherche / Commandes (⌘K)"
          >
            🔎 Rechercher <kbd className="ml-2 text-[11px] text-slate-500">⌘K</kbd>
          </button>

          <form action="/api/auth/logout" method="POST" className="inline">
            <button type="submit" className="pill pill-muted">Se déconnecter</button>
          </form>
        </div>
      </header>

      <div className="md:hidden soft-card px-3 py-2 flex flex-wrap gap-2">
        <Link href="/admin/utilisateurs" className="pill pill-muted">Utilisateurs</Link>
        <Link href="/admin/centres" className="pill pill-muted">Centres</Link>
        <Link href="/admin/pros" className="pill pill-muted">Pros</Link>
        <Link href="/admin/pass" className="pill pill-muted">PASS</Link>
        <Link href="/admin/blog" className="pill pill-muted">Blog</Link>
        <Link href="/admin/database" className="pill pill-muted">Base de données</Link>
      </div>

      <CommandPalette open={open} onClose={() => setOpen(false)} commands={commands} />
      <ConfirmModal {...confirmDialog} />
    </>
  );
}
