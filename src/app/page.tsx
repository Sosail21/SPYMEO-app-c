"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* HERO (gradient) */}
      <section className="hero py-10 md:py-14">
        <div className="container-spy">
          {/* largeur 80% centrée */}
          <div className="mx-auto w-[80%]">
            <div className="grid md:grid-cols-[1.1fr_.9fr] gap-10 items-center">
              <div>
                {/* titre légèrement moins gros */}
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Au cœur de la santé globale
                </h1>

                <p className="text-muted max-w-2xl">
                  Trouvez le bon praticien, découvrez des artisans engagés, et avancez pas à pas
                  vers votre bien‑être — au niveau local.
                </p>

                {/* Search pill : inputs plus larges + bouton arrondi comme le form */}
                <form className="search mt-4" action="/recherche">
                  <input
                    name="q"
                    placeholder="Naturopathe, sophrologue, réflexologue..."
                    className="flex-[2] min-w-0"
                  />
                  <input
                    name="city"
                    placeholder="Ville ou code postal"
                    className="flex-[1.5] min-w-0"
                  />
                  <select
                    name="radius"
                    className="hidden sm:block bg-[#f7fbfd] rounded-full px-3 py-2 border border-accent/25"
                  >
                    <option>20 km</option>
                    <option>10 km</option>
                    <option>50 km</option>
                  </select>
                  {/* bouton même radius que la search bar */}
                  <button className="btn rounded-full" type="submit">
                    Rechercher
                  </button>
                </form>

                {/* étiquettes non cliquables en tons pastel distincts */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full px-3 py-1 text-sm bg-emerald-50 text-emerald-700">
                    Éthique
                  </span>
                  <span className="rounded-full px-3 py-1 text-sm bg-sky-50 text-sky-700">
                    Local
                  </span>
                  <span className="rounded-full px-3 py-1 text-sm bg-violet-50 text-violet-700">
                    Intégral
                  </span>
                </div>
              </div>

              <div className="hero-visual" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* 1) Parcourir par univers — fond BLANC */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Parcourir par univers</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/praticiens", title: "Praticiens", desc: "Naturopathes, sophrologues, réflexologues…" },
              { href: "/artisans", title: "Artisans", desc: "Cosmétiques naturels, apiculteurs, savonniers…" },
              { href: "/commercants", title: "Commerçants", desc: "Boutiques locales engagées." },
              { href: "/centres-de-formation", title: "Centres de formation", desc: "Formations éthiques & sérieuses." },
            ].map((u) => (
              <Link
                key={u.href}
                href={u.href}
                className="card group transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)] focus:outline-none"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">{u.title}</span>
                  <span className="text-muted">{u.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2) Sélection près de chez vous — fond #edf4f6 */}
      <section className="section bg-[#edf4f6]">
        <div className="container-spy">
          <h2 className="section-title">Sélection près de chez vous</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { href: "/praticien/aline-dupont", title: "Aline Dupont", meta: "Naturopathe — Dijon" },
              { href: "/artisan/atelier-savon", title: "Atelier Savon", meta: "Artisan — Beaune" },
              { href: "/centre-de-formation/centre-horizon", title: "Centre Horizon", meta: "Centre de formation — Dijon" },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="card pro-card transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
              >
                <div className="pro-avatar" />
                <h3 className="pro-name font-semibold">{c.title}</h3>
                <p className="pro-meta">{c.meta}</p>
                <span className="btn btn-outline">Voir la fiche</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3) Comment ça marche ? — fond BLANC */}
      <section className="section bg-white">
        <div className="container-spy">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: "1", t: "Recherchez", d: "Trouvez un pro, un artisan ou un centre en fonction de vos besoins." },
              { n: "2", t: "Choisissez", d: "Comparez la fiche, l’éthique, la localisation et les disponibilités." },
              { n: "3", t: "Rencontrez", d: "Prenez rendez-vous et avancez à votre rythme. Le PASS ajoute des avantages." },
            ].map((s) => (
              <div
                key={s.n}
                className="card transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
              >
                <div className="step-num">{s.n}</div>
                <h3 className="font-semibold mb-1">{s.t}</h3>
                <p className="muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4) Derniers articles — fond #edf4f6 */}
      <section className="section bg-[#edf4f6]">
        <div className="container-spy">
          <h2 className="section-title">Derniers articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: "/blog/comprendre-errance-medicale", t: "Comprendre l’errance médicale", d: "Approche globale : pratiques alternatives, seconds avis, hygiène de vie…" },
              { href: "/blog/consommer-local-responsable", t: "Consommer local & responsable", d: "Des repères simples pour mieux choisir au quotidien." },
              { href: "/blog/bien-choisir-son-praticien", t: "Bien choisir son praticien", d: "Ce qui compte vraiment : écoute, compétence, cadre, suivi." },
            ].map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="post-card transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
              >
                <span className="post-cover" />
                <div className="post-body">
                  <h3 className="font-semibold">{p.t}</h3>
                  <p className="text-muted">{p.d}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA sombre */}
      <section className="section cta">
        <div className="container-spy cta-inner">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-1">Envie d’aller plus loin ?</h3>
            <p className="opacity-90">Créez votre compte ou découvrez le PASS.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/signup" className="btn">Créer mon compte</Link>
            <Link href="/pass" className="btn btn-outline">Découvrir le PASS</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
