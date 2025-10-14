// Cdw-Spm
// src/app/spymeo-start/page.tsx
import Link from "next/link";

export const metadata = {
  title: "SPYMEO Start",
  description:
    "L’accompagnement pour lancer ou structurer votre activité : identité, offre, web, acquisition locale — pensé pour praticiens, artisans et commerçants engagés.",
};

export default function SpymeoStartPage() {
  return (
    <main>
      {/* HERO */}
      <section className="hero py-10 md:py-14">
        <div className="container-spy">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold">SPYMEO Start</h1>
            <p className="text-muted mt-2">
              <strong>Positionnement clair</strong>, offre lisible, présence web solide et{" "}
              <strong>routine d’acquisition locale</strong>. On structure, on met en ligne, on vous met en mouvement.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/auth/signup?contact=start" className="btn">
                Réserver un appel découverte
              </Link>
              <Link href="#modules" className="btn btn-outline">
                Voir les modules
              </Link>
            </div>

            <div className="kpi-band mt-4 justify-center">
              <div>🚀 Mise en ligne rapide</div>
              <div>🎯 Positionnement différenciant</div>
              <div>🧭 Méthode SPYMEO (éthique & locale)</div>
            </div>
          </div>
        </div>
      </section>

      {/* POURQUOI */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Pourquoi SPYMEO Start ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <article key={b.t} className="card hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)] transition">
                <div className="text-2xl mb-2">{b.emoji}</div>
                <h3 className="font-semibold">{b.t}</h3>
                <p className="muted mt-1">{b.d}</p>
              </article>
            ))}
          </div>

          {/* Bande "Inclus" */}
          <div className="soft-card p-5 mt-5 grid md:grid-cols-4 gap-3">
            {INCLUDES.map((x) => (
              <div key={x.t} className="flex items-start gap-3">
                <div className="text-xl">{x.emoji}</div>
                <div>
                  <div className="font-semibold leading-tight">{x.t}</div>
                  <div className="text-sm text-muted">{x.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="section bg-[#edf4f6]">
        <div className="container-spy">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="section-title m-0">Les modules</h2>
            <Link href="/services/spymeo-start/modules/identite" className="pill pill-ghost">
              Commencer par l’identité
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODULES.map((m) => (
              <Link
                key={m.slug}
                href={`/services/spymeo-start/modules/${m.slug}`}
                className="card group overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)] transition"
              >
                <div
                  className="h-32 rounded-xl mb-3 bg-cover bg-center"
                  style={{ backgroundImage: `url(${m.img})` }}
                  aria-hidden
                />
                <h3 className="font-semibold">{m.title}</h3>
                <p className="text-sm text-muted mt-1">{m.desc}</p>
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

          {/* Bande d’orientation */}
          <div className="soft-card p-5 mt-5 grid md:grid-cols-[1fr_auto] items-center gap-3">
            <p className="m-0 text-sm text-muted">
              Vous avez déjà une identité claire ? Passez directement à <strong>Offre & Packaging</strong>,
              ou au <strong>Web & Mise en ligne</strong>. On s’adapte à votre maturité.
            </p>
            <Link href="/auth/signup?contact=start" className="pill pill-ghost">Parler à un conseiller</Link>
          </div>
        </div>
      </section>

      {/* MÉTHODE */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Notre méthode</h2>
          <div className="soft-card p-6 grid md:grid-cols-[1.2fr_.8fr] gap-6 items-center">
            <div className="grid gap-2">
              <p className="m-0">
                <strong>Concret & actionnable.</strong> On avance par itérations courtes, avec des livrables à chaque étape.
              </p>
              <ul className="list-disc ml-5 text-muted">
                <li>Diagnostic express & priorisation</li>
                <li>Templates SPYMEO (fiche, blog, RDV, catalogue)</li>
                <li>Guides de com’ & scripts d’acquisition</li>
                <li>Accompagnement humain + support asynchrone</li>
              </ul>
            </div>
            <div className="h-36 rounded-xl bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)]" aria-hidden />
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="section bg-[#edf4f6]">
        <div className="container-spy">
          <h2 className="section-title">Ils ont lancé avec Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <article key={t.a} className="card">
                <p className="m-0">“{t.q}”</p>
                <p className="m-0 text-sm text-muted mt-2">— {t.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Formules d’accompagnement</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PricingCard
              title="Kickstart"
              price="290 €"
              cta="Réserver un appel"
              href="/auth/signup?contact=start"
              bullets={["Diagnostic & plan de route", "1 atelier prioritaire", "Livrables essentiels"]}
            />
            <PricingCard
              title="Start Pro"
              price="690 €"
              highlight
              cta="Démarrer"
              href="/auth/signup?contact=start-pro"
              bullets={["Identité + Offre + Web", "3 ateliers guidés", "Templates SPYMEO + mise en ligne"]}
            />
            <PricingCard
              title="Start + Croissance"
              price="990 €"
              cta="Parler à un conseiller"
              href="/auth/signup?contact=start-growth"
              bullets={["Pack Start Pro", "Scripts d’acquisition", "1 mois d’accompagnement"]}
            />
          </div>

          <p className="text-sm text-muted mt-3">
            <strong>Option Web</strong> : besoin d’un site plus complet ? Découvrez{" "}
            <Link href="/services/spymeo-web" className="link-muted underline">SPYMEO Web</Link> (service optionnel).
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section cta">
        <div className="container-spy cta-inner">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-1">On lance votre activité ?</h3>
            <p className="opacity-90">Parlez-nous de votre projet. On vous renvoie un plan clair sous 48h.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/signup?contact=start" className="btn">Réserver un appel</Link>
            <Link href="/services/spymeo-web" className="btn btn-outline">Voir SPYMEO Web</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Sous-composant ---------- */
function PricingCard({
  title,
  price,
  bullets,
  cta,
  href,
  highlight,
}: {
  title: string;
  price: string;
  bullets: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <article
      className={
        "card h-full flex flex-col " +
        (highlight ? "ring-2 ring-[rgba(23,162,184,.35)] shadow-[0_16px_40px_rgba(23,162,184,0.15)]" : "")
      }
    >
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="mt-1">
        <span className="text-3xl font-extrabold">{price}</span>
      </div>
      <ul className="grid gap-2 mt-3 text-sm">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-[2px]">✔</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Link href={href} className="btn w-full text-center">
          {cta}
        </Link>
      </div>
    </article>
  );
}

/* ---------- Données ---------- */
const BENEFITS = [
  { emoji: "🎯", t: "Positionnement net", d: "On clarifie votre promesse, votre cible et votre offre — sans jargon." },
  { emoji: "🧩", t: "Offre lisible & désirable", d: "Forfaits, packs, prestations : on assemble pour vendre mieux." },
  { emoji: "🕸️", t: "Web prêt à convertir", d: "Fiche SPYMEO, mini-site, prise de RDV, blog — on pousse en ligne." },
];

const INCLUDES = [
  { emoji: "🗓️", t: "Ateliers courts", d: "Rythme soutenable, livrables à chaque étape." },
  { emoji: "📄", t: "Templates SPYMEO", d: "Fiche, blog, scripts, messages clés." },
  { emoji: "🧭", t: "Plan de route", d: "Priorisation claire + routine locale." },
  { emoji: "🤝", t: "Support humain", d: "Échanges async + revues rapides." },
];

const MODULES = [
  { slug: "identite",    title: "Identité & Positionnement", desc: "Promesse, cibles, message, preuves.",    duration: "~2 ateliers", level: "1", img: "/images/start/identite.jpg" },
  { slug: "offre",       title: "Offre & Packaging",         desc: "Packs, prix, garanties, objections.",    duration: "~2 ateliers", level: "1", img: "/images/start/offre.jpg" },
  { slug: "web",         title: "Web & Mise en ligne",       desc: "Fiche SPYMEO, mini-site, RDV, blog.",    duration: "~2 ateliers", level: "1", img: "/images/start/web.jpg" },
  { slug: "acquisition", title: "Acquisition locale",        desc: "Scripts, canaux, routine hebdo.",        duration: "~2 ateliers", level: "2", img: "/images/start/acquisition.jpg" },
  { slug: "contenus",    title: "Contenus & Blog",           desc: "Lignes éditoriales efficaces.",          duration: "~1 atelier",  level: "2", img: "/images/start/contenus.jpg" },
  { slug: "experience",  title: "Expérience client",         desc: "Parcours, messages, fidélisation.",      duration: "~1 atelier",  level: "2", img: "/images/start/experience.jpg" },
];

const TESTIMONIALS = [
  { q: "On a enfin osé une offre simple et claire. Les prises de contact ont doublé.", a: "Léa, praticienne" },
  { q: "On a tout packagé et mis en ligne en 10 jours. C’est carré.", a: "Fabien, artisan" },
  { q: "Je sais quoi faire chaque semaine pour me rendre visible sans me cramer.", a: "Nadia, sophrologue" },
];
