// Cdw-Spm: Charte SPYMEO pour les praticiens
export default function ChartePraticiensPage() {
  return (
    <main className="section">
      <div className="container-spy max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Charte des Praticiens SPYMEO</h1>
          <p className="text-gray-600">
            Valeurs et engagements des professionnels référencés sur la plateforme
          </p>
        </header>

        <div className="prose prose-lg max-w-none space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">Préambule</h2>
            <p>
              La plateforme SPYMEO a pour mission de mettre en relation des particuliers avec des
              professionnels du bien-être et de la santé naturelle de confiance. Cette charte définit
              les valeurs et les engagements que doivent respecter tous les praticiens référencés
              sur notre plateforme.
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">1. Compétence et Formation</h2>
            <p className="mb-3">
              Les praticiens s'engagent à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exercer uniquement dans leur domaine de compétence</li>
              <li>Maintenir leurs connaissances à jour par une formation continue</li>
              <li>Fournir des justificatifs de formation valides et à jour</li>
              <li>Ne pas usurper un titre ou une qualification qu'ils ne possèdent pas</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">2. Éthique et Déontologie</h2>
            <p className="mb-3">
              Les praticiens s'engagent à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respecter la dignité, l'autonomie et la vie privée de leurs clients</li>
              <li>Maintenir la confidentialité des informations personnelles et médicales</li>
              <li>Ne jamais profiter de la vulnérabilité d'un client</li>
              <li>Refuser toute forme de discrimination</li>
              <li>Obtenir le consentement éclairé avant toute intervention</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">3. Cadre Légal</h2>
            <p className="mb-3">
              Les praticiens s'engagent à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Exercer dans le respect de la législation française en vigueur</li>
              <li>Disposer d'une assurance responsabilité civile professionnelle à jour</li>
              <li>Ne pas établir de diagnostic médical (réservé aux médecins)</li>
              <li>Ne pas prescrire de médicaments</li>
              <li>Orienter vers un médecin en cas de besoin</li>
              <li>Tenir à jour les documents obligatoires (Kbis, SIRET, etc.)</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">4. Transparence</h2>
            <p className="mb-3">
              Les praticiens s'engagent à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Communiquer clairement leurs tarifs</li>
              <li>Informer sur la durée et la fréquence des séances recommandées</li>
              <li>Expliquer clairement les limites de leur pratique</li>
              <li>Ne pas faire de promesses de guérison</li>
              <li>Maintenir à jour leur profil sur la plateforme</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">5. Respect de la Plateforme</h2>
            <p className="mb-3">
              Les praticiens s'engagent à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respecter les conditions générales d'utilisation de SPYMEO</li>
              <li>Ne pas utiliser la plateforme à des fins frauduleuses</li>
              <li>Répondre dans des délais raisonnables aux demandes des clients</li>
              <li>Signaler tout dysfonctionnement ou abus constaté</li>
              <li>Participer de bonne foi aux médiations en cas de litige</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-accent">6. Sanctions</h2>
            <p className="mb-3">
              En cas de manquement grave ou répété à cette charte, SPYMEO se réserve le droit de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Suspendre temporairement le profil du praticien</li>
              <li>Résilier l'accès à la plateforme</li>
              <li>Engager des poursuites judiciaires si nécessaire</li>
            </ul>
          </section>

          <section className="bg-accent/10 p-6 rounded-lg border-2 border-accent mt-8">
            <h2 className="text-2xl font-semibold mb-4">Engagement</h2>
            <p className="italic">
              En rejoignant la plateforme SPYMEO, je reconnais avoir pris connaissance de cette charte
              et m'engage à en respecter tous les principes et engagements.
            </p>
          </section>

          <div className="text-sm text-gray-500 mt-8 text-center">
            <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
