// Cdw-Spm: Signup Page - Phase 2 with File Upload
"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type Role = "PASS_USER" | "PRACTITIONER" | "ARTISAN" | "COMMERCANT";

interface ProFormData {
  // Étape 1 : Identité
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;

  // Étape 2 : Pratique
  discipline: string;
  city: string;
  experience: number;
  siret: string;

  // Étape 3 : Présentation
  presentation: string;

  // Étape 4 : Documents (URLs S3)
  diplomaUrl: string;
  insuranceUrl: string;
  kbisUrl: string;
  criminalRecordUrl: string;
}

interface UploadedFile {
  name: string;
  url: string;
  uploading: boolean;
}

export default function Signup() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("PASS_USER");
  const [userPlan, setUserPlan] = useState<"FREE" | "PASS">("FREE");
  const [proStep, setProStep] = useState(0);

  const [proFormData, setProFormData] = useState<Partial<ProFormData>>({});

  // Gestion des fichiers uploadés
  const [uploadedFiles, setUploadedFiles] = useState<{
    diploma?: UploadedFile;
    insurance?: UploadedFile;
    kbis?: UploadedFile;
    criminalRecord?: UploadedFile;
  }>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const proSteps = ["Identité & Contact", "Pratique professionnelle", "Présentation", "Documents", "Récapitulatif"];

  useEffect(() => {
    setProStep(0);
    setError('');
    setSuccess('');
    setProFormData({});
    setUploadedFiles({});
  }, [role]);

  // Upload de fichier vers S3
  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    fileType: 'diploma' | 'insurance' | 'kbis' | 'criminalRecord'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mettre à jour l'état pour montrer l'upload en cours
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: { name: file.name, url: '', uploading: true }
    }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'applications');
    formData.append('userId', proFormData.email || 'temp');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        setUploadedFiles(prev => ({
          ...prev,
          [fileType]: { name: file.name, url: result.url, uploading: false }
        }));

        // Sauvegarder l'URL dans les données du formulaire
        const urlKey = `${fileType}Url` as keyof ProFormData;
        setProFormData(prev => ({ ...prev, [urlKey]: result.url }));
      } else {
        setError(result.error || 'Erreur lors de l\'upload');
        setUploadedFiles(prev => {
          const newState = { ...prev };
          delete newState[fileType];
          return newState;
        });
      }
    } catch (err) {
      setError('Erreur réseau lors de l\'upload');
      setUploadedFiles(prev => {
        const newState = { ...prev };
        delete newState[fileType];
        return newState;
      });
    }
  };

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
    if (proStep < 4) {
      setProStep(proStep + 1);
      setError('');
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
      phone: updatedData.phone as string,
      discipline: updatedData.discipline as string,
      city: updatedData.city as string,
      experience: Number(updatedData.experience),
      siret: updatedData.siret as string,
      presentation: updatedData.presentation as string || '',
      documents: {
        diploma: updatedData.diplomaUrl || '',
        insurance: updatedData.insuranceUrl || '',
        kbis: updatedData.kbisUrl || '',
        criminalRecord: updatedData.criminalRecordUrl || '',
      },
    };

    try {
      const res = await fetch('/api/auth/register-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setSuccess('✅ Candidature envoyée avec succès !\n\nVous recevrez une réponse par email sous 48h.\n\nEn cas d\'approbation, vous pourrez vous connecter à votre espace praticien.');
        setTimeout(() => {
          setProStep(0);
          setProFormData({});
          setUploadedFiles({});
        }, 5000);
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
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 whitespace-pre-line">
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
                    className={`px-4 py-2 rounded-lg border ${userPlan === "FREE" ? "bg-accent text-white" : "bg-white"}`}
                  >
                    Gratuit
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserPlan("PASS")}
                    className={`px-4 py-2 rounded-lg border ${userPlan === "PASS" ? "bg-accent text-white" : "bg-white"}`}
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
                J'accepte les <a className="text-blue-600 underline" href="/legal/cgu" target="_blank">CGU</a> et la{" "}
                <a className="text-blue-600 underline" href="/legal/confidentialite" target="_blank">politique de confidentialité</a>.
              </span>
            </label>

            <div className="flex gap-2">
              <button className="btn" type="submit" disabled={loading}>
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
            {/* Progress bar */}
            <div className="grid grid-cols-5 gap-2">
              {proSteps.map((s, i) => (
                <div key={s} className={`p-2 text-center rounded text-sm ${i <= proStep ? "bg-accent text-white" : "bg-gray-200"}`}>
                  {i + 1}. {s}
                </div>
              ))}
            </div>

            {/* Étape 1 : Identité & Contact */}
            {proStep === 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Identité & Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Prénom *</label>
                    <input name="firstName" defaultValue={proFormData.firstName} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Nom *</label>
                    <input name="lastName" defaultValue={proFormData.lastName} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Email *</label>
                    <input name="email" type="email" defaultValue={proFormData.email} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Téléphone *</label>
                    <input name="phone" type="tel" placeholder="06 12 34 56 78" defaultValue={proFormData.phone} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-2">Mot de passe *</label>
                  <input name="password" type="password" minLength={8} defaultValue={proFormData.password} className="w-full rounded-lg border p-2" required />
                  <p className="text-sm text-gray-500 mt-1">Minimum 8 caractères</p>
                </div>
              </div>
            )}

            {/* Étape 2 : Pratique professionnelle */}
            {proStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Pratique professionnelle</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Discipline principale *</label>
                    <input name="discipline" defaultValue={proFormData.discipline} className="w-full rounded-lg border p-2" placeholder="Ex: Naturopathie, Réflexologie..." required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Ville d'exercice *</label>
                    <input name="city" defaultValue={proFormData.city} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Années d'expérience *</label>
                    <input name="experience" type="number" min={0} defaultValue={proFormData.experience} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">SIRET *</label>
                    <input name="siret" placeholder="123 456 789 00012" defaultValue={proFormData.siret} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3 : Présentation */}
            {proStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Présentez votre pratique</h3>
                <p className="text-sm text-gray-600">
                  Décrivez brièvement votre approche, vos spécialités et ce qui vous anime dans votre pratique.
                </p>
                <div>
                  <label className="font-semibold block mb-2">Présentation</label>
                  <textarea
                    name="presentation"
                    defaultValue={proFormData.presentation}
                    className="w-full rounded-lg border p-2"
                    rows={6}
                    placeholder="Parlez de votre parcours, votre approche, vos valeurs..."
                  />
                </div>
              </div>
            )}

            {/* Étape 4 : Documents */}
            {proStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Documents justificatifs</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Merci de fournir les documents suivants (format PDF, image ou Word, max 10MB par fichier).
                </p>

                {/* Diplôme */}
                <div className="p-4 border rounded-lg">
                  <label className="font-semibold block mb-2">Diplôme(s) / Certificat(s) *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'diploma')}
                    className="w-full"
                  />
                  {uploadedFiles.diploma?.uploading && <p className="text-sm text-blue-600 mt-2">⏳ Upload en cours...</p>}
                  {uploadedFiles.diploma?.url && <p className="text-sm text-green-600 mt-2">✅ {uploadedFiles.diploma.name}</p>}
                </div>

                {/* Assurance */}
                <div className="p-4 border rounded-lg">
                  <label className="font-semibold block mb-2">Assurance RC Professionnelle *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'insurance')}
                    className="w-full"
                  />
                  {uploadedFiles.insurance?.uploading && <p className="text-sm text-blue-600 mt-2">⏳ Upload en cours...</p>}
                  {uploadedFiles.insurance?.url && <p className="text-sm text-green-600 mt-2">✅ {uploadedFiles.insurance.name}</p>}
                </div>

                {/* Kbis */}
                <div className="p-4 border rounded-lg">
                  <label className="font-semibold block mb-2">Kbis (ou équivalent) *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'kbis')}
                    className="w-full"
                  />
                  {uploadedFiles.kbis?.uploading && <p className="text-sm text-blue-600 mt-2">⏳ Upload en cours...</p>}
                  {uploadedFiles.kbis?.url && <p className="text-sm text-green-600 mt-2">✅ {uploadedFiles.kbis.name}</p>}
                </div>

                {/* Casier judiciaire */}
                <div className="p-4 border rounded-lg">
                  <label className="font-semibold block mb-2">Casier judiciaire vierge (volet 3) *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'criminalRecord')}
                    className="w-full"
                  />
                  {uploadedFiles.criminalRecord?.uploading && <p className="text-sm text-blue-600 mt-2">⏳ Upload en cours...</p>}
                  {uploadedFiles.criminalRecord?.url && <p className="text-sm text-green-600 mt-2">✅ {uploadedFiles.criminalRecord.name}</p>}
                </div>

                {(!uploadedFiles.diploma?.url || !uploadedFiles.insurance?.url || !uploadedFiles.kbis?.url || !uploadedFiles.criminalRecord?.url) && (
                  <p className="text-sm text-orange-600 font-semibold">⚠️ Tous les documents sont obligatoires pour poursuivre</p>
                )}
              </div>
            )}

            {/* Étape 5 : Récapitulatif */}
            {proStep === 4 && (
              <div className="space-y-4">
                <div className="p-4 bg-[#f0fbff] rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">📋 Récapitulatif de votre candidature</h3>
                  <p className="text-gray-700 text-sm mb-4">
                    Vérifiez vos informations puis acceptez la charte et envoyez votre candidature. Réponse sous <strong>48h</strong> par email.
                  </p>
                </div>

                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Prénom</p>
                      <p className="font-semibold">{proFormData.firstName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-semibold">{proFormData.lastName || '-'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{proFormData.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-semibold">{proFormData.phone || '-'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Discipline</p>
                      <p className="font-semibold">{proFormData.discipline || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ville</p>
                      <p className="font-semibold">{proFormData.city || '-'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Expérience</p>
                      <p className="font-semibold">{proFormData.experience || '0'} ans</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SIRET</p>
                      <p className="font-semibold">{proFormData.siret || '-'}</p>
                    </div>
                  </div>

                  {proFormData.presentation && (
                    <div>
                      <p className="text-sm text-gray-600">Présentation</p>
                      <p className="text-sm">{proFormData.presentation}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Documents uploadés</p>
                    <ul className="text-sm space-y-1">
                      <li>✅ Diplôme</li>
                      <li>✅ Assurance RC Pro</li>
                      <li>✅ Kbis</li>
                      <li>✅ Casier judiciaire</li>
                    </ul>
                  </div>
                </div>

                {/* Acceptation de la charte et CGU/CGV */}
                <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="flex items-start gap-2">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-sm">
                      J'ai lu et j'accepte la{" "}
                      <a className="text-blue-600 underline font-semibold" href="/legal/charte-praticiens" target="_blank">
                        Charte des Praticiens SPYMEO
                      </a>{" "}
                      et m'engage à en respecter tous les principes.
                    </span>
                  </label>

                  <label className="flex items-start gap-2">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-sm">
                      J'accepte les{" "}
                      <a className="text-blue-600 underline" href="/legal/cgu" target="_blank">Conditions Générales d'Utilisation</a>{" "}
                      et les{" "}
                      <a className="text-blue-600 underline" href="/legal/cgv" target="_blank">Conditions Générales de Vente</a>.
                    </span>
                  </label>

                  <label className="flex items-start gap-2">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-sm font-semibold">
                      Je certifie l'exactitude de toutes les informations fournies.
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              {proStep > 0 && (
                <button
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  type="button"
                  onClick={() => {
                    setProStep(Math.max(0, proStep - 1));
                    setError('');
                  }}
                  disabled={loading}
                >
                  Précédent
                </button>
              )}
              <button
                className="btn"
                type="submit"
                disabled={loading || (proStep === 3 && (!uploadedFiles.diploma?.url || !uploadedFiles.insurance?.url || !uploadedFiles.kbis?.url || !uploadedFiles.criminalRecord?.url))}
              >
                {loading ? 'Envoi...' : proStep === 4 ? "Envoyer ma candidature" : "Suivant"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
