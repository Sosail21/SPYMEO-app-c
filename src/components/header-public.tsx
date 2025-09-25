// src/components/header-public.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const UNIVERSE_ITEMS = [
  { href: "/praticiens", label: "Praticiens" },
  { href: "/commercants", label: "Commerçants" },
  { href: "/artisans", label: "Artisans" },
  { href: "/centres-de-formation", label: "Centres de formation" },
];

export default function HeaderPublic() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);               // mobile drawer
  const [uOpen, setUOpen] = useState(false);             // desktop univers dropdown
  const [uMobileOpen, setUMobileOpen] = useState(false); // mobile univers collapse

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const isUniverseActive = UNIVERSE_ITEMS.some((i) => isActive(i.href));

  // Fermer "Univers" au clic extérieur / ESC
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!uOpen) return;
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setUOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setUOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [uOpen]);

  return (
    <>
      {/* Brand */}
      <Link href="/" className="brand">
        <span className="brand-dot" />
        <span className="brand-word">SPYMEO</span>
      </Link>

      {/* Desktop nav — centré entre logo (gauche) et CTAs (droite) */}
      <nav className="hidden lg:flex flex-1 items-center justify-center">
        <ul className="flex items-center gap-5">
          {/* Recherche */}
          <li>
            <Link
              href="/recherche"
              aria-current={isActive("/recherche") ? "page" : undefined}
              className={`text-text px-2 py-1 rounded-md transition hover:no-underline ${
                isActive("/recherche") ? "bg-[#f2fbfd] text-accent" : "hover:bg-white"
              }`}
            >
              Recherche
            </Link>
          </li>

          {/* Univers (dropdown au clic) */}
          <li className="relative">
            <button
              type="button"
              ref={triggerRef}
              className={`text-text px-2 py-1 rounded-md transition hover:no-underline inline-flex items-center gap-1 ${
                isUniverseActive ? "bg-[#f2fbfd] text-accent" : "hover:bg-white"
              }`}
              aria-haspopup="menu"
              aria-expanded={uOpen}
              aria-controls="univers-menu"
              onClick={() => setUOpen((v) => !v)}
            >
              Univers <span aria-hidden>▾</span>
            </button>

            {uOpen && (
              <div
                id="univers-menu"
                ref={menuRef}
                role="menu"
                className="absolute left-0 top-[calc(100%+8px)] z-40 min-w-[240px] soft-card p-2 shadow-elev"
              >
                <ul className="grid">
                  {UNIVERSE_ITEMS.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        role="menuitem"
                        className={`block px-3 py-2 rounded-md transition hover:no-underline ${
                          isActive(it.href)
                            ? "bg-[#f2fbfd] text-accent"
                            : "hover:bg-[#f7fafb]"
                        }`}
                        onClick={() => setUOpen(false)}
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>

          {/* Spym'Blog */}
          <li>
            <Link
              href="/blog"
              aria-current={isActive("/blog") ? "page" : undefined}
              className={`text-text px-2 py-1 rounded-md transition hover:no-underline ${
                isActive("/blog") ? "bg-[#f2fbfd] text-accent" : "hover:bg-white"
              }`}
            >
              Spym’Blog
            </Link>
          </li>
        </ul>
      </nav>

      {/* Desktop CTAs (droite) */}
      <div className="ml-auto hidden lg:flex items-center gap-2">
        {/* Professionnel ? (jaune #ffc400) */}
        <Link
          href="/devenir-membre-pro"
          title="Vous êtes un pro ? Rejoignez SPYMEO"
          className="btn border-transparent bg-[#ffc400] text-[#0b1239] hover:brightness-95 focus:ring-2 focus:ring-[#ffc400]/40"
        >
          Professionnel&nbsp;?
        </Link>

        <Link className="btn btn-outline" href="/auth/login">Se connecter</Link>
        <Link className="btn" href="/auth/signup">Créer un compte</Link>
      </div>

      {/* Mobile burger */}
      <button
        className="ml-auto lg:hidden btn btn-ghost"
        aria-label="Ouvrir le menu"
        onClick={() => setOpen((v) => !v)}
      >
        ☰
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-[88%] sm:w-[360px] bg-white shadow-elev p-4 grid gap-3">
            <div className="flex items-center justify-between">
              <div className="brand">
                <span className="brand-dot" />
                <span>SPYMEO</span>
              </div>
              <button className="btn btn-ghost" onClick={() => setOpen(false)} aria-label="Fermer">✕</button>
            </div>

            <nav className="grid gap-2">
              {/* Recherche */}
              <Link
                href="/recherche"
                className={`page ${isActive("/recherche") ? "page-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                Recherche
              </Link>

              {/* Univers (collapsible) */}
              <div className="soft-card p-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-2 py-1 rounded-md"
                  aria-expanded={uMobileOpen}
                  onClick={() => setUMobileOpen((v) => !v)}
                >
                  <span>Univers</span>
                  <span aria-hidden className={`transition ${uMobileOpen ? "rotate-180" : ""}`}>▾</span>
                </button>
                {uMobileOpen && (
                  <ul className="mt-1 grid gap-1">
                    {UNIVERSE_ITEMS.map((it) => (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          className={`page ${isActive(it.href) ? "page-active" : ""}`}
                          onClick={() => {
                            setOpen(false);
                            setUMobileOpen(false);
                          }}
                        >
                          {it.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Spym'Blog */}
              <Link
                href="/blog"
                className={`page ${isActive("/blog") ? "page-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                Spym’Blog
              </Link>

              {/* Professionnel ? (jaune #ffc400) */}
              <Link
                href="/devenir-membre-pro"
                className="btn border-transparent bg-[#ffc400] text-[#0b1239] hover:brightness-95 focus:ring-2 focus:ring-[#ffc400]/40"
                onClick={() => setOpen(false)}
              >
                Professionnel&nbsp;?
              </Link>
            </nav>

            <div className="mt-auto flex gap-2">
              <Link className="btn btn-outline flex-1" href="/auth/login" onClick={() => setOpen(false)}>
                Se connecter
              </Link>
              <Link className="btn flex-1" href="/auth/signup" onClick={() => setOpen(false)}>
                Créer un compte
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
