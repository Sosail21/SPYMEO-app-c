import Link from "next/link";

export const metadata = {
  title: "SPYMEO Start — Modules",
  description: "Les modules d’accompagnement pour structurer et lancer votre activité.",
};

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="section bg-white">
      <div className="container-spy">
        <nav className="mb-3 text-sm">
          <Link className="link-muted" href="/spymeo-start">SPYMEO Start</Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-text">Modules</span>
        </nav>

        <div className="soft-card p-4 mb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="text-sm text-muted">
            Besoin d’aide pour choisir le module ?
          </div>
          <div className="sm:ml-auto">
            <Link className="pill pill-ghost" href="/auth/signup?contact=start">
              Parler à un conseiller
            </Link>
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}
