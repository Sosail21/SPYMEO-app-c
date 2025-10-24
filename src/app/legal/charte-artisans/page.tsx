// Cdw-Spm: Charte SPYMEO pour les artisans
export default function CharteArtisansPage() {
  return (
    <main className="section">
      <div className="container-spy max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Charte des Artisans SPYMEO</h1>
          <p className="text-gray-600">
            Valeurs et engagements des artisans référencés sur la plateforme
          </p>
        </header>

        <div className="prose prose-lg max-w-none space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">Préambule</h2>
            <p>
              La plateforme SPYMEO a pour mission de mettre en relation des particuliers avec des
              artisans du bien-être et de la santé naturelle de confiance. Cette charte définit
              les valeurs et les engagements que doivent respecter tous les artisans référencés
              sur notre plateforme.
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">1. Qualité et Savoir-Faire</h2>
            <p className="mb-3">
              Les artisans s'engagent à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exercer leur métier avec expertise et passion</li>
              <li>Garantir la qualité de leurs créations et services</li>
              <li>Utiliser des matières premières de qualité et traçables</li>
              <li>Respecter les normes et réglementations en vigueur</li>
              <li>Maintenir leurs compétences à jour par la formation continue</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">2. Éthique et Transparence</h2>
            <p className="mb-3">
              Les artisans s'engagent à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Présenter de manière honnête leurs produits et services</li>
              <li>Afficher clairement leurs tarifs et conditions de vente</li>
              <li>Respecter les délais annoncés</li>
              <li>Informer le client de la composition et de l'origine des produits</li>
              <li>Ne faire aucune allégation mensongère sur les bienfaits de leurs créations</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">3. Respect du Client</h2>
            <p className="mb-3">
              Les artisans s'engagent à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Traiter chaque client avec respect et courtoisie</li>
              <li>Être à l'écoute des besoins et attentes du client</li>
              <li>Répondre aux demandes dans des délais raisonnables</li>
              <li>Gérer les réclamations de manière professionnelle</li>
              <li>Respecter la confidentialité des informations clients</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">4. Démarche Responsable</h2>
            <p className="mb-3">
              Les artisans s'engagent à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Privilégier les circuits courts et les matières locales quand c'est possible</li>
              <li>Minimiser l'impact environnemental de leur activité</li>
              <li>Respecter les principes du développement durable</li>
              <li>Favoriser les pratiques écoresponsables</li>
              <li>Promouvoir une consommation raisonnée</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">5. Conformité Légale</h2>
            <p className="mb-3">
              Les artisans s'engagent à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exercer leur activité dans le cadre légal (SIRET, assurances...)</li>
              <li>Respecter la réglementation applicable à leur secteur</li>
              <li>Honorer leurs obligations fiscales et sociales</li>
              <li>Disposer des assurances professionnelles nécessaires</li>
              <li>Respecter le droit de la consommation et le RGPD</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">6. Engagement envers la Plateforme</h2>
            <p className="mb-3">
              Les artisans s'engagent à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintenir leur profil à jour avec des informations exactes</li>
              <li>Répondre aux messages des clients via la plateforme</li>
              <li>Respecter les valeurs et la philosophie de SPYMEO</li>
              <li>Signaler tout comportement inapproprié</li>
              <li>Participer à l'amélioration continue de la plateforme</li>
            </ul>
          </section>

          <section className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h2 className="text-2xl font-semibold mb-4">Non-respect de la Charte</h2>
            <p>
              Le non-respect de cette charte peut entraîner des sanctions allant d'un avertissement
              à la suspension définitive du compte sur la plateforme SPYMEO. SPYMEO se réserve le
              droit de vérifier à tout moment la conformité des artisans à cette charte.
            </p>
          </section>

          <section className="bg-accent text-white p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Acceptation</h2>
            <p>
              En créant un compte artisan sur SPYMEO, vous reconnaissez avoir pris connaissance
              de cette charte et vous vous engagez à en respecter l'ensemble des principes.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/auth/signup"
            className="inline-block px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
          >
            Retour à l'inscription
          </a>
        </div>
      </div>
    </main>
  );
}
