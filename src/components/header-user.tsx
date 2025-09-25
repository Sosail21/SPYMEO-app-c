// src/components/header-user.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAvatarMenu from "./header/UserAvatarMenu";

type Plan = "free" | "pass";
type UserLite = { name?: string; email?: string; plan?: Plan };

type PastelKey = "sky" | "indigo" | "purple" | "emerald" | "rose" | "amber";
type NavItem = { href: string; label: string; tone: PastelKey };

const NAV: NavItem[] = [
  { href: "/user/tableau-de-bord", label: "Tableau de bord", tone: "sky" },
  { href: "/user/rendez-vous/a-venir", label: "Rendez-vous", tone: "indigo" },
  { href: "/user/messagerie", label: "Messagerie", tone: "purple" },
  { href: "/user/documents", label: "Documents", tone: "emerald" },
  { href: "/user/favoris", label: "Favoris", tone: "rose" },
  { href: "/user/mes-praticiens", label: "Mes praticiens", tone: "amber" },
];

// Styles pastel (classes explicitement listées pour Tailwind)
const PASTEL: Record<PastelKey, { active: string; hover: string; ring: string; text: string }> = {
  sky:     { active: "bg-sky-50 text-sky-800",       hover: "hover:bg-sky-50 hover:text-sky-800",       ring: "focus:ring-sky-200",    text: "text-sky-800" },
  indigo:  { active: "bg-indigo-50 text-indigo-800", hover: "hover:bg-indigo-50 hover:text-indigo-800", ring: "focus:ring-indigo-200", text: "text-indigo-800" },
  purple:  { active: "bg-purple-50 text-purple-800", hover: "hover:bg-purple-50 hover:text-purple-800", ring: "focus:ring-purple-200", text: "text-purple-800" },
  emerald: { active: "bg-emerald-50 text-emerald-800",hover: "hover:bg-emerald-50 hover:text-emerald-800",ring: "focus:ring-emerald-200",text: "text-emerald-800" },
  rose:    { active: "bg-rose-50 text-rose-800",     hover: "hover:bg-rose-50 hover:text-rose-800",     ring: "focus:ring-rose-200",   text: "text-rose-800" },
  amber:   { active: "bg-amber-50 text-amber-800",   hover: "hover:bg-amber-50 hover:text-amber-800",   ring: "focus:ring-amber-200",  text: "text-amber-800" },
};

export default function HeaderUser({ user }: { user?: UserLite }) {
  const pathname = usePathname();
  const displayName = user?.name?.trim() || "Mon compte";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="w-full flex items-center">
        <Link href="/" className="brand">
          <span className="brand-dot" />
          SPYMEO
        </Link>

        <nav className="ml-auto flex items-center gap-2 flex-wrap">
          {NAV.map((item) => {
            const tone = PASTEL[item.tone];
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "px-3 py-2 rounded-lg text-sm transition focus:outline-none focus:ring-2",
                  active ? tone.active : `text-slate-700 ${tone.hover}`,
                  tone.ring,
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}

          <UserAvatarMenu name={displayName} />
        </nav>
      </div>
  );
}
