// src/components/pro/RoleMenu.tsx
"use client";
import Link from "next/link";
import { itemsForRole } from "./menu";

export default function RoleMenu({ role }: { role?: string }) {
  const { common, specific } = itemsForRole(role);

  if (!role) {
    // Par prudence, si on ne connaît pas le rôle, on n’affiche QUE le commun
    return (
      <nav className="w-full">
        <ul className="flex items-center gap-2 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {common.map((i) => (
            <li key={i.href}>
              <Link className="pill pill-ghost hover:shadow-elev" href={i.href}>
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="w-full">
      <ul className="flex items-center gap-2 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {common.map((i) => (
          <li key={i.href}>
            <Link className="pill pill-ghost hover:shadow-elev" href={i.href}>
              {i.label}
            </Link>
          </li>
        ))}

        {specific.length > 0 && <li className="mx-2 text-muted">•</li>}

        {specific.map((i) => (
          <li key={i.href}>
            <Link className="pill pill-muted hover:shadow-elev" href={i.href}>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}