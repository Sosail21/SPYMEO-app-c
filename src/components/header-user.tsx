// src/components/header-user.tsx
"use client";

import Link from "next/link";
import UserAvatarMenu from "./header/UserAvatarMenu";

type Plan = "free" | "pass";
type UserLite = {
  name?: string;
  email?: string;
  plan?: Plan;
};

export default function HeaderUser({ user }: { user?: UserLite }) {
  const displayName =
    user?.name && user.name.trim() ? user.name.trim() : "Mon compte";

  return (
    <div className="w-full flex items-center gap-6">
      <Link href="/" className="brand">
        <span className="brand-dot" />
        SPYMEO
      </Link>

      <nav className="ml-auto flex items-center gap-2">
        <Link href="/user/tableau-de-bord" className="page">Tableau de bord</Link>
        <Link href="/recherche" className="page">Trouver un pro</Link>
        {/* Optionnel : si tu veux afficher un lien Pass spécifique */}
        {/* {user?.plan === "pass" && <Link href="/pass" className="page">Mon PASS</Link>} */}
        <UserAvatarMenu name={displayName} />
      </nav>
    </div>
  );
}
