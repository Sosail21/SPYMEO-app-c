// Cdw-Spm
import Link from "next/link";

export const metadata = {
  title: "Devenir membre — Centres de formation | SPYMEO",
  description:
    "Rejoignez SPYMEO en tant que centre de formation : programmes, sessions, inscriptions et visibilité locale dans un écosystème éthique.",
};

export default function DevenirMembreCentre() {
  return (
    <main>
      {/* HERO */}
      <section className="hero py-10 md:py-14">
        <div className="container-spy">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold">
              Rejoindre SPYMEO — l’espace dédié aux centres de formation
            </h1>
            <p className="text-muted mt-2">
              Programmes, intervenants, sessions, inscriptions — le tout intégré dans un
              écosystème santé-bien-être local & éthique.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/auth/signup?role=CENTER" className="btn">
                Créer mon compte centre
              </Link>
              <Link href="/services/spymeo-start" className="btn btn-outline">
                Découvrir SPYMEO Start
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BÉNÉFICES */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Pourquoi SPYMEO pour les centres ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <article key={b.t} className="card">
                <div className="text-2xl mb-2">{b.e}</div>
                <h3 className="font-semibold">{b.t}</h3>
                <p className="muted mt-1">{b.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES / INCLUS */}
      <section className="section bg-[#edf4f6]">
        <div className="container-spy">
          <h2 className="section-title">Tout ce qu’il faut pour votre centre</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODULES.map((m) => (
              <article key={m.t} className="soft-card p-4">
                <div className="text-2xl">{m.e}</div>
                <h3 className="font-semibold mt-1">{m.t}</h3>
                <p className="text-sm text-muted mt-1">{m.d}</p>
                <ul className="grid gap-1 mt-3 text-sm text-muted">
                  {m.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span>✔</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="card">
                <div className="step-num">{s.n}</div>
                <h3 className="font-semibold mb-1">{s.t}</h3>
                <p className="muted">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link href="/auth/signup?role=CENTER" className="btn">
              Je crée mon espace centre
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section cta">
        <div className="container-spy cta-inner">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-1">
              Prêt·e à digitaliser votre centre ?
            </h3>
            <p className="opacity-90">
              Programmes clairs, inscriptions simplifiées, visibilité locale accrue.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/signup?role=CENTER" className="btn">
              Créer mon compte
            </Link>
            <Link href="/services/spymeo-start" className="btn btn-outline">
              Voir SPYMEO Start
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* --------- contenu statique --------- */
const BENEFITS = [
  {
    e: "📚",
    t: "Programmes visibles",
    d: "Affichez vos cursus, thématiques et intervenants.",
  },
  {
    e: "🗓️",
    t: "Sessions & inscriptions",
    d: "Agenda clair avec inscriptions simples pour vos stagiaires.",
  },
  {
    e: "🤝",
    t: "Réseau local",
    d: "Connectez vos étudiants avec praticiens et pros du territoire.",
  },
];

const MODULES = [
  {
    e: "🌐",
    t: "Vitrine optimisée",
    d: "Présentez votre centre de manière claire et crédible.",
    points: ["Page centre dédiée", "Infos pratiques", "Galerie/vidéos"],
  },
  {
    e: "🎓",
    t: "Programmes & intervenants",
    d: "Détaillez vos cursus et mettez vos experts en valeur.",
    points: ["Modules & thématiques", "Bio intervenants", "Supports intégrés"],
  },
  {
    e: "🗓️",
    t: "Sessions & inscriptions",
    d: "Simplifiez la gestion des stages et ateliers.",
    points: ["Agenda & sessions", "Inscriptions en ligne", "Exports stagiaires"],
  },
];

const STEPS = [
  {
    n: "1",
    t: "Créez votre compte centre",
    d: "Renseignez vos infos et vos premiers programmes.",
  },
  {
    n: "2",
    t: "Ajoutez vos sessions",
    d: "Dates, intervenants, inscriptions en ligne.",
  },
  {
    n: "3",
    t: "Boostez votre visibilité",
    d: "Vos programmes deviennent accessibles aux futurs praticiens.",
  },
];
