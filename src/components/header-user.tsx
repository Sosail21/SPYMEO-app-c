// src/components/header-user.tsx
"use client";

import Link from "next/link";
import UserAvatarMenu from "./header/UserAvatarMenu";

type UserLite = {
  name?: string;
  email?: string;
};

export default function HeaderUser({ user }: { user?: UserLite }) {
  return (
    <div className="w-full flex items-center gap-6">
      {/* Brand */}
      <Link href="/" className="brand">
        <span className="brand-dot" />
        SPYMEO
      </Link>

      {/* Nav connecté (tu peux compléter avec tes liens habituels) */}
      <nav className="ml-auto flex items-center gap-2">
        <Link href="/user/tableau-de-bord" className="page">
          Tableau de bord
        </Link>
        {/* Avatar + menu utilisateur */}
        <UserAvatarMenu name={user?.name} />
      </nav>
    </div>
  );
}