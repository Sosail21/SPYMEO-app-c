import PassBadge from "@/components/public/PassBadge";

export default function Page() {
  // ⬇️ ID du compte test artisan (emma.artisan@spymeo.test → "a1")
  const userId = "a1";

  return (
    <>
      <section className="fiche-hero">
        <div className="fiche-hero-inner">
          <div className="fiche-avatar" />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1 flex items-center gap-3">
              <span>Atelier Savon</span>
              {/* Badge PASS : visible uniquement si partenaire actif */}
              <PassBadge userId={userId} />
            </h1>
            <p className="text-muted">Savonnerie artisanale · Beaune</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="badge">Zéro déchet</span>
              <span className="badge">Local</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="fiche-layout">
          <article className="grid gap-4">
            {/* Description */}
            <section className="card">
              <h2 className="font-semibold text-lg mb-2">Description</h2>
              <p>Savons saponifiés à froid, ingrédients bio et locaux.</p>
            </section>

            {/* Catalogue */}
            <section className="card">
              <h2 className="font-semibold text-lg mb-2">Catalogue</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[84px_1fr_auto] gap-3 items-center card p-3"
                  >
                    <div className="w-21 h-21 rounded-xl bg-[#e6eef2]" />
                    <div>
                      <h3 className="font-semibold">Savon n°{i}</h3>
                      <p className="text-sm text-muted">
                        Huile d’olive, coco, karité.
                      </p>
                    </div>
                    <div className="grid gap-2 justify-items-end">
                      <strong>7,90€</strong>
                      <a className="btn" href="/produit/artisan/savon">
                        Voir
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Avis */}
            <section className="card">
              <h2 className="font-semibold text-lg mb-2">Avis</h2>
              <div className="avis">
                <div className="avis-item">
                  <div className="avis-stars">★★★★★</div>
                  <p>Sent bon et dure longtemps !</p>
                </div>
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="grid gap-4">
            <div className="card">
              <h3 className="font-semibold mb-2">Équipe</h3>
              <ul className="grid gap-2">
                <li>Camille — Fondatrice</li>
                <li>Mathis — Production</li>
              </ul>
            </div>
            <div className="map" />
          </aside>
        </div>
      </section>
    </>
  );
}
