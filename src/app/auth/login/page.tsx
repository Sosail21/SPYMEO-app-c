// Cdw-Spm
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [email, setEmail] = useState("leo.pro@spymeo.test");
  const [password, setPassword] = useState("azerty123");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const sp = useSearchParams();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
    }
  }

  return (
    <main className="section">
      <div className="container-spy max-w-xl mx-auto">
        <div className="auth-card">
          <h1 className="text-xl font-semibold mb-2">Connexion</h1>

          <div className="alert">
            <div className="text-sm">
              <b>Comptes de test :</b> gratuit, PASS, praticien, artisan, commerçant, centre, admin.
              <ul className="mt-1 grid gap-1">
                <li>Gratuit : <code>alice.free@spymeo.test</code> / <code>azerty123</code></li>
                <li>PASS : <code>paul.pass@spymeo.test</code> / <code>azerty123</code></li>
                <li>Praticien : <code>leo.pro@spymeo.test</code> / <code>azerty123</code></li>
                <li>Artisan : <code>emma.artisan@spymeo.test</code> / <code>azerty123</code></li>
                <li>Commerçant : <code>marc.commercant@spymeo.test</code> / <code>azerty123</code></li>
                <li>Centre : <code>clara.centre@spymeo.test</code> / <code>azerty123</code></li>
                <li>Admin : <code>admin@spymeo.test</code> / <code>admin123</code></li>
              </ul>
            </div>
          </div>

          <form className="auth-form mt-3" onSubmit={onSubmit}>
            <label className="grid gap-1">
              <span className="text-sm text-muted">Email</span>
              <input className="page" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-muted">Mot de passe</span>
              <input className="page" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>

            {error && <div className="alert alert-error">{error}</div>}

            <button className="btn w-full" type="submit">Se connecter</button>
          </form>
        </div>
      </div>
    </main>
  );
}
