// Cdw-Spm: Payment Success Page
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      router.push('/auth/login');
      return;
    }

    // Vérifier le paiement
    const verifyPayment = async () => {
      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (data.success) {
          setLoading(false);
          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setError(data.error || 'Erreur lors de la vérification du paiement');
          setLoading(false);
        }
      } catch (err) {
        setError('Erreur réseau');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, router]);

  if (loading) {
    return (
      <main className="section">
        <div className="container-spy max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-lg">Vérification de votre paiement...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="section">
        <div className="container-spy max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold mb-4">Erreur</h1>
          <p className="text-lg mb-6">{error}</p>
          <button onClick={() => router.push('/auth/login')} className="btn">
            Retour à la connexion
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container-spy max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-4">Paiement réussi !</h1>
        <p className="text-lg mb-2">
          Bienvenue dans SPYMEO PASS
        </p>
        <p className="text-gray-600 mb-6">
          Votre compte est maintenant actif avec toutes les fonctionnalités premium.
        </p>
        <p className="text-sm text-gray-500">
          Redirection vers votre dashboard dans quelques secondes...
        </p>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="section"><div className="container-spy text-center">Chargement...</div></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
