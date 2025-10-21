// Cdw-Spm: Signup Page with API Integration - FIXED
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Role = "PASS_USER" | "PRACTITIONER" | "ARTISAN" | "COMMERCANT";

interface ProFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  discipline: string;
  city: string;
  experience: number;
  ethics: string;
  documents: string;
}

export default function Signup() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("PASS_USER");
  const [userPlan, setUserPlan] = useState<"FREE" | "PASS">("FREE");
  const [proStep, setProStep] = useState(0);
  const [mStep, setMStep] = useState(0);

  // Stockage des données du formulaire praticien
  const [proFormData, setProFormData] = useState<Partial<ProFormData>>({});

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
    setProFormData({});
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

  const handleProStepSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    // Sauvegarder les données de l'étape actuelle
    const currentStepData: any = {};
    formData.forEach((value, key) => {
      currentStepData[key] = value;
    });
    
    const updatedData = { ...proFormData, ...currentStepData };
    setProFormData(updatedData);

    // Si pas à la dernière étape, continuer
    if (proStep < 3) {
      setProStep(proStep + 1);
      return;
    }

    // Dernière étape : envoyer tout
    setLoading(true);
    setError('');
    setSuccess('');

    const data = {
      firstName: updatedData.firstName as string,
      lastName: updatedData.lastName as string,
      email: updatedData.email as string,
      password: updatedData.password as string,
      discipline: updatedData.discipline as string,
      city: updatedData.city as string,
      experience: Number(updatedData.experience),
      ethics: updatedData.ethics as string || '',
      documents: updatedData.documents as string || '',
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
      console.error('Erreur:', err);
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
                className="w-full rounded-lg border border-border p-2"
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
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setUserPlan("FREE")}
                    className={`px-4 py-2 rounded-lg border ${userPlan === "FREE" ? "bg-blue-500 text-white" : "bg-white"}`}
                  >
                    Gratuit
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserPlan("PASS")}
                    className={`px-4 py-2 rounded-lg border ${userPlan === "PASS" ? "bg-blue-500 text-white" : "bg-white"}`}
                  >
                    PASS
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Gratuit : profil, favoris, recherche. PASS : + carnet de vie, ressources premium, réductions.
                </p>
              </div>
            )}
          </div>
        </div>

        {role === "PASS_USER" && (
          <form className="auth-card space-y-4" onSubmit={handleUserSubmit} noValidate>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-2" htmlFor="name">Nom complet</label>
                <input id="name" name="name" className="w-full rounded-lg border p-2" required />
              </div>
              <div>
                <label className="font-semibold block mb-2" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" className="w-full rounded-lg border p-2" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-2" htmlFor="password">Mot de passe</label>
                <input id="password" name="password" type="password" minLength={8} className="w-full rounded-lg border p-2" required />
              </div>
              <div>
                <label className="font-semibold block mb-2" htmlFor="password2">Confirmation</label>
                <input id="password2" name="password2" type="password" minLength={8} className="w-full rounded-lg border p-2" required />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" required />
              <span className="text-sm">
                J'accepte les <a className="text-blue-600 underline" href="/legal/cgu">CGU</a> et la{" "}
                <a className="text-blue-600 underline" href="/legal/confidentialite">politique de confidentialité</a>.
              </span>
            </label>

            <div className="flex gap-2">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </button>
              <a className="px-6 py-2 border rounded-lg hover:bg-gray-50" href="/auth/login">
                J'ai déjà un compte
              </a>
            </div>
          </form>
        )}

        {role === "PRACTITIONER" && (
          <form className="auth-card space-y-4" onSubmit={handleProStepSubmit}>
            <div className="grid grid-cols-4 gap-2">
              {proSteps.map((s, i) => (
                <div key={s} className={`p-2 text-center rounded ${i <= proStep ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                  {i + 1}. {s}
                </div>
              ))}
            </div>

            {proStep === 0 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Prénom</label>
                    <input name="firstName" defaultValue={proFormData.firstName} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Nom</label>
                    <input name="lastName" defaultValue={proFormData.lastName} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Email</label>
                    <input name="email" type="email" defaultValue={proFormData.email} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Mot de passe</label>
                    <input name="password" type="password" minLength={8} defaultValue={proFormData.password} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
              </div>
            )}

            {proStep === 1 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Discipline principale</label>
                    <input name="discipline" defaultValue={proFormData.discipline} className="w-full rounded-lg border p-2" placeholder="Réflexologie" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Ville d'exercice</label>
                    <input name="city" defaultValue={proFormData.city} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-2">Années d'expérience</label>
                  <input name="experience" type="number" min={0} defaultValue={proFormData.experience} className="w-full rounded-lg border p-2" required />
                </div>
              </div>
            )}

            {proStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold block mb-2">Charte éthique</label>
                  <textarea name="ethics" defaultValue={proFormData.ethics} className="w-full rounded-lg border p-2" rows={4} placeholder="Vos engagements..." />
                </div>
                <div>
                  <label className="font-semibold block mb-2">Pièces (liens)</label>
                  <input name="documents" defaultValue={proFormData.documents} className="w-full rounded-lg border p-2" placeholder="URL diplôme/assurance" />
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" required />
                  <span>Je certifie l'exactitude des informations.</span>
                </label>
              </div>
            )}

            {proStep === 3 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700">
                  Vérifiez vos informations puis envoyez votre candidature. Réponse sous <strong>48h</strong> par email.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                type="button"
                onClick={() => setProStep(Math.max(0, proStep - 1))}
                disabled={proStep === 0 || loading}
              >
                Précédent
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" type="submit" disabled={loading}>
                {loading ? 'Envoi...' : proStep === 3 ? "Envoyer ma candidature" : "Suivant"}
              </button>
            </div>
          </form>
        )}

        {/* Reste du code merchant inchangé... */}
      </div>
    </main>
  );
}