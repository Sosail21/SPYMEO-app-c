// src/app/pass/page.tsx
import Link from "next/link";

export const metadata = {
  title: "PASS SPYMEO",
  description:
    "Tarifs préférentiels chez nos partenaires, ressources premium et carnet de vie pour suivre vos actions bien-être.",
};

export default function PassPage() {
  return (
    <main>
      {/* HERO */}
      <section className="hero py-10 md:py-14">
        <div className="container-spy">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Le PASS SPYMEO</h1>
            <p className="text-muted mt-2">
              Des <strong>avantages immédiats</strong> chez les partenaires,
              des <strong>ressources premium</strong> pour progresser, et un{" "}
              <strong>carnet de vie</strong> pour suivre votre parcours bien-être.
            </p>

            {/* CTA principal */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/auth/signup?plan=pass" className="btn">
                Activer mon PASS
              </Link>
              <Link href="/commercants" className="btn btn-outline">
                Voir les partenaires près de moi
              </Link>
            </div>

            {/* rubans de confiance */}
            <div className="kpi-band mt-4 justify-center">
              <div>🔖 Réductions chez les partenaires</div>
              <div>🎓 Ressources premium</div>
              <div>📒 Carnet de vie</div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICES */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Ce que vous débloquez</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <article
                key={b.t}
                className="card transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
              >
                <div className="text-2xl mb-2">{b.emoji}</div>
                <h3 className="font-semibold">{b.t}</h3>
                <p className="muted mt-1">{b.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="section bg-[#edf4f6]">
        <div className="container-spy">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <article key={i} className="card">
                <div className="step-num">{i + 1}</div>
                <h3 className="font-semibold">{s.t}</h3>
                <p className="muted mt-1">{s.d}</p>
              </article>
            ))}
          </div>

          {/* Bande partenaire PASS (pour la cohérence de marque) */}
          <div className="soft-card mt-6 p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="rounded-xl h-16 w-16 shrink-0 bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)]" />
            <div className="grid gap-1">
              <p className="m-0">
                Les pros partenaires affichent le{" "}
                <span className="pill pill-muted">Badge Partenaire PASS</span>{" "}
                sur leur fiche et dans les résultats.
              </p>
              <p className="m-0 text-muted text-sm">
                Vous voyez d’un coup d’œil où utiliser vos avantages.
              </p>
            </div>
            <div className="sm:ml-auto">
              <Link href="/praticiens" className="pill pill-ghost">
                Parcourir les praticiens
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Tarifs & adhésion</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Carte 1 */}
            <PricingCard
              title="Découverte"
              price="0 €"
              period=""
              cta="Créer mon compte"
              href="/auth/signup"
              bullets={[
                "Aperçu des ressources",
                "Accès aux fiches publiques",
                "Pré-inscriptions aux ateliers",
              ]}
            />

            {/* Carte 2 */}
            <PricingCard
              title="PASS Mensuel"
              price="6,90 €"
              period="/mois"
              highlight
              cta="Activer mon PASS"
              href="/auth/signup?plan=pass-mensuel"
              bullets={[
                "Réductions chez les partenaires",
                "Ressources premium illimitées",
                "Carnet de vie & suivi d’actions",
                "Support prioritaire",
              ]}
            />

            {/* Carte 3 */}
            <PricingCard
              title="PASS Annuel"
              price="69 €"
              period="/an"
              cta="Choisir l’annuel"
              href="/auth/signup?plan=pass-annuel"
              bullets={[
                "2 mois offerts",
                "Réductions partenaires",
                "Ressources premium illimitées",
                "Carnet de vie & suivi d’actions",
              ]}
            />
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
              Prêt·e à enclencher votre progression ?
            </h3>
            <p className="opacity-90">
              Activez votre PASS et profitez des avantages immédiatement.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/signup?plan=pass" className="btn">
              Activer mon PASS
            </Link>
            <Link href="/commercants" className="btn btn-outline">
              Voir les partenaires
            </Link>
          </div>
        </div>
      </section>

      {/* BANNIÈRE PARTENAIRE PRO */}
      <section className="section bg-white">
        <div className="container-spy">
          <div className="soft-card p-6 md:p-8 grid md:grid-cols-[1.2fr_.8fr] items-center gap-6 rounded-2xl">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold">
                Vous êtes praticien·ne, artisan ou commerçant ?
              </h3>
              <p className="opacity-90 mt-1">
                Devenez <strong>Partenaire PASS</strong>: choisissez votre taux
                de réduction (ex: -10% à -20%) et obtenez un badge visible sur
                votre fiche et dans la recherche.
              </p>
              <div className="flex gap-2 mt-3">
                <Link href="/pro/pass" className="btn">
                  Devenir partenaire PASS
                </Link>
                <Link href="/pro/signup" className="btn btn-outline">
                  Rejoindre SPYMEO Pro
                </Link>
              </div>
            </div>
            <div className="h-36 md:h-40 rounded-xl bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)]" />
          </div>
        </div>
      </section>
    </main>
  );
}

/* =================== Sous-composant =================== */
function PricingCard({
  title,
  price,
  period,
  bullets,
  cta,
  href,
  highlight,
}: {
  title: string;
  price: string;
  period?: string;
  bullets: string[];
  cta: string;
  href: string;
  highlight?: boolean;
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
      <div className="mt-1">
        <span className="text-3xl font-extrabold">{price}</span>{" "}
        <span className="text-muted">{period}</span>
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

/* =================== Données mock =================== */
const BENEFITS = [
  {
    emoji: "🔖",
    t: "Réductions immédiates",
    d: "Bénéficiez d’avantages chez les praticiens, commerçants et artisans partenaires.",
  },
  {
    emoji: "🎓",
    t: "Ressources premium",
    d: "Guides, outils et académie pour progresser et rester motivé·e.",
  },
  {
    emoji: "📒",
    t: "Carnet de vie",
    d: "Suivez vos actions, vos RDV, vos notes et avancez pas à pas.",
  },
];

const STEPS = [
  {
    t: "Activez votre PASS",
    d: "Créez votre compte et choisissez la formule mensuelle ou annuelle.",
  },
  {
    t: "Choisissez un partenaire",
    d: "Repérez le badge PASS sur les fiches et dans la recherche.",
  },
  {
    t: "Profitez des avantages",
    d: "Présentez votre PASS lors de la prise de RDV ou en boutique.",
  },
];

const FAQ = [
  {
    q: "Comment profiter des réductions ?",
    a: "Les partenaires affichent un badge PASS et un taux de réduction. Lors de la prise de RDV ou en boutique, votre PASS actif est vérifié depuis votre compte.",
  },
  {
    q: "Puis-je résilier quand je veux ?",
    a: "Oui, l’abonnement mensuel est sans engagement. L’annuel est valable 12 mois et non remboursable une fois activé.",
  },
  {
    q: "Le PASS fonctionne aussi en ligne ?",
    a: "Oui, de nombreux praticiens proposent la visio et certains commerçants offrent des avantages en click & collect ou livraison.",
  },
  {
    q: "Y a-t-il une période d’essai ?",
    a: "Vous pouvez créer un compte gratuit (offre Découverte) pour explorer l’écosystème. Les réductions sont réservées aux PASS actifs.",
  },
];
