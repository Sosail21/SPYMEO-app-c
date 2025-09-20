// src/components/header/UserAvatarMenu.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export default function UserAvatarMenu({ name }: { name?: string }) {
  const [open, setOpen] = useState(false);

  const initials = useMemo(() => {
    const n = (name ?? "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() ?? "").join("") || "U";
  }, [name]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="like-btn w-10 h-10 !static !shadow-none !rounded-full bg-white border border-border text-sm font-semibold"
        aria-haspopup="menu"
        aria-expanded={open}
        title={name || "Mon compte"}
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-[0_10px_30px_rgba(11,18,57,0.10)] p-2 z-50"
        >
          <div className="px-2 py-1.5 text-sm text-muted">
            Connecté{ name ? ` en tant que ${name}` : "" }
          </div>
          <div className="grid gap-1">
            <Link
              role="menuitem"
              href="/user/tableau-de-bord"
              className="page hover:bg-[#f7fbfd]"
              onClick={() => setOpen(false)}
            >
              Mon compte
            </Link>
            <Link
              role="menuitem"
              href="/user/tableau-de-bord?tab=profil"
              className="page hover:bg-[#f7fbfd]"
              onClick={() => setOpen(false)}
            >
              Profil
            </Link>
            <Link
              role="menuitem"
              href="/user/tableau-de-bord?tab=achats"
              className="page hover:bg-[#f7fbfd]"
              onClick={() => setOpen(false)}
            >
              Mes achats
            </Link>
          </div>

          <div className="my-2 h-px bg-slate-200" />

          <form action="/api/auth/logout" method="post">
  <button type="submit" className="w-full text-left page hover:bg-[#fff3f3] hover:text-[#7a1d1d]">
    Se déconnecter
  </button>
</form>
        </div>
      )}
    </div>
  );
}
