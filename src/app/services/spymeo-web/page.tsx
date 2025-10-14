// Cdw-Spm
// src/app/spymeo-web/page.tsx
import Link from "next/link";

export const metadata = {
  title: "SPYMEO Web",
  description:
    "Votre présence en ligne prête à convertir : vitrine claire, prise de RDV, blog, catalogue et SEO local — intégrée à SPYMEO.",
};

export default function SpymeoWebPage() {
  return (
    <main>
      {/* HERO */}
      <section className="hero py-10 md:py-14">
        <div className="container-spy">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold">SPYMEO Web</h1>
            <p className="text-muted mt-2">
              Vitrine pro + prise de RDV + blog/catalogue —{" "}
              <strong>sans complexité</strong> et pensée pour la conversion locale.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/auth/signup?contact=web" className="btn">
                Demander une mise en ligne
              </Link>
              <Link href="#templates" className="btn btn-outline">
                Voir les templates
              </Link>
            </div>

            <div className="kpi-band mt-4 justify-center">
              <div>⚡ Mise en ligne rapide</div>
              <div>🔎 SEO local de base</div>
              <div>📈 Analytics inclus</div>
            </div>
          </div>
        </div>
      </section>

      {/* BÉNÉFICES */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Ce que vous obtenez</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <article
                key={b.t}
                className="card hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)] transition"
              >
                <div className="text-2xl mb-2">{b.emoji}</div>
                <h3 className="font-semibold">{b.t}</h3>
                <p className="muted mt-1">{b.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section id="templates" className="section bg-[#edf4f6]">
        <div className="container-spy">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="section-title m-0">Templates prêts à l’emploi</h2>
            <Link href="/services/spymeo-start" className="pill pill-ghost">
              Besoin d’aide pour le contenu ?
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEMPLATES.map((t) => (
              <article
                key={t.slug}
                className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
              >
                <div
                  className="h-36 rounded-xl mb-3 bg-cover bg-center"
                  style={{ backgroundImage: `url(${t.img})` }}
                  aria-hidden
                />
                <h3 className="font-semibold">{t.title}</h3>
                <p className="text-sm text-muted mt-1">{t.desc}</p>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="pill pill-muted">{t.usecase}</span>
                  <span className="pill pill-ghost">{t.parts} sections</span>
                </div>
                <div className="mt-4">
                  <span className="btn btn-outline">Prévisualiser</span>
                </div>
              </article>
            ))}
          </div>

          {/* Bande “stack” */}
          <div className="soft-card mt-6 p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="rounded-xl h-14 w-14 shrink-0 bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)]" />
            <div className="grid gap-1">
              <p className="m-0">
                Stack minimaliste, rapide et SEO-friendly. Hébergement inclus, nom de
                domaine en option.
              </p>
              <p className="m-0 text-muted text-sm">
                Optimisé pour la vitesse de chargement et la prise de contact.
              </p>
            </div>
            <div className="sm:ml-auto">
              <Link href="/auth/signup?contact=web" className="pill pill-ghost">
                Parler à un conseiller
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MÉTHODE */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Notre méthode</h2>
          <div className="soft-card p-6 grid md:grid-cols-[1.2fr_.8fr] gap-6 items-center">
            <div className="grid gap-2">
              <ul className="list-disc ml-5 text-muted">
                <li>Brief express (30 min) — objectifs, offre, visuels</li>
                <li>Choix du template & personnalisation</li>
                <li>Publication + SEO local de base</li>
                <li>Activation Analytics & suivi des conversions</li>
              </ul>
            </div>
            <div
              className="h-36 rounded-xl bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)]"
              aria-hidden
            />
          </div>
        </div>
      </section>

      {/* TARIFS — revus & clarifiés */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Formules & tarifs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PricingCard
              title="Web Solo"
              price="190 €"
              subtitle="L’essentiel pour démarrer"
              bullets={[
                "Vitrine 1 page (template au choix)",
                "Prise de contact / RDV intégrée",
                "SEO local de base + Analytics",
              ]}
              cta="Démarrer"
              href="/auth/signup?contact=web-solo"
            />
            <PricingCard
              title="Web Pro"
              price="490 €"
              highlight
              subtitle="Pensé pour convertir"
              bullets={[
                "Mini-site 3 pages (Accueil, Offre, Contact/Blog)",
                "Sections preuves & CTA optimisées",
                "SEO local + Analytics + micro-conversions",
              ]}
              cta="Choisir Web Pro"
              href="/auth/signup?contact=web-pro"
            />
            <PricingCard
              title="Web + Start"
              price="990 €"
              subtitle="Site + cadrage contenu"
              bullets={[
                "Pack Web Pro complet",
                "Atelier Start (positionnement & messages)",
                "Scripts d’acquisition locale",
              ]}
              cta="Parler à un conseiller"
              href="/auth/signup?contact=web-start"
            />
          </div>

          <div className="soft-card p-4 mt-4 grid md:grid-cols-[1fr_auto] items-center gap-3">
            <p className="m-0 text-sm text-muted">
              <strong>Options :</strong> nom de domaine personnalisé, email pro, migration
              de contenu existant, pages additionnelles. Hébergement géré par SPYMEO
              (inclus la première année, puis 7 €/mois).
            </p>
            <Link href="/auth/signup?contact=web" className="pill pill-ghost">
              Discuter d’un besoin spécifique
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-[#edf4f6]">
        <div className="container-spy">
          <h2 className="section-title">Questions fréquentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQ.map((q) => (
              <details key={q.q} className="card">
                <summary className="font-semibold cursor-pointer">{q.q}</summary>
                <p className="muted mt-2">{q.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section cta">
        <div className="container-spy cta-inner">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-1">
              On met votre web en ligne ?
            </h3>
            <p className="opacity-90">
              Brief express, template choisi, publication rapide. Parlons-en.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/signup?contact=web" className="btn">
              Demander une mise en ligne
            </Link>
            <Link href="/services/spymeo-start" className="btn btn-outline">
              Besoin d’un cadrage Start
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ----------------------- Sous-composant ----------------------- */
function PricingCard({
  title,
  price,
  bullets,
  cta,
  href,
  highlight,
  subtitle,
}: {
  title: string;
  price: string;
  bullets: string[];
  cta: string;
  href: string;
  highlight?: boolean;
  subtitle?: string;
}) {
  return (
    <article
      className={
        "card h-full flex flex-col " +
        (highlight
          ? "ring-2 ring-[rgba(23,162,184,.35)] shadow-[0_16px_40px_rgba(23,162,184,0.15)]"
          : "")
      }
    >
      <h3 className="font-semibold text-lg">{title}</h3>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
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

/* ----------------------- Données (mock) ----------------------- */
const BENEFITS = [
  { emoji: "🧭", t: "Clair & lisible", d: "Une structure qui convertit : promesse, preuves, CTA." },
  { emoji: "🔌", t: "Intégré à SPYMEO", d: "Vitrine publique, RDV, blog, catalogue — tout raccord." },
  { emoji: "🚀", t: "Rapide & SEO-friendly", d: "Chargement vif, SEO local de base, analytics inclus." },
];

const TEMPLATES = [
  {
    slug: "soin-essentiel",
    title: "Soin Essentiel",
    desc: "Une page qui va droit au but pour convertir.",
    usecase: "Praticiens solo",
    parts: 5,
    img: "/images/web/template-1.jpg",
  },
  {
    slug: "atelier-pro",
    title: "Atelier Pro",
    desc: "Présenter une offre et un calendrier d’ateliers.",
    usecase: "Artisans / Formateurs",
    parts: 6,
    img: "/images/web/template-2.jpg",
  },
  {
    slug: "boutique-local",
    title: "Boutique Local",
    desc: "Catalogue simple + prise de contact / commande.",
    usecase: "Commerçants engagés",
    parts: 6,
    img: "/images/web/template-3.jpg",
  },
];

const FAQ = [
  {
    q: "Combien de temps pour être en ligne ?",
    a: "Généralement 5 à 10 jours ouvrés après validation du brief et des contenus. La formule Web Pro est la plus rapide à déployer.",
  },
  {
    q: "Puis-je brancher mon propre nom de domaine ?",
    a: "Oui, on peut configurer un domaine personnalisé et un email pro en option.",
  },
  {
    q: "Comment se passe la prise de RDV ?",
    a: "On intègre votre outil préféré ou un lien SPYMEO. L’objectif est de réduire les frictions côté utilisateur.",
  },
  {
    q: "Et pour le SEO local ?",
    a: "On gère les bases (titres, méta, structure, vitesse). Pour aller plus loin, on recommande SPYMEO Start (module contenus).",
  },
];
