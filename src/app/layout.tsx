// Cdw-Spm
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import HeaderPublic from "@/components/header-public";
import HeaderUser from "@/components/header-user";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "SPYMEO",
  description: "Écosystème local & éthique pour la santé globale.",
};

type Plan = "free" | "pass";
type SessionShape = {
  role?: string;
  name?: string;
  email?: string;
};

function roleToPlan(role?: string): Plan | undefined {
  if (!role) return undefined;
  const r = String(role).toUpperCase().trim();
  if (r === "PASS_USER") return "pass";
  if (r === "FREE_USER") return "free";
  return undefined;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const raw = cookies().get(COOKIE_NAME)?.value;
  let plan: Plan | undefined = undefined;
  let userName: string | undefined = undefined;
  let email: string | undefined = undefined;

  if (raw) {
    try {
      const s = JSON.parse(raw) as SessionShape;
      plan = roleToPlan(s?.role);
      userName = s?.name;
      email = s?.email;
    } catch {
      // cookie illisible => on reste en public
    }
  }

  const isLoggedIn = plan === "free" || plan === "pass";

  // objet user minimal pour HeaderUser (même menu pour Free & Pass)
  const user = isLoggedIn
    ? { name: userName, email, plan }
    : undefined;

  return (
    <html lang="fr" className="h-full">
      <head>
        {/* FullCalendar CSS (si besoin) */}
        <link rel="stylesheet" href="https://unpkg.com/@fullcalendar/core@6.1.19/index.css" />
        <link rel="stylesheet" href="https://unpkg.com/@fullcalendar/daygrid@6.1.19/index.css" />
        <link rel="stylesheet" href="https://unpkg.com/@fullcalendar/timegrid@6.1.19/index.css" />
      </head>
      <body className="min-h-screen bg-white text-slate-900 has-fixed-footer">
        <header className="site-header">
          <div className="header-inner">
            {isLoggedIn ? <HeaderUser user={user} /> : <HeaderPublic />}
          </div>
        </header>

        <main id="contenu">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
