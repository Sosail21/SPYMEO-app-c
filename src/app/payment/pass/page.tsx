// Cdw-Spm: PASS Payment Page with Stripe
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PassPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      router.push('/auth/signup');
    }
  }, [userId, router]);

  const handlePayment = async () => {
    if (!userId) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          plan: selectedPlan,
          type: 'PASS',
        }),
      });

      const data = await res.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Erreur lors de la création de la session de paiement');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const monthlyPrice = 6.90;
  const annualPrice = 69;
  const monthlySavings = ((monthlyPrice * 12) - annualPrice).toFixed(2);

  return (
    <main className="section">
      <div className="container-spy max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">✨ SPYMEO PASS</h1>
          <p className="text-lg text-gray-600">
            Accédez à toutes les fonctionnalités premium de SPYMEO
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
              selectedPlan === 'monthly'
                ? 'border-accent bg-accent/5 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">PASS Mensuel</h3>
              {selectedPlan === 'monthly' && (
                <span className="px-3 py-1 bg-accent text-white text-sm rounded-full">
                  Sélectionné
                </span>
              )}
            </div>
            <div className="mb-4">
              <span className="text-4xl font-bold">{monthlyPrice} €</span>
              <span className="text-gray-600"> /mois</span>
            </div>
            <p className="text-sm text-gray-600">
              Facturation mensuelle • Sans engagement
            </p>
          </div>

          <div
            onClick={() => setSelectedPlan('annual')}
            className={`cursor-pointer p-6 rounded-lg border-2 transition-all relative ${
              selectedPlan === 'annual'
                ? 'border-accent bg-accent/5 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs rounded-full font-semibold">
              Économisez {monthlySavings} €
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">PASS Annuel</h3>
              {selectedPlan === 'annual' && (
                <span className="px-3 py-1 bg-accent text-white text-sm rounded-full">
                  Sélectionné
                </span>
              )}
            </div>
            <div className="mb-4">
              <span className="text-4xl font-bold">{annualPrice} €</span>
              <span className="text-gray-600"> /an</span>
            </div>
            <p className="text-sm text-gray-600">
              Soit {(annualPrice / 12).toFixed(2)} €/mois • Meilleure offre
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-xl font-semibold mb-4">✨ Inclus dans votre PASS :</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl">✓</span>
              <div>
                <strong>Carnet de vie personnel</strong>
                <p className="text-sm text-gray-600">Suivez votre évolution et vos objectifs bien-être</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl">✓</span>
              <div>
                <strong>Ressources premium</strong>
                <p className="text-sm text-gray-600">Accès exclusif à des contenus de qualité</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl">✓</span>
              <div>
                <strong>Réductions exclusives</strong>
                <p className="text-sm text-gray-600">Profitez d'offres spéciales chez nos partenaires</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl">✓</span>
              <div>
                <strong>Profil enrichi</strong>
                <p className="text-sm text-gray-600">Plus d'options de personnalisation</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent text-xl">✓</span>
              <div>
                <strong>Support prioritaire</strong>
                <p className="text-sm text-gray-600">Assistance dédiée pour vos questions</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn btn-lg px-8 py-4 text-lg"
          >
            {loading ? (
              'Redirection vers le paiement...'
            ) : (
              <>
                🔒 Payer {selectedPlan === 'monthly' ? `${monthlyPrice} €/mois` : `${annualPrice} €/an`}
              </>
            )}
          </button>
          <p className="text-sm text-gray-600 mt-4">
            Paiement sécurisé par Stripe • Annulation possible à tout moment
          </p>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-gray-600 hover:text-accent transition"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </main>
  );
}

export default function PassPaymentPage() {
  return (
    <Suspense fallback={<div className="section"><div className="container-spy text-center">Chargement...</div></div>}>
      <PassPaymentContent />
    </Suspense>
  );
}
