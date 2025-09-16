// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import HeaderPublic from "@/components/header-public";
import HeaderUser from "@/components/header-user";

export const metadata: Metadata = {
  title: "SPYMEO",
  description: "Écosystème local & éthique pour la santé globale.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = cookies().get(COOKIE_NAME)?.value;
  const hasUser =
    !!session &&
    (() => {
      try {
        const s = JSON.parse(session);
        return ["FREE_USER", "PASS_USER"].includes(s?.role);
      } catch {
        return false;
      }
    })();

  return (
    <html lang="fr">
      <head>
        {/* FullCalendar v6 CSS (CDN) */}
        <link rel="stylesheet" href="https://unpkg.com/@fullcalendar/core@6.1.19/index.css" />
        <link rel="stylesheet" href="https://unpkg.com/@fullcalendar/daygrid@6.1.19/index.css" />
        <link rel="stylesheet" href="https://unpkg.com/@fullcalendar/timegrid@6.1.19/index.css" />
      </head>
      <body>
        <header className="site-header">
          <div className="container-spy flex items-center gap-6 py-3">
            {hasUser ? <HeaderUser /> : <HeaderPublic />}
          </div>
        </header>

        <main id="contenu">{children}</main>

        <footer className="footer">
          <div className="footer-inner container-spy">
            <div>© SPYMEO</div>
            <nav className="footer-nav">
              <ul>
                <li><a href="/legal/mentions-legales">Mentions légales</a></li>
                <li><a href="/legal/cgu">CGU</a></li>
                <li><a href="/legal/confidentialite">Confidentialité</a></li>
              </ul>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}