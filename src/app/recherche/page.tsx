// Cdw-Spm
"use client";
import { useMemo, useState } from "react";

type Pro = {
  id: string;
  name: string;
  city: string;
  tags: string[];
  match: number;
  type: "praticien" | "artisan" | "commercant" | "centre";
};

const MOCK: Pro[] = [
  { id: "1", name: "Salomé Nguyen",  city: "Dijon",    tags: ["Réflexologie", "Première consult."], match: 92, type: "praticien" },
  { id: "2", name: "Atelier Savon",  city: "Beaune",   tags: ["Cosmétique", "Zéro déchet"],         match: 88, type: "artisan" },
  { id: "3", name: "Épicerie Locale", city: "Quetigny", tags: ["Vrac", "Bio"],                       match: 86, type: "commercant" },
  { id: "4", name: "Centre Horizon", city: "Dole",     tags: ["Massage bien-être", "Formation"],    match: 84, type: "centre" },
];

/**
 * Mock PASS Partenaire : dans la vraie vie, tu iras chercher
 *   GET /api/public/pass/:userId   (ou enrichir tes résultats côté API).
 * Ici on mappe par id de résultat pour la démonstration.
 */
const PASS_PARTNERS: Record<
  string,
  { enabled: boolean; rate: 5 | 10 | 15 | 20 | 25 | 30 }
> = {
  // id → état PASS
  "2": { enabled: true, rate: 15 }, // Atelier Savon (artisan, a1 dans tes seeds)
  "3": { enabled: true, rate: 10 }, // Épicerie Locale (commerçant, c1)
  "4": { enabled: true, rate: 15 }, // Centre Horizon (centre, t1)
  // "1" (Salomé) désactivé par défaut pour montrer l'effet du filtre
};

function PassBadgeInline({ id }: { id: string }) {
  const partner = PASS_PARTNERS[id];
  if (!partner?.enabled) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-[2px] text-xs font-medium text-sky-700"
      title={`Partenaire PASS : -${partner.rate}% pour les membres PASS`}
    >
      🔖 PASS · -{partner.rate}%
    </span>
  );
}

export default function Recherche() {
  const [view, setView] = useState<"grid" | "list">("grid");

  // mini-filtres côté UI
  const [typeFilter, setTypeFilter] = useState<"" | Pro["type"]>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [passOnly, setPassOnly] = useState<boolean>(false);

  const results = useMemo(() => {
    let data = [...MOCK];

    if (typeFilter) data = data.filter((p) => p.type === typeFilter);
    if (cityFilter.trim()) {
      const c = cityFilter.trim().toLowerCase();
      data = data.filter((p) => p.city.toLowerCase().includes(c));
    }
    if (passOnly) {
      data = data.filter((p) => PASS_PARTNERS[p.id]?.enabled);
    }

    return data;
  }, [typeFilter, cityFilter, passOnly]);

  return (
    <section className="section">
      <div className="container-spy">
        <header className="universe-head mb-2">
          <h1 className="text-3xl font-semibold mb-1">Recherche</h1>
          <p className="text-muted">Affinez par discipline, ville, disponibilité…</p>

          {/* Barre de recherche (visuel) */}
          <form
            className="search search-lg"
            onSubmit={(e) => e.preventDefault()}
            role="search"
          >
            <input
              name="q"
              placeholder="Praticien, artisan, ville…"
              aria-label="Rechercher"
            />

            <select
              name="type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="">Tous</option>
              <option value="praticien">Praticiens</option>
              <option value="artisan">Artisans</option>
              <option value="commercant">Commerçants</option>
              <option value="centre">Centres</option>
            </select>

            <button className="btn" type="submit">
              Rechercher
            </button>
          </form>

          {/* Chips rapides */}
          <div className="chips-row">
            <button className="chip chip-active" type="button">
              Proche de moi
            </button>
            <button className="chip" type="button">
              Première consult.
            </button>
            <button className="chip" type="button">
              Téléconsultation
            </button>
            <button className="chip" type="button">
              Bio / Local
            </button>
          </div>
        </header>

        <div className="results-layout">
          {/* Filtres */}
          <aside className="filters">
            <div className="filter-group">
              <h3>Discipline</h3>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Réflexologie
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Sophrologie
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Massage
              </label>
            </div>

            <div className="filter-group">
              <h3>Ville</h3>
              <input
                className="w-full rounded-md border border-border"
                placeholder="Dijon…"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <h3>Disponibilités</h3>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Ce week-end
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Soir
              </label>
            </div>

            {/* 🔖 Filtre PASS */}
            <div className="filter-group">
              <h3>Avantages</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={passOnly}
                  onChange={(e) => setPassOnly(e.target.checked)}
                />
                Partenaire PASS
              </label>
            </div>
          </aside>

          {/* Résultats */}
          <div>
            <div className="results-header">
              <div className="text-muted">{results.length} résultats</div>
              <div className="view-switch">
                <button
                  className={`view ${view === "grid" ? "view-active" : ""}`}
                  onClick={() => setView("grid")}
                  type="button"
                >
                  Cartes
                </button>
                <button
                  className={`view ${view === "list" ? "view-active" : ""}`}
                  onClick={() => setView("list")}
                  type="button"
                >
                  Liste
                </button>
              </div>
            </div>

            {view === "grid" ? (
              <div className="grid-3">
                {results.map((p) => (
                  <article key={p.id} className="profile-card">
                    <button className="like" aria-label="Ajouter aux favoris">
                      ♡
                    </button>
                    <a
                      className="profile-cover"
                      href={`/${p.type}/${p.name.toLowerCase().replaceAll(" ", "-")}`}
                    />
                    <div className="profile-body">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold flex items-center gap-2">
                          {p.name}
                          {/* 🔖 Badge PASS (inline) */}
                          <PassBadgeInline id={p.id} />
                        </h3>
                        <span className="badge">{p.match}% match</span>
                      </div>
                      <p className="text-muted">{p.city}</p>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {p.tags.map((t) => (
                          <span key={t} className="badge">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <a className="btn btn-ghost" href={`/${p.type}/${p.id}`}>
                          Voir
                        </a>
                        <a className="btn" href={`/${p.type}/${p.id}`}>
                          Prendre RDV
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <ul className="list">
                {results.map((p) => (
                  <li
                    key={p.id}
                    className="list-row hover:-translate-y-0.5 transition"
                  >
                    <div className="list-media" />
                    <div className="list-body">
                      <div className="list-head">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {p.name}
                          {/* 🔖 Badge PASS (inline) */}
                          <PassBadgeInline id={p.id} />
                        </h3>
                        <span className="badge">{p.match}% match</span>
                      </div>
                      <p className="list-desc">
                        {p.type} · {p.city}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {p.tags.map((t) => (
                          <span key={t} className="badge">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <a className="btn btn-ghost" href={`/${p.type}/${p.id}`}>
                          Voir
                        </a>
                        <a className="btn" href={`/${p.type}/${p.id}`}>
                          Prendre RDV
                        </a>
                      </div>
                    </div>
                    <button className="like" aria-label="Ajouter aux favoris">
                      ♡
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <nav className="pagination" aria-label="Pagination">
              <a className="page" href="#">
                Précédent
              </a>
              <a className="page page-active" href="#">
                1
              </a>
              <a className="page" href="#">
                2
              </a>
              <a className="page" href="#">
                Suivant
              </a>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
