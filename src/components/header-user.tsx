"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAvatarMenu from "@/components/header/UserAvatarMenu";

const links = [
  { href: "/user/tableau-de-bord", label: "Tableau de bord" },
  { href: "/user/mes-rendez-vous", label: "Mes rendez-vous" },
  { href: "/user/mes-activites", label: "Mes activités" },
  { href: "/user/mon-compte", label: "Mon compte" },
  { href: "/user/mon-forfait", label: "Mon forfait" },
  { href: "/blog", label: "Nouveautés SPYM'Blog" },
];

export default function HeaderUser({
  user = { name: "Utilisateur", email: "user@spymeo.test" },
}: {
  user?: { name: string; email?: string; avatar?: string };
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <Link href="/" className="brand">
        <span className="brand-dot" />
        <span className="brand-word">SPYMEO</span>
      </Link>

      <nav className="hidden lg:block">
        <ul className="flex items-center gap-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`px-3 py-1 rounded-md transition hover:no-underline ${
                  isActive(l.href) ? "bg-[#f2fbfd] text-accent" : "hover:bg-white"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <UserAvatarMenu user={user} />
      </div>
    </>
  );
}
