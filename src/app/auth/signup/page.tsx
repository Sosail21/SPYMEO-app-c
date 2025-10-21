// Cdw-Spm: Signup Page with API Integration
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Role = "PASS_USER" | "PRACTITIONER" | "ARTISAN" | "COMMERCANT";

export default function Signup() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("PASS_USER");
  const [userPlan, setUserPlan] = useState<"FREE" | "PASS">("FREE");
  const [proStep, setProStep] = useState(0);
  const [mStep, setMStep] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const proSteps = ["Identité", "Pratique", "Éthique & pièces", "Récap"];
  const mSteps = ["Structure", "Offres", "Cotisation"];

  useEffect(() => {
    setProStep(0);
    setMStep(0);
    setError('');
    setSuccess('');
  }, [role]);

  const handleUserSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const password2 = formData.get('password2') as string;

    if (password !== password2) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password,
      userPlan,
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        if (result.redirectTo) {
          router.push(result.redirectTo);
        } else {
          setSuccess('Compte créé avec succès !');
          setTimeout(() => router.push('/auth/login'), 2000);
        }
      } else {
        setError(result.error || 'Erreur lors de la création du compte');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleProSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (proStep < 3) {
      setProStep(Math.min(3, proStep + 1));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      discipline: formData.get('discipline') as string,
      city: formData.get('city') as string,
      experience: Number(formData.get('experience')),
      ethics: formData.get('ethics') as string,
      documents: formData.get('documents') as string,
    };

    try {
      const res = await fetch('/api/auth/register-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.error || 'Erreur lors de la soumission');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleMerchantSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mStep < 2) {
      setMStep(Math.min(2, mStep + 1));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const data = {
      type: role as 'ARTISAN' | 'COMMERCANT',
      businessName: formData.get('businessName') as string,
      city: formData.get('city') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      categories: formData.get('categories') as string,
      description: formData.get('description') as string,
    };

    try {
      const res = await fetch('/api/auth/register-merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.error || 'Erreur lors de la soumission');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section">
      <div className="container-spy grid gap-4">
        <header>
          <h1 className="text-3xl font-semibold">Créer un compte</h1>
          <p className="text-muted">
            Choisissez votre profil et complétez les informations demandées.
          </p>
        </header>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
            {success}
          </div>
        )}

        <div className="auth-card">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold" htmlFor="role">
                Je suis…
              </label>
              <select
                id="role"
                className="w-full rounded-lg border border-border"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="PASS_USER">Particulier</option>
                <option value="PRACTITIONER">Praticien</option>
                <option value="ARTISAN">Artisan</option>
                <option value="COMMERCANT">Commerçant</option>
              </select>
            </div>

            {role === "PASS_USER" && (
              <div>
                <label className="font-semibold">Formule</label>
                <div className="chips-row">
                  <button
                    type="button"
                    onClick={() => setUserPlan("FREE")}
                    className={`chip ${userPlan === "FREE" ? "chip-active" : ""}`}
                  >
                    Gratuit
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserPlan("PASS")}
                    className={`chip ${userPlan === "PASS" ? "chip-active" : ""}`}
                  >
                    PASS
                  </button>
                </div>
                <p className="text-sm text-muted">
                  Gratuit : profil, favoris, recherche. PASS : + carnet de vie, ressources
                  premium, réductions.
                </p>
              </div>
            )}
          </div>
        </div>

        {role === "PASS_USER" && (
          <form className="auth-card auth-form" onSubmit={handleUserSubmit} noValidate>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold" htmlFor="name">
                  Nom complet
                </label>
                <input
                  id="name"
                  name="name"
                  className="w-full rounded-lg border border-border"
                  required
                />
              </div>
              <div>
                <label className="font-semibold" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full rounded-lg border border-border"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold" htmlFor="password">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  className="w-full rounded-lg border border-border"
                  required
                />
              </div>
              <div>
                <label className="font-semibold" htmlFor="password2">
                  Confirmation
                </label>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  minLength={8}
                  className="w-full rounded-lg border border-border"
                  required
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2">
              <input type="checkbox" required />
              <span>
                J'accepte les <a className="text-accent" href="/legal/cgu">CGU</a> et la{" "}
                <a className="text-accent" href="/legal/confidentialite">
                  politique de confidentialité
                </a>
                .
              </span>
            </label>

            <div className="flex gap-2 flex-wrap">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Création en cours...' : 'Créer mon compte'}
              </button>
              <a className="btn btn-outline" href="/auth/login">
                J'ai déjà un compte
              </a>
            </div>
          </form>
        )}

        {role === "PRACTITIONER" && (
          <form className="auth-card auth-form" onSubmit={handleProSubmit}>
            <div className="grid md:grid-cols-4 gap-2 stepper">
              {proSteps.map((s, i) => (
                <div key={s} className={`step ${i <= proStep ? "step-active" : ""}`}>
                  {i + 1}. {s}
                </div>
              ))}
            </div>

            {proStep === 0 && (
              <div className="step-pane">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Prénom</label>
                    <input
                      name="firstName"
                      className="w-full rounded-lg border border-border"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Nom</label>
                    <input
                      name="lastName"
                      className="w-full rounded-lg border border-border"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Email</label>
                    <input
                      name="email"
                      type="email"
                      className="w-full rounded-lg border border-border"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Mot de passe</label>
                    <input
                      name="password"
                      type="password"
                      minLength={8}
                      className="w-full rounded-lg border border-border"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {proStep === 1 && (
              <div className="step-pane">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Discipline principale</label>
                    <input
                      name="discipline"
                      className="w-full rounded-lg border border-border"
                      placeholder="Réflexologie"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Ville d'exercice</label>
                    <input
                      name="city"
                      className="w-full rounded-lg border border-border"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold">Années d'expérience</label>
                  <input
                    name="experience"
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-border"
                    required
                  />
                </div>
              </div>
            )}

            {proStep === 2 && (
              <div className="step-pane">
                <div>
                  <label className="font-semibold">Charte éthique</label>
                  <textarea
                    name="ethics"
                    className="w-full rounded-lg border border-border"
                    rows={4}
                    placeholder="Vos engagements (déontologie, non-substitution…)"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold">Pièces (liens)</label>
                  <input
                    name="documents"
                    className="w-full rounded-lg border border-border"
                    placeholder="Diplôme/assurance (URL)"
                  />
                </div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" required />
                  <span>Je certifie l'exactitude des informations.</span>
                </label>
              </div>
            )}

            {proStep === 3 && (
              <div className="step-pane">
                <div className="card">
                  <p className="text-muted">
                    Vérifiez vos informations puis envoyez votre candidature. Réponse sous{" "}
                    <strong>48h</strong> par email.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => setProStep(Math.max(0, proStep - 1))}
                disabled={proStep === 0 || loading}
              >
                Précédent
              </button>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Envoi...' : proStep === 3 ? "Envoyer ma candidature" : "Suivant"}
              </button>
            </div>
          </form>
        )}

        {(role === "ARTISAN" || role === "COMMERCANT") && (
          <form className="auth-card auth-form" onSubmit={handleMerchantSubmit}>
            <div className="grid md:grid-cols-3 gap-2 stepper">
              {mSteps.map((s, i) => (
                <div key={s} className={`step ${i <= mStep ? "step-active" : ""}`}>
                  {i + 1}. {s}
                </div>
              ))}
            </div>

            {mStep === 0 && (
              <div className="step-pane">
                <div>
                  <label className="font-semibold">Type</label>
                  <select
                    className="w-full rounded-lg border border-border"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <option value="ARTISAN">Artisan</option>
                    <option value="COMMERCANT">Commerçant</option>
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Raison sociale</label>
                    <input
                      name="businessName"
                      className="w-full rounded-lg border border-border"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Ville</label>
                    <input
                      name="city"
                      className="w-full rounded-lg border border-border"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Email</label>
                    <input
                      name="email"
                      type="email"
                      className="w-full rounded-lg border border-border"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Mot de passe</label>
                    <input
                      name="password"
                      type="password"
                      minLength={8}
                      className="w-full rounded-lg border border-border"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {mStep === 1 && (
              <div className="step-pane">
                <div>
                  <label className="font-semibold">Catégories d'offres</label>
                  <input
                    name="categories"
                    className="w-full rounded-lg border border-border"
                    placeholder="Hygiène, vrac, cosmétique…"
                  />
                </div>
                <div>
                  <label className="font-semibold">Description</label>
                  <textarea
                    name="description"
                    className="w-full rounded-lg border border-border"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {mStep === 2 && (
              <div className="step-pane">
                <p className="text-muted">
                  L'inscription comporte une <strong>cotisation</strong>, activation sous réserve
                  de vérifications (k-bis, site, etc.).
                </p>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" required />
                  <span>J'accepte les vérifications et la charte commerçant/artisan.</span>
                </label>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => setMStep(Math.max(0, mStep - 1))}
                disabled={mStep === 0 || loading}
              >
                Précédent
              </button>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Envoi...' : mStep === 2 ? "Soumettre mon inscription" : "Suivant"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
