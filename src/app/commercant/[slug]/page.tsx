import PassBadge from "@/components/public/PassBadge";

export default function Page() {
  // ⬇️ ID du commerçant (doit exister côté PASS partenaire)
  const userId = "c1";

  return (
    <>
      <section className="fiche-hero">
        <div className="fiche-hero-inner">
          <div className="fiche-avatar" />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1 flex items-center gap-3">
              <span>Épicerie Locale</span>
              {/* Badge PASS : s’affiche seulement si partenaire actif */}
              <PassBadge userId={userId} />
            </h1>
            <p className="text-muted">Vrac & bio · Quetigny</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="badge">Circuit court</span>
              {/* tu peux retirer ce badge statique si tu gardes le vrai PassBadge */}
              <span className="badge">Réduction PASS</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="fiche-layout">
          <article className="grid gap-4">
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
                      <h3 className="font-semibold">Produit {i}</h3>
                      <p className="text-sm text-muted">Description courte.</p>
                    </div>
                    <div className="grid gap-2 justify-items-end">
                      <strong>12,90€</strong>
                      <a className="btn" href="/produit/commercant/produit">
                        Voir
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <h2 className="font-semibold text-lg mb-2">Avis</h2>
              <div className="avis">
                <div className="avis-item">
                  <div className="avis-stars">★★★★☆</div>
                  <p>Super accueil et bons produits.</p>
                </div>
              </div>
            </section>
          </article>

          <aside className="grid gap-4">
            <div className="card">
              <h3 className="font-semibold mb-2">L’équipe</h3>
              <ul className="grid gap-2">
                <li>Paul — Gérant</li>
                <li>Inès — Conseillère</li>
              </ul>
            </div>
            <div className="map" />
          </aside>
        </div>
      </section>
    </>
  );
}
