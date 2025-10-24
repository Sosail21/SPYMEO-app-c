// Cdw-Spm: Forgot Password Page
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Erreur lors de l'envoi");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="section">
        <div className="container-spy max-w-xl mx-auto">
          <div className="auth-card text-center">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-semibold mb-3">Email envoyé !</h1>
            <p className="text-muted mb-6">
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email contenant un lien de réinitialisation.
            </p>
            <p className="text-sm text-muted mb-6">
              Vérifiez votre boîte de réception et vos spams. Le lien est valable pendant 1 heure.
            </p>
            <Link href="/auth/login" className="btn w-full">
              Retour à la connexion
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
          <h1 className="text-2xl font-semibold mb-2">Mot de passe oublié ?</h1>
          <p className="text-muted mb-6">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="grid gap-1">
              <span className="text-sm text-muted">Adresse email</span>
              <input
                className="page"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </label>

            {error && <div className="alert alert-error">{error}</div>}

            <button className="btn w-full" type="submit" disabled={loading}>
              {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
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
