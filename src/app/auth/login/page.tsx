// Cdw-Spm
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function nextForRole(role?: string) {
  switch (role) {
    case "PASS_USER": return "/pass/tableau-de-bord";
    case "FREE_USER": return "/user/tableau-de-bord";
    case "PRACTITIONER":
    case "ARTISAN":
    case "COMMERÇANT":
    case "CENTER":     return "/pro/dashboard";
    case "ADMIN":      return "/admin";
    default:           return "/";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Erreur de connexion");
      const wanted = sp.get("next");
      router.push((wanted || nextForRole(data.role)) as any);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section">
      <div className="container-spy max-w-xl mx-auto">
        <div className="auth-card">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2 text-[#0b1239]">Bienvenue sur SPYMEO</h1>
            <p className="text-muted">Connectez-vous à votre compte</p>
          </div>

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Adresse email</span>
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

            <label className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Mot de passe</span>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-accent hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                className="page"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </label>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button className="btn w-full" type="submit" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-muted mb-3">
              Vous n'avez pas encore de compte ?
            </p>
            <Link
              href="/auth/signup"
              className="btn w-full bg-white border-2 border-accent text-accent hover:bg-accent/5"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
