// Cdw-Spm: Professional Payment Page
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { verifyPaymentToken } from '@/lib/jwt';

export default function ProPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [amount] = useState('49.90');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Lien de paiement manquant');
      return;
    }

    // Vérifier token
    const decoded = verifyPaymentToken(token);
    if (!decoded) {
      setError('Lien de paiement invalide ou expiré');
      return;
    }

    setValidToken(true);
  }, [token]);

  const handlePayment = async () => {
    setLoading(true);

    // TODO: Intégration Stripe
    alert('Intégration Stripe à venir. Simulation paiement...');

    // Simuler confirmation
    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          paymentIntentId: 'sim_' + Date.now(),
          amount: parseFloat(amount),
        }),
      });

      const result = await res.json();

      if (result.success) {
        alert('Paiement confirmé ! Redirection vers votre espace professionnel...');
        setTimeout(() => {
          router.push('/pro/dashboard');
        }, 1500);
      } else {
        alert('Erreur: ' + (result.error || 'Erreur inconnue'));
        setLoading(false);
      }
    } catch (err) {
      alert('Erreur réseau');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <main className="section">
        <div className="container-spy max-w-2xl">
          <div className="soft-card p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600">Erreur</h2>
            <p className="mt-2">{error}</p>
            <button className="btn mt-4" onClick={() => router.push('/')}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!validToken) {
    return (
      <main className="section">
        <div className="container-spy max-w-2xl">
          <div className="soft-card p-8 text-center">
            <p>Vérification du lien de paiement...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container-spy max-w-2xl">
        <div className="soft-card p-8">
          <h1 className="text-3xl font-bold mb-4">Abonnement Professionnel</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Votre compte professionnel inclut :</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Profil professionnel complet</li>
              <li>Gestion d'agenda en ligne</li>
              <li>Gestion des clients et consultations</li>
              <li>Statistiques avancées</li>
              <li>Accès au réseau professionnel SPYMEO</li>
              <li>Outils de facturation</li>
              <li>Support dédié</li>
            </ul>
          </div>

          <div className="bg-accent/10 p-6 rounded-lg mb-6">
            <div className="text-3xl font-bold">{amount}€</div>
            <div className="text-muted">par mois</div>
          </div>

          <button
            className="btn w-full text-lg py-3"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? 'Traitement en cours...' : '💳 Finaliser le paiement'}
          </button>

          <p className="text-sm text-muted mt-4 text-center">
            Paiement sécurisé • Facturation mensuelle
          </p>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold mb-2">Informations</h3>
            <ul className="text-sm space-y-1 text-slate-600">
              <li>✓ Accès immédiat à votre espace professionnel</li>
              <li>✓ Facturation le même jour chaque mois</li>
              <li>✓ Annulation possible avec préavis de 30 jours</li>
              <li>✓ Support disponible 7j/7</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
