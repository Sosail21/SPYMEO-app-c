// Cdw-Spm
"use client";

import { useState } from "react";
import Link from "next/link";

type Secteur = "COMMERCANT" | "ARTISAN";

export default function DevenirMembreCommerçantsArtisans() {
  const [secteur, setSecteur] = useState<Secteur>("COMMERCANT");

  const isComm = secteur === "COMMERCANT";
  const roleLabel = isComm ? "Commerçant" : "Artisan";
  const signupHref = `/auth/signup?role=${secteur}` as any;

  return (
    <main>
      {/* HERO */}
      <section className="hero py-10 md:py-14">
        <div className="container-spy">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold">
              Devenir membre — {roleLabel}s
            </h1>
            <p className="text-muted mt-2">
              Catalogue {isComm ? "produits" : "services"}, commandes, clients,{" "}
              {isComm ? "stock" : "planning d’atelier"}, pré-compta, stats… le tout
              intégré à SPYMEO avec une vitrine claire et des outils simples.
            </p>

            {/* Sélecteur secteur */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="segmented">
                <button
                  type="button"
                  className={isComm ? "is-active" : ""}
                  onClick={() => setSecteur("COMMERCANT")}
                >
                  Commerçant
                </button>
                <button
                  type="button"
                  className={!isComm ? "is-active" : ""}
                  onClick={() => setSecteur("ARTISAN")}
                >
                  Artisan
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <Link href={signupHref} className="btn">
                Créer mon compte {roleLabel.toLowerCase()}
              </Link>
              <Link href="/services/spymeo-web" className="btn btn-outline">
                Découvrir SPYMEO Web (optionnel)
              </Link>
            </div>

            {/* preuves rapides */}
            <div className="kpi-band mt-4 justify-center">
              <span>🧾 Pré-compta simplifiée</span>
              <span>📈 Statistiques essentielles</span>
              <span>🤝 Réseau local & éthique</span>
            </div>
          </div>
        </div>
      </section>

      {/* POURQUOI / BÉNÉFICES */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Pourquoi SPYMEO pour les {roleLabel.toLowerCase()}s ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                e: "🧭",
                t: "Simple au quotidien",
                d: "On va à l’essentiel : catalogue, commandes, clients, encaissements.",
              },
              {
                e: "📍",
                t: "Pensé local",
                d: "Visibilité de proximité, synergies avec les acteurs du territoire.",
              },
              {
                e: "🔗",
                t: "Tout intégré",
                d: "Fiche publique, mini-site, messages, stats, pré-compta.",
              },
              {
                e: "🌱",
                t: "Éthique & durable",
                d: "Charte claire, valorisation des démarches responsables.",
              },
            ].map((b) => (
              <article key={b.t} className="card">
                <div className="text-2xl mb-1">{b.e}</div>
                <h3 className="font-semibold">{b.t}</h3>
                <p className="muted mt-1">{b.d}</p>
              </article>
            ))}
          </div>

          {/* Bande “Inclus” */}
          <div className="soft-card p-5 mt-5 grid md:grid-cols-4 gap-3">
            {[
              { e: "🌐", t: "Fiche optimisée", d: "Vitrine claire + visibilité SPYMEO" },
              { e: "🎓", t: "Académie & ressources", d: "Guides pratiques & supports" },
              { e: "👥", t: "Rencontres mensuelles", d: "Échanges entre pros, co-développement" },
              { e: "🔖", t: "PASS & Avantages", d: "Partenariats, offres entre pros, badge PASS" },
            ].map((x) => (
              <div key={x.t} className="flex items-start gap-3">
                <div className="text-xl">{x.e}</div>
                <div>
                  <div className="font-semibold leading-tight">{x.t}</div>
                  <div className="text-sm text-muted">{x.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS (reflète le menu) */}
      <section className="section bg-[#edf4f6]">
        <div className="container-spy">
          <h2 className="section-title">Tout ce qu’il faut pour votre activité</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Feature
              icon="🛍️"
              title={isComm ? "Catalogue produits" : "Catalogue services"}
              desc={
                isComm
                  ? "Présentez vos produits, variantes, prix, mises en avant."
                  : "Proposez vos prestations, ateliers, options et tarifs."
              }
              points={
                isComm
                  ? ["Fiches produit rapides", "Catégories", "Mise en avant"]
                  : ["Fiches service claires", "Créneaux/ateliers", "Mise en avant"]
              }
            />
            <Feature
              icon="🧾"
              title="Commandes"
              desc="Suivi simple des demandes/commandes et de leur statut."
              points={["Historique", "Notes internes", "Récap client"]}
            />
            <Feature
              icon="👥"
              title="Clients"
              desc="Carnet client minimaliste, fiches & interactions."
              points={["Infos & préférences", "Dernières commandes/RDV", "Etiquettes"]}
            />
            {isComm ? (
              <Feature
                icon="📦"
                title="Stock"
                desc="Vue simple des quantités et alertes de seuil."
                points={["Suivi per-produit", "Ajustements", "Exports CSV"]}
              />
            ) : (
              <Feature
                icon="🧰"
                title="Ateliers"
                desc="Planifier & présenter vos ateliers ou créations."
                points={["Calendrier", "Capacités", "Liste des inscrits"]}
              />
            )}
            <Feature
              icon="📈"
              title="Statistiques"
              desc="Comprenez votre activité et vos canaux."
              points={["Ventes/CA (vue simple)", "Produits/Services top", "Vues & messages"]}
            />
            <Feature
              icon="📚"
              title="Pré-compta"
              desc="Exports et catégorisation sans prise de tête."
              points={["Encaissements", "Exports mensuels", "Libellés personnalisés"]}
            />
          </div>

          <div className="text-center mt-5">
            <Link href={signupHref} className="btn">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* SPYMEO Web (optionnel) */}
      <section className="section bg-white">
        <div className="container-spy">
          <div className="soft-card p-6 md:p-8 grid md:grid-cols-[1.1fr_.9fr] items-center gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold">SPYMEO Web (optionnel)</h3>
              <p className="text-muted mt-1">
                Un mini-site lisible et prêt à convertir. Pour aller plus loin que la fiche : pages dédiées,
                blog, SEO local. Parfait pour {isComm ? "les catalogues & promos" : "les ateliers & prestations"}.
              </p>
              <div className="flex gap-2 mt-3">
                <Link href="/services/spymeo-web" className="btn">Voir SPYMEO Web</Link>
                <Link href={signupHref} className="btn btn-outline">
                  Créer mon compte {roleLabel.toLowerCase()}
                </Link>
              </div>
            </div>
            <div className="h-48 md:h-56 rounded-xl bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)] shadow-elev" aria-hidden />
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: "1", t: "Créez votre compte", d: "Choisissez {Commerçant|Artisan} et complétez votre fiche." },
              { n: "2", t: "Ajoutez votre catalogue", d: isComm ? "Produits, prix, stock." : "Services/ateliers, tarifs & créneaux." },
              { n: "3", t: "Ouvrez vos canaux", d: "Messages, commandes, visibilité locale et stats." },
            ].map((s) => (
              <div key={s.n} className="card">
                <div className="step-num">{s.n}</div>
                <h3 className="font-semibold mb-1">{s.t}</h3>
                <p className="muted">{s.d}</p>
              </div>
            ))}
          </div>

          {/* Orientation services transverses */}
          <div className="soft-card p-5 mt-5 grid md:grid-cols-[1fr_auto] items-center gap-3">
            <p className="m-0 text-sm text-muted">
              Besoin d’un coup de pouce sur le cadrage (offre, messages, pages) ?
              Découvrez <strong>SPYMEO Start</strong> (accompagnement optionnel).
            </p>
            <Link href="/services/spymeo-start" className="pill pill-ghost">Voir SPYMEO Start</Link>
          </div>

          <div className="text-center mt-6">
            <Link href={signupHref} className="btn">
              Je me lance
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ LIGHT */}
      <section className="section bg-[#edf4f6]">
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
            <p className="opacity-90">Créez votre compte en quelques minutes et publiez votre catalogue.</p>
          </div>
          <div className="flex gap-2">
            <Link href={signupHref} className="btn">Créer mon compte</Link>
            <Link href="/services/spymeo-web" className="btn btn-outline">Voir SPYMEO Web</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
  points,
}: {
  icon: string;
  title: string;
  desc: string;
  points: string[];
}) {
  return (
    <article className="soft-card p-4">
      <div className="text-2xl">{icon}</div>
      <h3 className="font-semibold mt-1">{title}</h3>
      <p className="text-sm text-muted mt-1">{desc}</p>
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

const FAQ = [
  {
    q: "Le tarif est-il le même pour commerçants et artisans ?",
    a: "Oui, la formule Pro est identique pour les deux profils (mêmes fonctionnalités).",
  },
  {
    q: "SPYMEO Web / Start sont-ils obligatoires ?",
    a: "Non. Ce sont des services optionnels : Web pour la vitrine complète, Start pour l’accompagnement.",
  },
  {
    q: "Puis-je gérer des ateliers ou des produits physiques ?",
    a: "Oui. Les artisans publient des services/ateliers ; les commerçants gèrent des produits et du stock.",
  },
  {
    q: "Comment fonctionne la pré-compta ?",
    a: "Vous enregistrez vos encaissements, catégorisez, puis exportez un récap simple pour votre comptable.",
  },
];
