// Cdw-Spm
"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { itemsForRole } from "./menu";

const LS_KEY = "spymeo_sidebar_collapsed";

export default function Sidebar({ role, name }: { role?: string; name?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { common, specific, specificTitle } = useMemo(() => itemsForRole(role), [role]);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved != null) setCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  const baseWidth = collapsed ? "w-[72px]" : "w-[260px]";

  function Item({ href, icon, label }: { href: string; icon?: string; label: string }) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-xl px-3 py-2 transition
          ${active ? "bg-[#e9f8fb] text-[#0b5b68]" : "hover:bg-white"}
        `}
        title={collapsed ? label : undefined}
        aria-current={active ? "page" : undefined}
      >
        <span className="text-lg leading-none">{icon ?? "•"}</span>
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  }

  return (
    <aside
      className={`${baseWidth} shrink-0 border-r border-border bg-[#f7fbfd] min-h-screen
      sticky top-0 flex flex-col`}>
      <div className="flex items-center justify-between gap-2 p-3">
        <Link href="/pro/dashboard" className="brand">
          <span className="brand-dot" />
          {!collapsed && <span className="brand-word">SPYMEO</span>}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className="btn btn-ghost px-2 py-1"
          aria-label={collapsed ? "Déplier le menu" : "Ranger le menu"}
          title={collapsed ? "Déplier" : "Ranger"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="soft-card px-3 py-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#e6eef2] grid place-content-center font-semibold text-sm">
            {(name ?? "U").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase()}
          </div>
          {!collapsed && <div className="truncate text-sm"><span className="font-semibold">{name ?? "Utilisateur"}</span></div>}
        </div>
      </div>

      <nav className="px-3 py-2 grid gap-1">
        {!collapsed && <div className="text-[11px] uppercase tracking-wide text-muted px-1">Commun</div>}
        <div className="grid gap-1">
          {common.map((i) => <Item key={i.href} href={i.href} icon={i.icon} label={i.label} />)}
        </div>

        {specific.length > 0 && (
          <>
            {!collapsed && <div className="text-[11px] uppercase tracking-wide text-muted px-1 mt-3">{specificTitle}</div>}
            <div className="grid gap-1">
              {specific.map((i) => <Item key={i.href} href={i.href} icon={i.icon} label={i.label} />)}
            </div>
          </>
        )}
      </nav>

      <div className="mt-auto p-3 grid gap-2">
        <Link className="page" href="/pro/compte" title={collapsed ? "Mon compte" : undefined}>
          <span className="text-sm">{collapsed ? "⚙️" : "⚙️  Mon compte"}</span>
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button className="page w-full text-left text-sm" type="submit" title={collapsed ? "Se déconnecter" : undefined}>
            {collapsed ? "⎋" : "⎋  Se déconnecter"}
          </button>
        </form>
      </div>
    </aside>
  );
}
