import PassBadge from "@/components/public/PassBadge";

export default function Page() {
  // ⬇️ ID du centre (doit correspondre à celui stocké côté PASS Partenaire)
  const userId = "t1";

  return (
    <>
      <section className="fiche-hero">
        <div className="fiche-hero-inner">
          <div className="fiche-avatar" />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1 flex items-center gap-3">
              <span>Centre Horizon</span>
              {/* Badge PASS : s’affiche seulement si le centre est partenaire */}
              <PassBadge userId={userId} />
            </h1>
            <p className="text-muted">Formations bien-être · Dole</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="badge">Certification</span>
              <span className="badge">Petits groupes</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="fiche-layout">
          <article className="grid gap-4">
            <section className="card">
              <h2 className="font-semibold text-lg mb-2">Intervenants</h2>
              <ul className="grid gap-2">
                <li>Dr. Caron — Physiologie</li>
                <li>Anna Lopez — Pratiques manuelles</li>
              </ul>
            </section>

            <section className="card">
              <h2 className="font-semibold text-lg mb-2">Programmes & Sessions</h2>
              <div className="grid gap-3">
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Massage bien-être (niveau 1)</strong>
                      <p className="text-sm text-muted">Du 12 au 14 oct. · 18h</p>
                    </div>
                    <div className="flex gap-2">
                      <a className="btn btn-ghost" href="#">Détails</a>
                      <a className="btn" href="#">S’inscrire</a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <h2 className="font-semibold text-lg mb-2">Avis</h2>
              <div className="avis">
                <div className="avis-item">
                  <div className="avis-stars">★★★★★</div>
                  <p>Excellente pédagogie.</p>
                </div>
              </div>
            </section>
          </article>

          <aside className="grid gap-4">
            <div className="card">
              <h3 className="font-semibold mb-2">Admissions</h3>
              <p>Dossier + entretien. Réponse sous 7 jours.</p>
            </div>
            <div className="map" />
          </aside>
        </div>
      </section>
    </>
  );
}