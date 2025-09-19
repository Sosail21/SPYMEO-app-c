import Link from "next/link";
import { notFound } from "next/navigation";
import Tabs from "../_tabs";
import { getModule, getNextPrev } from "../_data";

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params) {
  const m = getModule(params.slug);
  if (!m) return { title: "Module SPYMEO Start" };
  return {
    title: `${m.title} — SPYMEO Start`,
    description: m.tagline,
  };
}

export default function StartModulePage({ params }: Params) {
  const m = getModule(params.slug);
  if (!m) return notFound();

  const { prev, next } = getNextPrev(m.slug);

  return (
    <article className="grid gap-5">
      {/* Hero local */}
      <header className="soft-card p-6 grid md:grid-cols-[1.1fr_.9fr] gap-6 items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">{m.title}</h1>
          <p className="text-muted mt-1">{m.tagline}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="pill pill-muted">{m.duration}</span>
            <span className="pill pill-ghost">Niveau {m.level}</span>
          </div>
          <div className="flex gap-2 mt-4">
            <Link href={`/auth/signup?contact=start&module=${m.slug}`} className="btn">
              Réserver ce module
            </Link>
            <Link href="/services/spymeo-start/modules" className="btn btn-outline">
              Tous les modules
            </Link>
          </div>
        </div>
        <div
          className="h-40 md:h-48 rounded-xl bg-cover bg-center shadow-elev"
          style={{ backgroundImage: `url(${m.img})` }}
          aria-hidden
        />
      </header>

      {/* Onglets : Plan / Livrables / FAQ */}
      <Tabs plan={m.plan} deliverables={m.deliverables} faq={m.faq} />

      {/* Navigation précédente / suivante */}
      <nav className="flex items-center justify-between mt-2">
        <div>
          {prev && (
            <Link href={`/services/spymeo-start/modules/${prev.slug}`} className="pill pill-ghost">
              ← {prev.title}
            </Link>
          )}
        </div>
        <div>
          {next && (
            <Link href={`/services/spymeo-start/modules/${next.slug}`} className="pill pill-ghost">
              {next.title} →
            </Link>
          )}
        </div>
      </nav>

      {/* CTA bas de page */}
      <div className="soft-card p-5 flex flex-col sm:flex-row items-center gap-3">
        <div className="text-sm">
          Une question sur <strong>{m.title}</strong> ?
        </div>
        <div className="sm:ml-auto flex gap-2">
          <Link href={`/auth/signup?contact=start&module=${m.slug}`} className="pill pill-solid">
            Parler d’abord avec nous
          </Link>
          <Link href="/services/spymeo-start" className="pill pill-ghost">Voir SPYMEO Start</Link>
        </div>
      </div>
    </article>
  );
}
