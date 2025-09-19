import Link from "next/link";
import { MODULES } from "./_data";

export default function StartModulesIndex() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {MODULES.map((m) => (
        <Link
          key={m.slug}
          href={`/services/spymeo-start/modules/${m.slug}`}
          className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
        >
          <div
            className="h-32 rounded-xl mb-3 bg-cover bg-center"
            style={{ backgroundImage: `url(${m.img})` }}
            aria-hidden
          />
          <h3 className="font-semibold">{m.title}</h3>
          <p className="text-sm text-muted mt-1">{m.tagline}</p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="pill pill-muted">{m.duration}</span>
            <span className="pill pill-ghost">Niveau {m.level}</span>
          </div>
          <div className="mt-4">
            <span className="btn btn-outline">Voir le module</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
