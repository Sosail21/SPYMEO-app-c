// src/components/header-user.tsx
"use client";

import Link from "next/link";
import UserAvatarMenu from "./header/UserAvatarMenu";

type Plan = "free" | "pass";
type UserLite = { name?: string; email?: string; plan?: Plan };

export default function HeaderUser({ user }: { user?: UserLite }) {
  const displayName = user?.name?.trim() || "Mon compte";

  return (
    <div className="w-full flex items-center">
      <Link href="/" className="brand">
        <span className="brand-dot" />
        SPYMEO
      </Link>

      <nav className="ml-auto flex items-center gap-2 flex-wrap">
        <Link href="/user/tableau-de-bord" className="page">Tableau de bord</Link>
        <Link href="/user/rendez-vous/a-venir" className="page">Rendez-vous</Link>
        <Link href="/user/messagerie" className="page">Messagerie</Link>
        <Link href="/user/documents" className="page">Documents</Link>
        <Link href="/user/favoris" className="page">Favoris</Link>
        <Link href="/user/mes-praticiens" className="page">Mes praticiens</Link>
        <UserAvatarMenu name={displayName} />
      </nav>
    </div>
  );
}