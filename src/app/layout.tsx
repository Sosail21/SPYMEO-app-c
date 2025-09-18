import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import HeaderPublic from "@/components/header-public";
import HeaderUser from "@/components/header-user";
import Footer from "@/components/layout/Footer"; // ⬅️ footer fixe

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
        const s = JSON.parse(session as string);
        return ["FREE_USER", "PASS_USER"].includes(s?.role);
      } catch {
        return false;
      }
    })();

  return (
    <html lang="fr" className="h-full">
      <head>
        {/* FullCalendar v6 CSS (CDN) */}
        <link rel="stylesheet" href="https://unpkg.com/@fullcalendar/core@6.1.19/index.css" />
        <link rel="stylesheet" href="https://unpkg.com/@fullcalendar/daygrid@6.1.19/index.css" />
        <link rel="stylesheet" href="https://unpkg.com/@fullcalendar/timegrid@6.1.19/index.css" />
      </head>

      {/* 
        has-fixed-footer ➜ ajoute un padding-bottom pour ne pas cacher le contenu
        (défini dans globals.css selon la hauteur du footer fixe)
      */}
      <body className="min-h-screen bg-white text-slate-900 has-fixed-footer">
        <header className="site-header">
          <div className="container-spy flex items-center gap-6 py-3">
            {hasUser ? <HeaderUser /> : <HeaderPublic />}
          </div>
        </header>

        <main id="contenu">{children}</main>

        {/* Footer fixe global (public) */}
        <Footer />
      </body>
    </html>
  );
}