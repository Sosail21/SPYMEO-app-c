// Cdw-Spm: PASS Payment Page
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PassPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    // TODO: Intégration Stripe
    // Pour le moment, simulation
    alert('Intégration Stripe à venir. Redirection vers tableau de bord...');

    // Simuler une courte attente
    setTimeout(() => {
      router.push('/user/tableau-de-bord');
    }, 1000);
  };

  if (!userId) {
    return (
      <main className="section">
        <div className="container-spy max-w-2xl">
          <div className="soft-card p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600">Erreur</h2>
            <p className="mt-2">Lien de paiement invalide</p>
            <button className="btn mt-4" onClick={() => router.push('/')}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container-spy max-w-2xl">
        <div className="soft-card p-8">
          <h1 className="text-3xl font-bold mb-4">Abonnement PASS</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Inclus dans le PASS :</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Carnet de vie numérique personnalisé</li>
              <li>Ressources premium mensuelles</li>
              <li>Réductions chez les partenaires</li>
              <li>Support prioritaire</li>
              <li>Accès aux événements exclusifs</li>
            </ul>
          </div>

          <div className="bg-accent/10 p-6 rounded-lg mb-6">
            <div className="text-3xl font-bold">29,90€</div>
            <div className="text-muted">par mois, sans engagement</div>
          </div>

          <button
            className="btn w-full text-lg py-3"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? 'Traitement...' : '💳 Payer maintenant'}
          </button>

          <p className="text-sm text-muted mt-4 text-center">
            Paiement sécurisé par Stripe
          </p>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold mb-2">Informations</h3>
            <ul className="text-sm space-y-1 text-slate-600">
              <li>✓ Annulation possible à tout moment</li>
              <li>✓ Accès immédiat après paiement</li>
              <li>✓ Facturation automatique mensuelle</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
