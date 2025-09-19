"use client";

import Link from "next/link";

export default function DevenirMembrePraticien() {
  return (
    <main>
      {/* HERO */}
      <section className="hero py-10 md:py-14">
        <div className="container-spy">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold">
              Rejoindre SPYMEO — l’outil tout-en-un des praticiens
            </h1>
            <p className="text-muted mt-2">
              Agenda & prise de RDV, messagerie, dossiers, notes, pré-compta,
              statistiques, mini-site… + un écosystème local & éthique pour
              développer une activité crédible et durable.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/auth/signup?role=PRACTITIONER" className="btn">
                Créer mon compte praticien
              </Link>
              <Link href="/spymeo-start" className="btn btn-outline">
                SPYMEO Start (accompagnement optionnel)
              </Link>
            </div>

            <div className="kpi-band mt-4 justify-center">
              <span>🔒 Données hébergées en Europe</span>
              <span>📅 RDV : cabinet · visio · domicile</span>
              <span>🤝 Communauté locale & éthique</span>
            </div>
          </div>
        </div>
      </section>

      {/* POURQUOI / BÉNÉFICES */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Pourquoi SPYMEO est différent ?</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { e: "🧭", t: "Pensé pour le terrain", d: "Simple au quotidien, validé par des praticiens." },
              { e: "🤍", t: "Éthique claire", d: "Charte, transparence & respect des personnes." },
              { e: "📍", t: "Local & circuits courts", d: "Synergies avec les acteurs du territoire." },
              { e: "🌱", t: "Écosystème complet", d: "Logiciel + mini-site + communauté + accompagnements." },
            ].map((b) => (
              <article key={b.t} className="card">
                <div className="text-2xl mb-1">{b.e}</div>
                <h3 className="font-semibold">{b.t}</h3>
                <p className="muted mt-1">{b.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES LOGICIEL */}
      <section className="section bg-[#edf4f6]">
        <div className="container-spy">
          <h2 className="section-title">Tout ce qu’il faut pour votre activité</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODULES_SOFT.map((m) => (
              <FeatureCard key={m.t} {...m} />
            ))}
          </div>

          {/* ÉCOSYSTÈME */}
          <h3 className="mt-10 mb-3 text-xl font-semibold">Et vous n’êtes pas seul·e</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODULES_ECOSYSTEM.map((m) => (
              <article key={m.t} className="soft-card p-4">
                <div className="text-2xl">{m.e}</div>
                <h4 className="font-semibold mt-1">{m.t}</h4>
                <p className="text-sm text-muted mt-1">{m.d}</p>
              </article>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link href="/auth/signup?role=PRACTITIONER" className="btn">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* MINI-SITE / VISIBILITÉ */}
<section className="section bg-white">
  <div className="container-spy">
    <div className="soft-card p-6 md:p-8 grid md:grid-cols-[1.1fr_.9fr] items-center gap-6">
      <div>
        <h3 className="text-xl md:text-2xl font-semibold">Votre vitrine optimisée SPYMEO</h3>
        <p className="text-muted mt-1">
          Chaque praticien dispose d’une fiche claire et crédible : spécialités, formats
          (cabinet, visio, domicile), créneaux disponibles et prochains RDV. 
        </p>
        <p className="text-muted mt-2">
          Pour aller plus loin, le service <strong>SPYMEO Web</strong> (optionnel)
          permet la création ou la refonte d’un vrai site internet professionnel,
          éthique et aligné à votre image.
        </p>
        <div className="flex gap-2 mt-3">
          <Link href="/services/spymeo-web" className="btn">Découvrir SPYMEO Web</Link>
        </div>
      </div>
      <div
        className="h-48 md:h-56 rounded-xl bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)] shadow-elev"
        aria-hidden
      />
    </div>
  </div>
</section>

      {/* START / ACCOMPAGNEMENT */}
      <section className="section">
        <div className="container-spy">
          <div className="soft-card p-6 md:p-8 bg-[linear-gradient(135deg,#0ea5b7,#54dbe9)] text-white grid md:grid-cols-[1.2fr_.8fr] items-center gap-6 rounded-2xl">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold">SPYMEO Start — accompagnement (optionnel)</h3>
              <p className="opacity-90 mt-1">
                Positionnement, offre, parcours de rendez-vous, contenus clés, bonnes pratiques.
                On vous aide à structurer, clarifier et gagner du temps.
              </p>
              <div className="flex gap-2 mt-3">
                <Link href="/spymeo-start" className="btn-light">Découvrir Start</Link>
                <Link href="/auth/signup?role=PRACTITIONER" className="btn btn-outline-light">
                  Créer mon compte
                </Link>
              </div>
            </div>
            <div className="h-36 md:h-40 rounded-xl bg-white/15" />
          </div>
        </div>
      </section>

      {/* NOTRE UNIVERS (mission & impact) */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Notre univers</h2>
          <div className="soft-card p-6 grid gap-3">
            <p className="text-muted">
              SPYMEO ne se contente pas d’“afficher des fiches”. Nous travaillons en interne pour
              <strong> créer du lien</strong> entre professionnels, <strong>crédibiliser les pratiques</strong>
              par l’éthique et la clarté de l’information, et <strong>créer de la dynamique d’emploi</strong> au
              niveau local (partenariats B2B, événements, interventions, offres “Impact”).
            </p>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted">
              <li>• Mise en avant thématique (saisons, besoins de territoire).</li>
              <li>• Actions B2B locales (entreprises, centres, associations).</li>
              <li>• Outils pédagogiques & contenus de référence.</li>
              <li>• Parcours PASS pour le grand public (accès avantages).</li>
            </ul>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link href="/avantages" className="pill pill-ghost">Découvrir “Avantages”</Link>
              <Link href="/impact" className="pill pill-ghost">Voir “Impact & emploi”</Link>
              <Link href="/pass" className="pill pill-ghost">PASS (grand public)</Link>
            </div>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="section bg-[#edf4f6]">
        <div className="container-spy">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: "1", t: "Créez votre compte", d: "Indiquez votre spécialité et vos formats (cabinet, visio, domicile)." },
              { n: "2", t: "Paramétrez l’agenda", d: "Plages d’ouverture, durées & types de RDV, messages automatiques." },
              { n: "3", t: "Ouvrez aux RDV", d: "Recevez vos premières demandes, suivez dossiers & statistiques." },
            ].map((s) => (
              <div key={s.n} className="card">
                <div className="step-num">{s.n}</div>
                <h3 className="font-semibold mb-1">{s.t}</h3>
                <p className="muted">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link href="/auth/signup?role=PRACTITIONER" className="btn">
              Je me lance
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ LIGHT */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Questions fréquentes</h2>
          <ul className="grid gap-3 max-w-3xl mx-auto">
            {FAQ.map((f) => (
              <li key={f.q} className="soft-card p-4">
                <details>
                  <summary className="cursor-pointer font-semibold">{f.q}</summary>
                  <p className="text-sm text-muted mt-2">{f.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section cta">
        <div className="container-spy cta-inner">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-1">Prêt·e à essayer ?</h3>
            <p className="opacity-90">Créez votre compte en quelques minutes et activez la prise de RDV.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/signup?role=PRACTITIONER" className="btn">Créer mon compte</Link>
            <Link href="/praticiens" className="btn btn-outline">Explorer les praticiens</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- composants ---------- */

function FeatureCard({
  e, t, d, points,
}: { e: string; t: string; d: string; points: string[] }) {
  return (
    <article className="soft-card p-4">
      <div className="text-2xl">{e}</div>
      <h3 className="font-semibold mt-1">{t}</h3>
      <p className="text-sm text-muted mt-1">{d}</p>
      <ul className="grid gap-1 mt-3 text-sm text-muted">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span>✔</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ---------- contenu ---------- */

const MODULES_SOFT = [
  {
    e: "📅",
    t: "Agenda & prise de RDV",
    d: "Ouvrez des créneaux en cabinet, à distance (visio) ou à domicile.",
    points: ["Types de RDV & durées personnalisées", "Lien de prise de RDV partagé", "Rappels automatiques"],
  },
  {
    e: "💬",
    t: "Messagerie & confirmations",
    d: "Centralisez vos échanges et gardez l’historique.",
    points: ["Messages depuis la fiche", "Modèles & notifications", "Confirmations automatiques"],
  },
  {
    e: "📁",
    t: "Dossiers & notes",
    d: "Suivi des séances, observations, plans d’action & fichiers joints.",
    points: ["Notes privées", "Documents clients", "Chronologie de dossier"],
  },
  {
    e: "🧾",
    t: "Pré-compta simplifiée",
    d: "Export simple de vos encaissements et reçus.",
    points: ["Suivi paiements", "Exports mensuels", "Catégories & libellés"],
  },
  {
    e: "📈",
    t: "Statistiques",
    d: "Comprenez votre activité et vos canaux d’acquisition.",
    points: ["CA (vue simple)", "RDV & annulations", "Vues de fiche & messages"],
  },
  {
    e: "👥",
    t: "Rencontres mensuelles",
    d: "Échanges entre pros : entraide, retours d’expérience, co-développement local.",
    points: [
      "Visios thématiques chaque mois",
      "Groupes locaux & pair-à-pair",
      "Partage de cas, ressources & bonnes pratiques",
    ],
  },
];

const MODULES_ECOSYSTEM = [
  
  {
    e: "🪪",
    t: "Fiche optimisée SPYMEO",
    d: "Structure claire, crédibilisante et référencée sur l’écosystème.",
  },
  {
    e: "🎓",
    t: "Académie",
    d: "Mini-cours, bonnes pratiques, templates & check-lists pour progresser.",
  },
  {
    e: "📦",
    t: "Ressources & supports",
    d: "Guides PDF, scripts, modèles de messages, éléments visuels prêts à l’emploi.",
  },
];

const FAQ = [
  {
    q: "Puis-je proposer des RDV en visio et en cabinet ?",
    a: "Oui. Activez plusieurs formats (cabinet, visio, domicile) et créez des types de RDV différents.",
  },
  {
    q: "La pré-compta, c’est compatible avec mon comptable ?",
    a: "Oui. Vous exportez un récap mensuel simple à lui transmettre.",
  },
  {
    q: "SPYMEO Web & SPYMEO Start sont-ils obligatoires ?",
    a: "Non. Ce sont deux services optionnels : Web (site/SEO) et Start (accompagnement).",
  },
  {
    q: "Puis-je devenir partenaire PASS ?",
    a: "Oui, si vous le souhaitez. Vous définissez vous-même une remise pour les membres PASS.",
  },
];
