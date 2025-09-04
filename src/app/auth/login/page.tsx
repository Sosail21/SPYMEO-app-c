"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function redirectForRole(role?: string) {
  switch (role) {
    case "PASS_USER":
      return "/pass/tableau-de-bord";
    case "FREE_USER":
      return "/user/tableau-de-bord";
    case "PRACTITIONER":
      return "/praticiens"; // TODO: /praticien/dashboard quand prêt
    case "ADMIN":
      return "/admin";
    default:
      return "/user/tableau-de-bord";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data?.error ?? "Erreur de connexion");
      return;
    }
    // Priorité au param ?next=..., sinon route par rôle
    const nextParam = params.get("next");
    const to = nextParam && nextParam.startsWith("/") ? nextParam : redirectForRole(data?.user?.role);
    router.replace(to);
  }

  return (
    <main className="section">
      <div className="container-spy">
        <div className="auth-card">
          <h1 className="section-title m-0 mb-2">Connexion</h1>
          <p className="muted">Comptes de test : gratuit, PASS, praticien, admin.</p>

          <div className="alert">
            <div className="text-sm">
              <div><strong>Gratuit :</strong> alice.free@spymeo.test / azerty123</div>
              <div><strong>PASS :</strong> paul.pass@spymeo.test / azerty123</div>
              <div><strong>Praticien :</strong> leo.pro@spymeo.test / azerty123</div>
              <div><strong>Admin :</strong> admin@spymeo.test / admin123</div>
            </div>
          </div>

          {err && <div className="alert alert-error mt-3">{err}</div>}

          <form className="auth-form mt-4" onSubmit={onSubmit}>
            <div className="grid gap-1">
              <label>Email</label>
              <input
                className="page w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="vous@exemple.com"
                required
              />
            </div>

            <div className="grid gap-1">
              <label>Mot de passe</label>
              <input
                className="page w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button className="btn mt-2" type="submit">Se connecter</button>
          </form>
        </div>
      </div>
    </main>
  );
}