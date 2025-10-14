// Cdw-Spm
// src/components/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_MENU } from "./menu";

export default function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden md:block w-64 shrink-0">
      <div className="soft-card p-3 sticky top-4">
        <nav className="grid gap-1">
          {ADMIN_MENU.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`px-3 py-2 rounded-lg text-sm transition hover:no-underline ${
                isActive(it.href)
                  ? "bg-[#f2fbfd] text-accent"
                  : "hover:bg-[#f7fafb] text-slate-700"
              }`}
              aria-current={isActive(it.href) ? "page" : undefined}
            >
              <span className="mr-2">{it.icon}</span>
              {it.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
