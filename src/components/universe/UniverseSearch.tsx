// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// ---- Types ---------------------------------------------------------------

export type PassPartner = {
  enabled: boolean;
  rate: 5 | 10 | 15 | 20 | 25 | 30;
};

export type UniverseItem = {
  id: string;
  name: string;
  title: string;
  city: string;
  distanceKm: number;
  tags: string[];
  affinity: number;

  // 👇 Nouveau (optionnels pour rétro-compat)
  userId?: string;                 // identifiant du pro côté PASS
  passPartner?: PassPartner;       // si tu veux injecter directement le statut PASS
};

type Props = {
  title: string;
  subtitle: string;
  basePath: "/praticien" | "/artisan" | "/commercant" | "/centre-de-formation";
  items: UniverseItem[];
  tariffLabel?: string;
  specialties?: string[];
  formats?: string[];
  availabilities?: string[];

  /**
   * Si true et si items[].userId est défini, UniverseSearch fera
   * un fetch vers /api/public/pass/[userId] pour enrichir l'affichage.
   * Par défaut false pour ne rien casser.
   */
  fetchPassStatus?: boolean;
};

// ---- Petit badge inline --------------------------------------------------

function PassBadgeInline({ partner }: { partner?: PassPartner }) {
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

// ---- Composant principal -------------------------------------------------

export default function UniverseSearch({
  title,
  subtitle,
  basePath,
  items,
  tariffLabel = "Tarif max",
  specialties = [],
  formats = ["Cabinet", "Domicile", "Visio"],
  availabilities = ["Aujourd’hui", "Cette semaine", "Soir & week-end"],
  fetchPassStatus = false,
}: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [maxPrice, setMaxPrice] = useState(60);

  // Filtres simples UI
  const [cityFilter, setCityFilter] = useState<string>("");
  const [passOnly, setPassOnly] = useState<boolean>(false);

  // État local pour enrichir les items avec passPartner (si fetchPassStatus = true)
  const [passByUserId, setPassByUserId] = useState<Record<string, PassPartner>>({});

  // Optionnel : auto-fetch du statut PASS si demandé
  useEffect(() => {
    if (!fetchPassStatus) return;

    // collecter les userId uniques à requêter
    const ids = Array.from(
      new Set(items.map((it) => it.userId).filter(Boolean) as string[])
    ).filter((uid) => !(uid in passByUserId)); // éviter les doublons déjà chargés

    if (ids.length === 0) return;

    let cancelled = false;
    (async () => {
      const entries: [string, PassPartner][] = [];
      for (const uid of ids) {
        try {
          const r = await fetch(`/api/public/pass/${uid}`, { cache: "no-store" });
          if (r.ok) {
            const data = (await r.json()) as { enabled: boolean; rate: number };
            // clamp rate sur nos valeurs possibles
            const rateAllowed = [5, 10, 15, 20, 25, 30] as const;
            const rate = (rateAllowed.includes(data.rate as any) ? data.rate : 10) as PassPartner["rate"];
            entries.push([uid, { enabled: !!data.enabled, rate }]);
          }
        } catch {
          // ignore erreur réseau
        }
      }
      if (!cancelled && entries.length) {
        setPassByUserId((prev) => {
          const next = { ...prev };
          for (const [uid, p] of entries) next[uid] = p;
          return next;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchPassStatus, items, passByUserId]);

  // Fusionner la source du statut PASS : priorité à item.passPartner si fourni, sinon map local (fetch)
  const itemsWithPass: UniverseItem[] = useMemo(() => {
    return items.map((it) => {
      const enriched = { ...it };
      if (!enriched.passPartner && enriched.userId && passByUserId[enriched.userId]) {
        enriched.passPartner = passByUserId[enriched.userId];
      }
      return enriched;
    });
  }, [items, passByUserId]);

  const filtered = useMemo(() => {
    let data = [...itemsWithPass];

    if (cityFilter.trim()) {
      const c = cityFilter.trim().toLowerCase();
      data = data.filter((p) => p.city.toLowerCase().includes(c));
    }
    if (passOnly) {
      data = data.filter((p) => p.passPartner?.enabled);
    }

    return data;
  }, [itemsWithPass, cityFilter, passOnly]);

  const count = filtered.length;

  return (
    <main className="section">
      <div className="container-spy">
        <header className="mb-4">
          <h1 className="text-3xl font-semibold mb-1">{title}</h1>
          <p className="text-muted">{subtitle}</p>
        </header>

        <form className="search-wrap mb-3" action="/recherche" onSubmit={(e)=>e.preventDefault()}>
          <input className="input-pill" name="q" placeholder="Ex : mot-clé, spécialité…" />
          <input
            className="input-pill"
            name="city"
            placeholder="Ville ou code postal"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />
          <select name="radius" className="pill pill-muted" defaultValue="20">
            <option value="20">20 km</option>
            <option value="10">10 km</option>
            <option value="50">50 km</option>
          </select>
          <button className="pill pill-solid" type="submit">Chercher</button>
        </form>

        <div className="chips-row">
          <button className="pill pill-solid" type="button">Disponible cette semaine</button>
          <button className="pill pill-muted" type="button">Proche de moi</button>
          <button className="pill pill-muted" type="button">À distance</button>
          <button className="pill pill-muted" type="button">Éthique vérifiée</button>
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr] mt-4">
          <aside className="soft-card p-4 h-fit">
            {specialties.length > 0 && (
              <section className="mb-4">
                <h3 className="text-sm text-muted mb-2">Spécialités</h3>
                <ul className="grid gap-2">
                  {specialties.map((s) => (
                    <li key={s} className="flex items-center gap-2">
                      <input id={s} type="checkbox" className="rounded" />
                      <label htmlFor={s}>{s}</label>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mb-4">
              <h3 className="text-sm text-muted mb-2">Format</h3>
              {formats.map((s) => (
                <label key={s} className="flex items-center gap-2 mb-2">
                  <input type="checkbox" className="rounded" /> {s}
                </label>
              ))}
            </section>

            <section className="mb-4">
              <h3 className="text-sm text-muted mb-2">Disponibilités</h3>
              {availabilities.map((s) => (
                <label key={s} className="flex items-center gap-2 mb-2">
                  <input type="checkbox" className="rounded" /> {s}
                </label>
              ))}
            </section>

            <section className="mb-4">
              <h3 className="text-sm text-muted mb-2">{tariffLabel}</h3>
              <input
                type="range"
                min={10}
                max={300}
                step={5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full range"
              />
              <div className="text-sm text-muted mt-1">Jusqu’à {maxPrice}€</div>
            </section>

            {/* 🔖 Filtre PASS */}
            <section className="mb-2">
              <h3 className="text-sm text-muted mb-2">Avantages</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={passOnly}
                  onChange={(e) => setPassOnly(e.target.checked)}
                />
                Partenaire PASS
              </label>
            </section>

            <div className="flex gap-2 mt-4">
              <button
                className="pill pill-ghost"
                type="button"
                onClick={() => {
                  setCityFilter("");
                  setPassOnly(false);
                  setMaxPrice(60);
                }}
              >
                Réinitialiser
              </button>
              <button className="pill pill-solid" type="button">Appliquer</button>
            </div>
          </aside>

          <div>
            <div className="toolbar mb-3">
              <div className="text-muted">{count} résultats</div>
              <div className="segmented">
                <button
                  className={view === "grid" ? "is-active" : ""}
                  onClick={() => setView("grid")}
                  type="button"
                >
                  Cartes
                </button>
                <button
                  className={view === "list" ? "is-active" : ""}
                  onClick={() => setView("list")}
                  type="button"
                >
                  Liste
                </button>
              </div>
            </div>

            {view === "grid" ? (
              <div className="grid gap-5 md:grid-cols-3">
                {filtered.map((p) => (
                  <article
                    key={p.id}
                    className="soft-card overflow-hidden relative transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
                  >
                    <button aria-label="Ajouter aux favoris" className="like-btn">♡</button>
                    <div className="h-36 bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)]" />
                    <div className="p-4 grid gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold leading-tight flex items-center gap-2">
                          {p.name}
                          <PassBadgeInline partner={p.passPartner} />
                        </h3>
                        <span className="affinity">{p.affinity}% affinité</span>
                      </div>
                      <p className="text-sm text-muted">
                        {p.title} · {p.city} · {p.distanceKm} km
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {p.tags.map((t) => (
                          <span key={t} className="pill pill-muted">{t}</span>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Link className="pill pill-ghost text-center flex-1" href={`${basePath}/${p.id}`}>
                          Voir la fiche
                        </Link>
                        <Link className="pill pill-solid text-center flex-1" href={`${basePath}/${p.id}`}>
                          {basePath === "/centre-de-formation" ? "S’inscrire" : "Prendre RDV"}
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <ul className="grid gap-4">
                {filtered.map((p) => (
                  <li
                    key={p.id}
                    className="soft-card p-4 relative transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
                  >
                    <button aria-label="Ajouter aux favoris" className="like-btn">♡</button>
                    <div className="grid md:grid-cols-[160px_1fr_auto] gap-4 items-center">
                      <div className="h-28 rounded-xl bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)]" />
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2">
                            {p.name}
                            <PassBadgeInline partner={p.passPartner} />
                          </h3>
                          <span className="affinity">{p.affinity}% affinité</span>
                        </div>
                        <p className="text-sm text-muted">
                          {p.title} · {p.city} · {p.distanceKm} km
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {p.tags.map((t) => <span key={t} className="pill pill-muted">{t}</span>)}
                        </div>
                      </div>
                      <div className="grid gap-2 md:justify-items-end">
                        <Link className="pill pill-ghost text-center" href={`${basePath}/${p.id}`}>Voir la fiche</Link>
                        <Link className="pill pill-solid text-center" href={`${basePath}/${p.id}`}>
                          {basePath === "/centre-de-formation" ? "S’inscrire" : "Prendre RDV"}
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <nav className="pagination mt-4" aria-label="Pagination">
              <a className="page" href="#">Précédent</a>
              <a className="page page-active" href="#">1</a>
              <a className="page" href="#">2</a>
              <a className="page" href="#">3</a>
              <a className="page" href="#">Suivant</a>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
