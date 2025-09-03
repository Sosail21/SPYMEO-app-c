"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/recherche", label: "Recherche" },
  { href: "/praticiens", label: "Praticiens" },
  { href: "/artisans", label: "Artisans" },
  { href: "/commercants", label: "Commerçants" },
  { href: "/centres-de-formation", label: "Centres de formation" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Brand */}
      <Link href="/" className="brand">
        <span className="brand-dot" />
        <span className="brand-word">SPYMEO</span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden lg:block">
        <ul className="flex items-center gap-5">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`text-text px-2 py-1 rounded-md transition hover:no-underline ${
                  isActive(l.href) ? "bg-[#f2fbfd] text-accent" : "hover:bg-white"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop CTAs */}
      <div className="ml-auto hidden lg:flex gap-2">
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
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-[88%] sm:w-[360px] bg-white shadow-elev p-4 grid gap-3">
            <div className="flex items-center justify-between">
              <div className="brand">
                <span className="brand-dot" />
                <span>SPYMEO</span>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <nav className="grid gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`page ${isActive(l.href) ? "page-active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex gap-2">
              <Link
                className="btn btn-outline flex-1"
                href="/auth/login"
                onClick={() => setOpen(false)}
              >
                Se connecter
              </Link>
              <Link
                className="btn flex-1"
                href="/auth/signup"
                onClick={() => setOpen(false)}
              >
                Créer un compte
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}