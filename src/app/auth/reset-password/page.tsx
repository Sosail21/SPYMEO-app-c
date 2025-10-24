// Cdw-Spm: Reset Password Page
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token de réinitialisation manquant");
    }
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Token de réinitialisation manquant");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Erreur lors de la réinitialisation");
      }

      setSuccess(true);

      // Rediriger vers la page de login après 3 secondes
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="section">
        <div className="container-spy max-w-xl mx-auto">
          <div className="auth-card text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-semibold mb-3">Mot de passe réinitialisé !</h1>
            <p className="text-muted mb-6">
              Votre mot de passe a été modifié avec succès.
            </p>
            <p className="text-sm text-muted mb-6">
              Vous allez être redirigé vers la page de connexion...
            </p>
            <Link href="/auth/login" className="btn w-full">
              Se connecter maintenant
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container-spy max-w-xl mx-auto">
        <div className="auth-card">
          <h1 className="text-2xl font-semibold mb-2">Nouveau mot de passe</h1>
          <p className="text-muted mb-6">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="grid gap-1">
              <span className="text-sm text-muted">Nouveau mot de passe</span>
              <input
                className="page"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
                disabled={loading || !token}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-muted">Confirmer le mot de passe</span>
              <input
                className="page"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="Confirmez votre mot de passe"
                required
                minLength={6}
                disabled={loading || !token}
              />
            </label>

            {error && <div className="alert alert-error">{error}</div>}

            <button className="btn w-full" type="submit" disabled={loading || !token}>
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-sm text-accent hover:underline">
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="section">
        <div className="container-spy max-w-xl mx-auto">
          <div className="auth-card text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted">Chargement...</p>
          </div>
        </div>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
