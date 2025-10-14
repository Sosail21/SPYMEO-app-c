// Cdw-Spm
// src/app/praticien/[slug]/page.tsx
import Link from "next/link";
import PassBadge from "@/components/public/PassBadge";

/** ——— Types ——— */
type Praticien = {
  userId?: string; // 👈 id du pro (lien PASS + match articles)
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

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverUrl?: string;
  tags?: string[];
  publishedAt?: string; // ISO
  author?: string;      // affichage public
  authorId?: string;    // 👈 pour lier au praticien
};

/** ——— MOCK fiches ——— */
const DB: Record<string, Praticien> = {
  "aline-dupont": {
    userId: "p1",
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

/** ——— MOCK articles (supprime quand API prête) ——— */
const MOCK_ARTICLES: Article[] = [
  {
    id: "a-pr-1",
    slug: "routine-matin-energie",
    title: "Routine du matin : 5 minutes pour l’énergie",
    excerpt: "Un rituel ultra-simple pour démarrer la journée sans pic de stress.",
    coverUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
    tags: ["énergie", "habitudes"],
    publishedAt: "2025-08-10",
    author: "Aline Dupont",
    authorId: "p1",
  },
  {
    id: "a-pr-2",
    slug: "digestion-apaisee-3-reflexes",
    title: "Digestion apaisée : 3 réflexes à instaurer",
    excerpt: "Respiration, mastication, timing — des leviers concrets à tester cette semaine.",
    coverUrl: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1200&auto=format&fit=crop",
    tags: ["digestion", "respiration"],
    publishedAt: "2025-09-02",
    author: "Aline Dupont",
    authorId: "p1",
  },
];

/** ——— Helpers ——— */
function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

/** ——— Page ——— */
export default function PraticienPage({ params }: { params: { slug: string } }) {
  const data: Praticien =
    DB[params.slug] ??
    ({
      userId: "p_fallback",
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

  // 🔌 À brancher plus tard : GET /api/public/blog/by-author?userId=data.userId
  const articles = (MOCK_ARTICLES || []).filter((a) => a.authorId === data.userId);

  return (
    <main>
      {/* HERO */}
      <section className="fiche-hero">
        <div className="container-spy fiche-hero-inner">
          <div className="fiche-avatar" aria-hidden />
          <div>
            <h1 className="fiche-name flex items-center gap-3">
              <span>{data.name}</span>
              {data.userId && <PassBadge userId={data.userId} />}
            </h1>
            <p className="fiche-sub">
              {data.title} — {data.city} · {data.distanceKm} km
            </p>
            <div className="fiche-ctas">
              <Link href={`/praticien/${data.slug}#rdv`} className="btn">Prendre RDV</Link>
              <Link href={`/auth/login?next=/praticien/${data.slug}#message`} className="btn btn-outline">Envoyer un message</Link>
              <button className="btn btn-ghost" type="button" title="Ajouter aux favoris (connexion requise)">☆ Favori</button>
            </div>
          </div>
        </div>
      </section>

      {/* LAYOUT */}
      <section className="section">
        <div className="fiche-layout">
          {/* MAIN — petites marges entre blocs */}
          <div className="fiche-main space-y-3 sm:space-y-4">
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
                <Link href={`/auth/login?next=/praticien/${data.slug}#rdv`} className="btn">Voir plus de créneaux</Link>
              </div>
            </article>

            {/* ✍️ Articles du praticien */}
            <article className="card">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="section-title m-0">Articles (Spym’Blog)</h2>
                <Link href="/blog" className="pill pill-muted">Voir le blog</Link>
              </div>

              {articles.length === 0 ? (
                <div className="empty-state">
                  <p className="m-0">Pas (encore) d’article publié par {data.name}.</p>
                  <p className="m-0 text-slate-600">Revenez bientôt, ou parcourez le Spym’Blog.</p>
                </div>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {articles.map((a) => (
                    <li key={a.id} className="soft-card p-0 overflow-hidden">
                      <Link href={`/blog/${a.slug}`} className="block hover:no-underline">
                        <div className="aspect-[16/9] w-full bg-slate-100">
                          {a.coverUrl ? (
                            <img
                              src={a.coverUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                        </div>

                        <div className="p-3">
                          <div className="text-xs text-slate-500">
                            {fmtDate(a.publishedAt)} · {a.author || data.name}
                          </div>
                          <div className="mt-1 font-semibold line-clamp-2">{a.title}</div>
                          {a.excerpt && <p className="mt-1 text-sm text-slate-600 line-clamp-3">{a.excerpt}</p>}
                          {a.tags?.length ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {a.tags.map((t) => (
                                <span key={t} className="pill bg-slate-100 text-slate-700">{t}</span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>

          {/* SIDE — petites marges entre blocs */}
          <aside className="fiche-side space-y-3 sm:space-y-4">
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

            {/* ✅ Avis déplacés près du contact */}
            <div className="card">
              <h3 className="m-0 mb-2">Avis</h3>
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
                        {"★".repeat(a.rating)}
                        <span className="text-muted">{"★".repeat(5 - a.rating)}</span>
                      </div>
                    </div>
                    <p className="m-0 mt-1">{a.text}</p>
                  </div>
                ))}
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

            {/* CTA PASS */}
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
