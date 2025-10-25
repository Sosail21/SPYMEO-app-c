// Cdw-Spm: Composant de recherche de praticiens
"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";

type Practitioner = {
  id: string;
  slug: string;
  name: string;
  specialties: string[];
  description: string | null;
  city: string | null;
  postalCode: string | null;
  featured: boolean;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PractitionerSearch() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [page, setPage] = useState(1);

  // Construire l'URL de l'API avec les filtres
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (cityFilter) params.append("city", cityFilter);
    if (specialtyFilter) params.append("specialty", specialtyFilter);
    params.append("page", page.toString());
    params.append("limit", "20");

    return `/api/public/practitioners?${params.toString()}`;
  }, [searchQuery, cityFilter, specialtyFilter, page]);

  const { data, error, isLoading } = useSWR(apiUrl, fetcher);

  const practitioners: Practitioner[] = data?.practitioners || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  // Liste des spécialités pour le filtre
  const allSpecialties = [
    "Naturopathie",
    "Sophrologie",
    "Réflexologie",
    "Hypnose",
    "Nutrition",
    "Massage bien-être",
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1); // Reset à la page 1 lors d'une nouvelle recherche
  }

  return (
    <section className="section">
      <div className="container-spy">
        <header className="universe-head mb-2">
          <h1 className="text-3xl font-semibold mb-1">Recherche de Praticiens</h1>
          <p className="text-muted">
            Affinez par discipline, ville, disponibilité…
          </p>

          {/* Barre de recherche */}
          <form className="search search-lg" onSubmit={handleSearch} role="search">
            <input
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Praticien, ville, spécialité…"
              aria-label="Rechercher"
            />

            <button className="btn" type="submit">
              Rechercher
            </button>
          </form>
        </header>

        <div className="results-layout">
          {/* Filtres */}
          <aside className="filters">
            <div className="filter-group">
              <h3>Spécialité</h3>
              <select
                className="w-full rounded-md border border-border p-2"
                value={specialtyFilter}
                onChange={(e) => {
                  setSpecialtyFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Toutes</option>
                {allSpecialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h3>Ville</h3>
              <input
                className="w-full rounded-md border border-border p-2"
                placeholder="Dijon, Lyon…"
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Bouton réinitialiser */}
            {(searchQuery || cityFilter || specialtyFilter) && (
              <button
                className="btn btn-ghost w-full"
                onClick={() => {
                  setSearchQuery("");
                  setCityFilter("");
                  setSpecialtyFilter("");
                  setPage(1);
                }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </aside>

          {/* Résultats */}
          <div>
            <div className="results-header">
              <div className="text-muted">
                {isLoading
                  ? "Chargement..."
                  : `${pagination.total} résultat${pagination.total > 1 ? "s" : ""}`}
              </div>
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

            {isLoading ? (
              <div className="text-center py-12 text-muted">Chargement...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                Erreur lors du chargement des praticiens
              </div>
            ) : practitioners.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-muted">Aucun praticien trouvé</p>
                <p className="text-sm text-muted mt-2">
                  Essayez d'élargir vos critères de recherche
                </p>
              </div>
            ) : view === "grid" ? (
              <div className="grid-3">
                {practitioners.map((p) => (
                  <article key={p.id} className="profile-card">
                    <button
                      className="like"
                      aria-label="Ajouter aux favoris"
                      onClick={() => alert("Connexion requise pour ajouter aux favoris")}
                    >
                      ♡
                    </button>
                    <Link
                      className="profile-cover"
                      href={`/praticien/${p.slug}`}
                      aria-label={`Voir le profil de ${p.name}`}
                    />
                    <div className="profile-body">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold">{p.name}</h3>
                        {p.featured && <span className="badge">⭐ Vérifié</span>}
                      </div>
                      <p className="text-muted">
                        {p.city || "France"}
                        {p.postalCode && ` (${p.postalCode})`}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {p.specialties.slice(0, 3).map((s) => (
                          <span key={s} className="badge">
                            {s}
                          </span>
                        ))}
                        {p.specialties.length > 3 && (
                          <span className="badge">+{p.specialties.length - 3}</span>
                        )}
                      </div>

                      {p.description && (
                        <p className="text-sm text-muted line-clamp-2 mb-3">
                          {p.description}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Link className="btn btn-ghost" href={`/praticien/${p.slug}`}>
                          Voir
                        </Link>
                        <Link className="btn" href={`/praticien/${p.slug}`}>
                          Prendre RDV
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <ul className="list">
                {practitioners.map((p) => (
                  <li
                    key={p.id}
                    className="list-row hover:-translate-y-0.5 transition"
                  >
                    <div className="list-media" />
                    <div className="list-body">
                      <div className="list-head">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {p.name}
                          {p.featured && <span className="badge">⭐ Vérifié</span>}
                        </h3>
                      </div>
                      <p className="list-desc">
                        {p.specialties.join(", ")} • {p.city || "France"}
                      </p>
                      {p.description && (
                        <p className="text-sm text-muted line-clamp-2 mt-1">
                          {p.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Link className="btn btn-ghost" href={`/praticien/${p.slug}`}>
                          Voir
                        </Link>
                        <Link className="btn" href={`/praticien/${p.slug}`}>
                          Prendre RDV
                        </Link>
                      </div>
                    </div>
                    <button
                      className="like"
                      aria-label="Ajouter aux favoris"
                      onClick={() => alert("Connexion requise pour ajouter aux favoris")}
                    >
                      ♡
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  className="page"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Précédent
                </button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`page ${page === pageNum ? "page-active" : ""}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {pagination.totalPages > 5 && page < pagination.totalPages - 2 && (
                  <span className="page">...</span>
                )}

                <button
                  className="page"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Suivant
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
