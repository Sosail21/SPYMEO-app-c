import Link from "next/link";
import PassBadge from "@/components/public/PassBadge";

type Praticien = {
  userId?: string; // 👈 ajouté pour lier au PASS
  slug: string;
  name: string;
  title: string;
  city: string;
  distanceKm: number;
  bio: string;
  specialites: string[];
  methodes: string[];
  tarifs: { label: string; price: string; note?: string }[];
  contact: { label: string; value: string }[];
  infos: { label: string; value: string }[];
  avis: { author: string; rating: number; text: string }[];
};

const DB: Record<string, Praticien> = {
  "aline-dupont": {
    userId: "p1", // 👈 id du pro pour récupérer le PASS
    slug: "aline-dupont",
    name: "Aline Dupont",
    title: "Naturopathe",
    city: "Dijon",
    distanceKm: 3,
    bio:
      "J’accompagne les adultes et adolescents sur les thématiques énergie, digestion et stress. Approche pragmatique et documentée, avec un suivi simple et des objectifs mesurables.",
    specialites: ["Gestion du stress", "Troubles digestifs", "Sommeil", "Équilibre hormonal"],
    methodes: ["Bilan de vitalité", "Hygiène alimentaire", "Phytothérapie", "Respiration"],
    tarifs: [
      { label: "Première consultation (60–75 min)", price: "60 €" },
      { label: "Suivi (45–60 min)", price: "50 €" },
      { label: "Bilan complet (90 min)", price: "85 €", note: "avec plan d’action personnalisé" },
    ],
    contact: [
      { label: "Téléphone", value: "06 12 34 56 78" },
      { label: "Email", value: "aline.dupont@example.com" },
      { label: "Site", value: "aline-dupont.fr" },
    ],
    infos: [
      { label: "Formats", value: "Cabinet, Visio" },
      { label: "Adresse", value: "12 rue des Tilleuls, 21000 Dijon" },
      { label: "Accessibilité", value: "PMR partielle, ascenseur" },
      { label: "Langues", value: "Français, Anglais" },
    ],
    avis: [
      { author: "Mélissa", rating: 5, text: "Très à l’écoute, explications claires et plan action concret. Je recommande !" },
      { author: "Romain", rating: 4, text: "Amélioration nette de mon sommeil en 3 semaines. Merci !" },
    ],
  },
};

function stars(n: number) {
  return "★★★★★☆☆☆☆☆".slice(5 - Math.max(0, Math.min(5, n)), 10 - Math.max(0, Math.min(5, n)));
}

export default function PraticienPage({ params }: { params: { slug: string } }) {
  const data: Praticien =
    DB[params.slug] ??
    ({
      userId: "p_fallback", // 👈 au cas où
      slug: params.slug,
      name: "Praticien·ne",
      title: "Spécialité",
      city: "Ville",
      distanceKm: 0,
      bio:
        "Présentation à venir. Cette fiche est un exemple et sera alimentée par les données réelles (CMS/API) prochainement.",
      specialites: ["Exemple 1", "Exemple 2"],
      methodes: ["Méthode A", "Méthode B"],
      tarifs: [{ label: "Consultation", price: "—" }],
      contact: [{ label: "Email", value: "contact@example.com" }],
      infos: [{ label: "Formats", value: "Cabinet, Visio" }],
      avis: [],
    } as Praticien);

  return (
    <main>
      {/* HERO */}
      <section className="fiche-hero">
        <div className="container-spy fiche-hero-inner">
          <div className="fiche-avatar" aria-hidden />
          <div>
            <h1 className="fiche-name flex items-center gap-3">
              <span>{data.name}</span>
              {/* 👉 Badge PASS (affiché si partenaire actif) */}
              {data.userId && <PassBadge userId={data.userId} />}
            </h1>
            <p className="fiche-sub">
              {data.title} — {data.city} · {data.distanceKm} km
            </p>
            <div className="fiche-ctas">
              <Link href={`/praticien/${data.slug}#rdv`} className="btn">
                Prendre RDV
              </Link>
              <Link href={`/auth/login?next=/praticien/${data.slug}#message`} className="btn btn-outline">
                Envoyer un message
              </Link>
              <button className="btn btn-ghost" type="button" title="Ajouter aux favoris (connexion requise)">
                ☆ Favori
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* LAYOUT */}
      <section className="section">
        <div className="fiche-layout">
          {/* MAIN */}
          <div className="fiche-main">
            {/* Présentation */}
            <article className="card">
              <h2 className="section-title m-0 mb-2">Présentation</h2>
              <p className="lead">{data.bio}</p>
              <div className="badges mt-2">
                <span className="badge">Éthique vérifiée</span>
                <span className="badge">Première consult.</span>
                <span className="badge">Visio</span>
              </div>
            </article>

            {/* Spécialités */}
            <article className="card">
              <h2 className="section-title m-0 mb-2">Spécialités</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.specialites.map((s) => (
                  <li key={s} className="pill pill-muted">{s}</li>
                ))}
              </ul>
            </article>

            {/* Approches & méthodes */}
            <article className="card">
              <h2 className="section-title m-0 mb-2">Approches & méthodes</h2>
              <div className="flex flex-wrap gap-2">
                {data.methodes.map((m) => (
                  <span key={m} className="pill pill-ghost">{m}</span>
                ))}
              </div>
            </article>

            {/* Tarifs */}
            <article className="card">
              <h2 className="section-title m-0 mb-2">Tarifs</h2>
              <ul className="grid gap-2">
                {data.tarifs.map((t, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3 border-b border-[rgba(11,18,57,.08)] pb-2 last:border-0">
                    <span>{t.label}{t.note ? ` — ${t.note}` : ""}</span>
                    <strong>{t.price}</strong>
                  </li>
                ))}
              </ul>
              <p className="muted mt-2">Règlements acceptés : CB, espèces. Remboursement mutuelle possible selon contrat.</p>
            </article>

            {/* Disponibilités / RDV */}
            <article id="rdv" className="card">
              <h2 className="section-title m-0 mb-2">Disponibilités</h2>
              <div className="rdv-grid">
                {["Aujourd’hui 15:00", "Demain 10:30", "Ven 14:00", "Lun 09:00", "Lun 11:00", "Mar 16:30", "Mer 13:00", "Jeu 18:30"].map(
                  (slot) => (
                    <button key={slot} className="page w-full text-center" type="button">
                      {slot}
                    </button>
                  )
                )}
              </div>
              <div className="mt-3">
                <Link href={`/auth/login?next=/praticien/${data.slug}#rdv`} className="btn">
                  Voir plus de créneaux
                </Link>
              </div>
            </article>

            {/* Avis */}
            <article className="card">
              <h2 className="section-title m-0 mb-2">Avis</h2>
              <div className="avis">
                {data.avis.length === 0 && (
                  <div className="empty-state">
                    <p className="m-0">Pas encore d’avis. Soyez le premier à partager votre retour.</p>
                  </div>
                )}
                {data.avis.map((a, i) => (
                  <div key={i} className="avis-item">
                    <div className="flex items-center justify-between">
                      <strong>{a.author}</strong>
                      <div className="avis-stars" aria-label={`${a.rating} sur 5`}>
                        {"★".repeat(a.rating)}<span className="text-muted">{"★".repeat(5 - a.rating)}</span>
                      </div>
                    </div>
                    <p className="m-0 mt-1">{a.text}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* SIDE */}
          <aside className="fiche-side">
            {/* Carte */}
            <div className="map" aria-label="Localisation sur la carte" />

            {/* Contact */}
            <div className="card">
              <h3 className="m-0 mb-2">Contact</h3>
              <ul className="fiche-contact">
                {data.contact.map((c) => (
                  <li key={c.label}>
                    <span className="text-muted">{c.label} :</span> {c.value}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <Link href={`/auth/login?next=/praticien/${data.slug}#message`} className="btn btn-outline">Écrire</Link>
                <Link href={`tel:${data.contact.find(c=>c.label==="Téléphone")?.value ?? ""}`} className="btn">Appeler</Link>
              </div>
            </div>

            {/* Infos pratiques */}
            <div className="card">
              <h3 className="m-0 mb-2">Infos pratiques</h3>
              <ul className="fiche-infos">
                {data.infos.map((i) => (
                  <li key={i.label}>
                    <span className="text-muted">{i.label} :</span> {i.value}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA PASS (teasing) */}
            <div className="card">
              <h3 className="m-0 mb-2">PASS SPYMEO</h3>
              <p className="m-0">Tarifs préférentiels, ressources premium et carnet de vie.</p>
              <Link href="/pass" className="btn mt-3">Découvrir le PASS</Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
