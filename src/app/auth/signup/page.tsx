// Cdw-Spm: Signup Page - Complete Registration System for All Roles
"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type Role = "PASS_USER" | "PRACTITIONER" | "ARTISAN" | "COMMERCANT" | "CENTER";

interface PractitionerFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  discipline: string;
  city: string;
  experience: number;
  siret: string;
  presentation: string;
  diplomaUrl: string;
  insuranceUrl: string;
  kbisUrl: string;
  criminalRecordUrl: string;
}

interface ArtisanFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  category: string;
  productNature: string;
  address: string;
  city: string;
  postalCode: string;
  siret: string;
  presentation: string;
  kbisUrl: string;
}

interface CommercantFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  category: string;
  productNature: string;
  address: string;
  city: string;
  postalCode: string;
  siret: string;
  presentation: string;
  kbisUrl: string;
}

interface CenterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  formationTypes: string;
  address: string;
  city: string;
  postalCode: string;
  siret: string;
  presentation: string;
  kbisUrl: string;
  certificationsUrl: string;
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
  const [step, setStep] = useState(0);

  const [practitionerData, setPractitionerData] = useState<Partial<PractitionerFormData>>({});
  const [artisanData, setArtisanData] = useState<Partial<ArtisanFormData>>({});
  const [commercantData, setCommercantData] = useState<Partial<CommercantFormData>>({});
  const [centerData, setCenterData] = useState<Partial<CenterFormData>>({});

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const proSteps = ["Identité & Contact", "Informations professionnelles", "Présentation", "Documents", "Récapitulatif"];

  useEffect(() => {
    setStep(0);
    setError('');
    setSuccess('');
    setPractitionerData({});
    setArtisanData({});
    setCommercantData({});
    setCenterData({});
    setUploadedFiles({});
  }, [role]);

  // Upload de fichier vers S3
  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    fileType: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: { name: file.name, url: '', uploading: true }
    }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'applications');
    formData.append('userId', getEmailByRole() || 'temp');

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

        updateFormDataUrl(fileType, result.url);
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

  const getEmailByRole = () => {
    if (role === "PRACTITIONER") return practitionerData.email;
    if (role === "ARTISAN") return artisanData.email;
    if (role === "COMMERCANT") return commercantData.email;
    if (role === "CENTER") return centerData.email;
    return '';
  };

  const updateFormDataUrl = (fileType: string, url: string) => {
    const urlKey = `${fileType}Url`;
    if (role === "PRACTITIONER") {
      setPractitionerData(prev => ({ ...prev, [urlKey]: url }));
    } else if (role === "ARTISAN") {
      setArtisanData(prev => ({ ...prev, [urlKey]: url }));
    } else if (role === "COMMERCANT") {
      setCommercantData(prev => ({ ...prev, [urlKey]: url }));
    } else if (role === "CENTER") {
      setCenterData(prev => ({ ...prev, [urlKey]: url }));
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
    const currentStepData: any = {};
    formData.forEach((value, key) => {
      currentStepData[key] = value;
    });

    // Mettre à jour les données selon le rôle
    if (role === "PRACTITIONER") {
      setPractitionerData(prev => ({ ...prev, ...currentStepData }));
    } else if (role === "ARTISAN") {
      setArtisanData(prev => ({ ...prev, ...currentStepData }));
    } else if (role === "COMMERCANT") {
      setCommercantData(prev => ({ ...prev, ...currentStepData }));
    } else if (role === "CENTER") {
      setCenterData(prev => ({ ...prev, ...currentStepData }));
    }

    // Si pas à la dernière étape, continuer
    if (step < 4) {
      setStep(step + 1);
      setError('');
      return;
    }

    // Dernière étape : envoyer tout
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint = '';
      let data: any = {};

      if (role === "PRACTITIONER") {
        endpoint = '/api/auth/register-pro';
        const finalData = { ...practitionerData, ...currentStepData };
        data = {
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          email: finalData.email,
          password: finalData.password,
          phone: finalData.phone,
          discipline: finalData.discipline,
          city: finalData.city,
          experience: Number(finalData.experience),
          siret: finalData.siret,
          presentation: finalData.presentation || '',
          documents: {
            diploma: finalData.diplomaUrl || '',
            insurance: finalData.insuranceUrl || '',
            kbis: finalData.kbisUrl || '',
            criminalRecord: finalData.criminalRecordUrl || '',
          },
        };
      } else if (role === "ARTISAN") {
        endpoint = '/api/auth/register-artisan';
        const finalData = { ...artisanData, ...currentStepData };
        data = {
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          email: finalData.email,
          password: finalData.password,
          phone: finalData.phone,
          category: finalData.category,
          productNature: finalData.productNature,
          address: finalData.address,
          city: finalData.city,
          postalCode: finalData.postalCode,
          siret: finalData.siret,
          presentation: finalData.presentation || '',
          documents: {
            kbis: finalData.kbisUrl || '',
          },
        };
      } else if (role === "COMMERCANT") {
        endpoint = '/api/auth/register-commercant';
        const finalData = { ...commercantData, ...currentStepData };
        data = {
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          email: finalData.email,
          password: finalData.password,
          phone: finalData.phone,
          category: finalData.category,
          productNature: finalData.productNature,
          address: finalData.address,
          city: finalData.city,
          postalCode: finalData.postalCode,
          siret: finalData.siret,
          presentation: finalData.presentation || '',
          documents: {
            kbis: finalData.kbisUrl || '',
          },
        };
      } else if (role === "CENTER") {
        endpoint = '/api/auth/register-center';
        const finalData = { ...centerData, ...currentStepData };
        data = {
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          email: finalData.email,
          password: finalData.password,
          phone: finalData.phone,
          formationTypes: finalData.formationTypes,
          address: finalData.address,
          city: finalData.city,
          postalCode: finalData.postalCode,
          siret: finalData.siret,
          presentation: finalData.presentation || '',
          documents: {
            kbis: finalData.kbisUrl || '',
            certifications: finalData.certificationsUrl || '',
          },
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setSuccess('✅ Candidature envoyée avec succès !\n\nVous recevrez une réponse par email sous 48h.\n\nEn cas d\'approbation, vous pourrez vous connecter à votre espace professionnel.');
        setTimeout(() => {
          setStep(0);
          setPractitionerData({});
          setArtisanData({});
          setCommercantData({});
          setCenterData({});
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

  const getCurrentFormData = () => {
    if (role === "PRACTITIONER") return practitionerData;
    if (role === "ARTISAN") return artisanData;
    if (role === "COMMERCANT") return commercantData;
    if (role === "CENTER") return centerData;
    return {};
  };

  const formData = getCurrentFormData();

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
                <option value="CENTER">Centre de formation</option>
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

        {/* PARTICULIER */}
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

        {/* PRATICIEN */}
        {role === "PRACTITIONER" && (
          <form className="auth-card space-y-4" onSubmit={handleProStepSubmit}>
            <div className="grid grid-cols-5 gap-2">
              {proSteps.map((s, i) => (
                <div key={s} className={`p-2 text-center rounded text-sm ${i <= step ? "bg-accent text-white" : "bg-gray-200"}`}>
                  {i + 1}. {s}
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Identité & Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Prénom *</label>
                    <input name="firstName" defaultValue={practitionerData.firstName} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Nom *</label>
                    <input name="lastName" defaultValue={practitionerData.lastName} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Email *</label>
                    <input name="email" type="email" defaultValue={practitionerData.email} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Téléphone *</label>
                    <input name="phone" type="tel" placeholder="06 12 34 56 78" defaultValue={practitionerData.phone} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-2">Mot de passe *</label>
                  <input name="password" type="password" minLength={8} defaultValue={practitionerData.password} className="w-full rounded-lg border p-2" required />
                  <p className="text-sm text-gray-500 mt-1">Minimum 8 caractères</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Pratique professionnelle</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Discipline principale *</label>
                    <input name="discipline" defaultValue={practitionerData.discipline} className="w-full rounded-lg border p-2" placeholder="Ex: Naturopathie, Réflexologie..." required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Ville d'exercice *</label>
                    <input name="city" defaultValue={practitionerData.city} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Années d'expérience *</label>
                    <input name="experience" type="number" min={0} defaultValue={practitionerData.experience} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">SIRET *</label>
                    <input name="siret" placeholder="123 456 789 00012" defaultValue={practitionerData.siret} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Présentez votre pratique</h3>
                <p className="text-sm text-gray-600">
                  Décrivez brièvement votre approche, vos spécialités et ce qui vous anime dans votre pratique.
                </p>
                <div>
                  <label className="font-semibold block mb-2">Présentation</label>
                  <textarea
                    name="presentation"
                    defaultValue={practitionerData.presentation}
                    className="w-full rounded-lg border p-2"
                    rows={6}
                    placeholder="Parlez de votre parcours, votre approche, vos valeurs..."
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Documents justificatifs</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Merci de fournir les documents suivants (format PDF, image ou Word, max 10MB par fichier).
                </p>

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

            {step === 4 && (
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
                      <p className="font-semibold">{practitionerData.firstName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-semibold">{practitionerData.lastName || '-'}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{practitionerData.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-semibold">{practitionerData.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Discipline</p>
                      <p className="font-semibold">{practitionerData.discipline || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ville</p>
                      <p className="font-semibold">{practitionerData.city || '-'}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Expérience</p>
                      <p className="font-semibold">{practitionerData.experience || '0'} ans</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SIRET</p>
                      <p className="font-semibold">{practitionerData.siret || '-'}</p>
                    </div>
                  </div>
                </div>

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
                      <a className="text-blue-600 underline" href="/legal/cgu" target="_blank">CGU</a>{" "}
                      et les{" "}
                      <a className="text-blue-600 underline" href="/legal/cgv" target="_blank">CGV</a>.
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
              {step > 0 && (
                <button
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  type="button"
                  onClick={() => {
                    setStep(Math.max(0, step - 1));
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
                disabled={loading || (step === 3 && (!uploadedFiles.diploma?.url || !uploadedFiles.insurance?.url || !uploadedFiles.kbis?.url || !uploadedFiles.criminalRecord?.url))}
              >
                {loading ? 'Envoi...' : step === 4 ? "Envoyer ma candidature" : "Suivant"}
              </button>
            </div>
          </form>
        )}

        {/* ARTISAN */}
        {role === "ARTISAN" && (
          <form className="auth-card space-y-4" onSubmit={handleProStepSubmit}>
            <div className="grid grid-cols-5 gap-2">
              {proSteps.map((s, i) => (
                <div key={s} className={`p-2 text-center rounded text-sm ${i <= step ? "bg-accent text-white" : "bg-gray-200"}`}>
                  {i + 1}. {s}
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Identité & Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Prénom *</label>
                    <input name="firstName" defaultValue={artisanData.firstName} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Nom *</label>
                    <input name="lastName" defaultValue={artisanData.lastName} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Email *</label>
                    <input name="email" type="email" defaultValue={artisanData.email} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Téléphone *</label>
                    <input name="phone" type="tel" placeholder="06 12 34 56 78" defaultValue={artisanData.phone} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-2">Mot de passe *</label>
                  <input name="password" type="password" minLength={8} defaultValue={artisanData.password} className="w-full rounded-lg border p-2" required />
                  <p className="text-sm text-gray-500 mt-1">Minimum 8 caractères</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations professionnelles</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Catégorie *</label>
                    <select name="category" defaultValue={artisanData.category} className="w-full rounded-lg border p-2" required>
                      <option value="">Sélectionnez...</option>
                      <option value="Savonnerie artisanale">Savonnerie artisanale</option>
                      <option value="Cosmétique naturelle">Cosmétique naturelle</option>
                      <option value="Aromathérapie">Aromathérapie</option>
                      <option value="Bijoux énergétiques">Bijoux énergétiques</option>
                      <option value="Textiles bien-être">Textiles bien-être</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Nature des produits *</label>
                    <input name="productNature" defaultValue={artisanData.productNature} className="w-full rounded-lg border p-2" placeholder="Ex: Savons bio, huiles essentielles..." required />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-2">Adresse *</label>
                  <input name="address" defaultValue={artisanData.address} className="w-full rounded-lg border p-2" required />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Ville *</label>
                    <input name="city" defaultValue={artisanData.city} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Code postal *</label>
                    <input name="postalCode" defaultValue={artisanData.postalCode} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-2">SIRET *</label>
                  <input name="siret" placeholder="123 456 789 00012" defaultValue={artisanData.siret} className="w-full rounded-lg border p-2" required />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Présentez votre activité</h3>
                <p className="text-sm text-gray-600">
                  Décrivez brièvement votre savoir-faire, vos créations et ce qui vous anime dans votre métier.
                </p>
                <div>
                  <label className="font-semibold block mb-2">Présentation</label>
                  <textarea
                    name="presentation"
                    defaultValue={artisanData.presentation}
                    className="w-full rounded-lg border p-2"
                    rows={6}
                    placeholder="Parlez de votre parcours, vos techniques, vos valeurs..."
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Document justificatif</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Merci de fournir votre Kbis (format PDF, image ou Word, max 10MB).
                </p>

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

                {!uploadedFiles.kbis?.url && (
                  <p className="text-sm text-orange-600 font-semibold">⚠️ Le Kbis est obligatoire pour poursuivre</p>
                )}
              </div>
            )}

            {step === 4 && (
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
                      <p className="font-semibold">{artisanData.firstName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-semibold">{artisanData.lastName || '-'}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{artisanData.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-semibold">{artisanData.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Catégorie</p>
                      <p className="font-semibold">{artisanData.category || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nature des produits</p>
                      <p className="font-semibold">{artisanData.productNature || '-'}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Adresse</p>
                      <p className="font-semibold">{artisanData.address || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ville</p>
                      <p className="font-semibold">{artisanData.city || '-'} {artisanData.postalCode || ''}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SIRET</p>
                    <p className="font-semibold">{artisanData.siret || '-'}</p>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="flex items-start gap-2">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-sm">
                      J'ai lu et j'accepte la{" "}
                      <a className="text-blue-600 underline font-semibold" href="/legal/charte-artisans" target="_blank">
                        Charte des Artisans SPYMEO
                      </a>{" "}
                      et m'engage à en respecter tous les principes.
                    </span>
                  </label>

                  <label className="flex items-start gap-2">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-sm">
                      J'accepte les{" "}
                      <a className="text-blue-600 underline" href="/legal/cgu" target="_blank">CGU</a>{" "}
                      et les{" "}
                      <a className="text-blue-600 underline" href="/legal/cgv" target="_blank">CGV</a>.
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
              {step > 0 && (
                <button
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  type="button"
                  onClick={() => {
                    setStep(Math.max(0, step - 1));
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
                disabled={loading || (step === 3 && !uploadedFiles.kbis?.url)}
              >
                {loading ? 'Envoi...' : step === 4 ? "Envoyer ma candidature" : "Suivant"}
              </button>
            </div>
          </form>
        )}

        {/* COMMERCANT - Similar to ARTISAN with adapted labels */}
        {role === "COMMERCANT" && (
          <form className="auth-card space-y-4" onSubmit={handleProStepSubmit}>
            <div className="grid grid-cols-5 gap-2">
              {proSteps.map((s, i) => (
                <div key={s} className={`p-2 text-center rounded text-sm ${i <= step ? "bg-accent text-white" : "bg-gray-200"}`}>
                  {i + 1}. {s}
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Identité & Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Prénom *</label>
                    <input name="firstName" defaultValue={commercantData.firstName} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Nom *</label>
                    <input name="lastName" defaultValue={commercantData.lastName} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Email *</label>
                    <input name="email" type="email" defaultValue={commercantData.email} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Téléphone *</label>
                    <input name="phone" type="tel" placeholder="06 12 34 56 78" defaultValue={commercantData.phone} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-2">Mot de passe *</label>
                  <input name="password" type="password" minLength={8} defaultValue={commercantData.password} className="w-full rounded-lg border p-2" required />
                  <p className="text-sm text-gray-500 mt-1">Minimum 8 caractères</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations professionnelles</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Catégorie *</label>
                    <select name="category" defaultValue={commercantData.category} className="w-full rounded-lg border p-2" required>
                      <option value="">Sélectionnez...</option>
                      <option value="Boutique bien-être">Boutique bien-être</option>
                      <option value="Herboristerie">Herboristerie</option>
                      <option value="Produits naturels">Produits naturels</option>
                      <option value="Compléments alimentaires">Compléments alimentaires</option>
                      <option value="Librairie spécialisée">Librairie spécialisée</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Nature des produits *</label>
                    <input name="productNature" defaultValue={commercantData.productNature} className="w-full rounded-lg border p-2" placeholder="Ex: Plantes médicinales, huiles..." required />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-2">Adresse *</label>
                  <input name="address" defaultValue={commercantData.address} className="w-full rounded-lg border p-2" required />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Ville *</label>
                    <input name="city" defaultValue={commercantData.city} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Code postal *</label>
                    <input name="postalCode" defaultValue={commercantData.postalCode} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-2">SIRET *</label>
                  <input name="siret" placeholder="123 456 789 00012" defaultValue={commercantData.siret} className="w-full rounded-lg border p-2" required />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Présentez votre commerce</h3>
                <p className="text-sm text-gray-600">
                  Décrivez brièvement votre boutique, vos produits et votre philosophie commerciale.
                </p>
                <div>
                  <label className="font-semibold block mb-2">Présentation</label>
                  <textarea
                    name="presentation"
                    defaultValue={commercantData.presentation}
                    className="w-full rounded-lg border p-2"
                    rows={6}
                    placeholder="Parlez de votre boutique, vos produits, vos valeurs..."
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Document justificatif</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Merci de fournir votre Kbis (format PDF, image ou Word, max 10MB).
                </p>

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

                {!uploadedFiles.kbis?.url && (
                  <p className="text-sm text-orange-600 font-semibold">⚠️ Le Kbis est obligatoire pour poursuivre</p>
                )}
              </div>
            )}

            {step === 4 && (
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
                      <p className="font-semibold">{commercantData.firstName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-semibold">{commercantData.lastName || '-'}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{commercantData.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-semibold">{commercantData.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Catégorie</p>
                      <p className="font-semibold">{commercantData.category || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nature des produits</p>
                      <p className="font-semibold">{commercantData.productNature || '-'}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Adresse</p>
                      <p className="font-semibold">{commercantData.address || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ville</p>
                      <p className="font-semibold">{commercantData.city || '-'} {commercantData.postalCode || ''}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SIRET</p>
                    <p className="font-semibold">{commercantData.siret || '-'}</p>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="flex items-start gap-2">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-sm">
                      J'ai lu et j'accepte la{" "}
                      <a className="text-blue-600 underline font-semibold" href="/legal/charte-commercants" target="_blank">
                        Charte des Commerçants SPYMEO
                      </a>{" "}
                      et m'engage à en respecter tous les principes.
                    </span>
                  </label>

                  <label className="flex items-start gap-2">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-sm">
                      J'accepte les{" "}
                      <a className="text-blue-600 underline" href="/legal/cgu" target="_blank">CGU</a>{" "}
                      et les{" "}
                      <a className="text-blue-600 underline" href="/legal/cgv" target="_blank">CGV</a>.
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
              {step > 0 && (
                <button
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  type="button"
                  onClick={() => {
                    setStep(Math.max(0, step - 1));
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
                disabled={loading || (step === 3 && !uploadedFiles.kbis?.url)}
              >
                {loading ? 'Envoi...' : step === 4 ? "Envoyer ma candidature" : "Suivant"}
              </button>
            </div>
          </form>
        )}

        {/* CENTER */}
        {role === "CENTER" && (
          <form className="auth-card space-y-4" onSubmit={handleProStepSubmit}>
            <div className="grid grid-cols-5 gap-2">
              {proSteps.map((s, i) => (
                <div key={s} className={`p-2 text-center rounded text-sm ${i <= step ? "bg-accent text-white" : "bg-gray-200"}`}>
                  {i + 1}. {s}
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Identité & Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Prénom du responsable *</label>
                    <input name="firstName" defaultValue={centerData.firstName} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Nom du responsable *</label>
                    <input name="lastName" defaultValue={centerData.lastName} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Email *</label>
                    <input name="email" type="email" defaultValue={centerData.email} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Téléphone *</label>
                    <input name="phone" type="tel" placeholder="06 12 34 56 78" defaultValue={centerData.phone} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-2">Mot de passe *</label>
                  <input name="password" type="password" minLength={8} defaultValue={centerData.password} className="w-full rounded-lg border p-2" required />
                  <p className="text-sm text-gray-500 mt-1">Minimum 8 caractères</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations sur le centre</h3>
                <div>
                  <label className="font-semibold block mb-2">Types de formations proposées *</label>
                  <textarea
                    name="formationTypes"
                    defaultValue={centerData.formationTypes}
                    className="w-full rounded-lg border p-2"
                    rows={3}
                    placeholder="Ex: Naturopathie, Réflexologie, Aromathérapie..."
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-2">Adresse du centre *</label>
                  <input name="address" defaultValue={centerData.address} className="w-full rounded-lg border p-2" required />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-2">Ville *</label>
                    <input name="city" defaultValue={centerData.city} className="w-full rounded-lg border p-2" required />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Code postal *</label>
                    <input name="postalCode" defaultValue={centerData.postalCode} className="w-full rounded-lg border p-2" required />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-2">SIRET *</label>
                  <input name="siret" placeholder="123 456 789 00012" defaultValue={centerData.siret} className="w-full rounded-lg border p-2" required />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Présentez votre centre</h3>
                <p className="text-sm text-gray-600">
                  Décrivez brièvement votre centre, votre approche pédagogique et vos valeurs.
                </p>
                <div>
                  <label className="font-semibold block mb-2">Présentation</label>
                  <textarea
                    name="presentation"
                    defaultValue={centerData.presentation}
                    className="w-full rounded-lg border p-2"
                    rows={6}
                    placeholder="Parlez de votre centre, vos formateurs, votre pédagogie..."
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Documents justificatifs</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Merci de fournir les documents suivants (format PDF, image ou Word, max 10MB par fichier).
                </p>

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

                <div className="p-4 border rounded-lg">
                  <label className="font-semibold block mb-2">Certifications / Agréments (Qualiopi, Datadock...) *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'certifications')}
                    className="w-full"
                  />
                  {uploadedFiles.certifications?.uploading && <p className="text-sm text-blue-600 mt-2">⏳ Upload en cours...</p>}
                  {uploadedFiles.certifications?.url && <p className="text-sm text-green-600 mt-2">✅ {uploadedFiles.certifications.name}</p>}
                </div>

                {(!uploadedFiles.kbis?.url || !uploadedFiles.certifications?.url) && (
                  <p className="text-sm text-orange-600 font-semibold">⚠️ Tous les documents sont obligatoires pour poursuivre</p>
                )}
              </div>
            )}

            {step === 4 && (
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
                      <p className="font-semibold">{centerData.firstName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-semibold">{centerData.lastName || '-'}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{centerData.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-semibold">{centerData.phone || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Types de formations</p>
                    <p className="font-semibold">{centerData.formationTypes || '-'}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Adresse</p>
                      <p className="font-semibold">{centerData.address || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ville</p>
                      <p className="font-semibold">{centerData.city || '-'} {centerData.postalCode || ''}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SIRET</p>
                    <p className="font-semibold">{centerData.siret || '-'}</p>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="flex items-start gap-2">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-sm">
                      J'ai lu et j'accepte la{" "}
                      <a className="text-blue-600 underline font-semibold" href="/legal/charte-centres" target="_blank">
                        Charte des Centres de Formation SPYMEO
                      </a>{" "}
                      et m'engage à en respecter tous les principes.
                    </span>
                  </label>

                  <label className="flex items-start gap-2">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-sm">
                      J'accepte les{" "}
                      <a className="text-blue-600 underline" href="/legal/cgu" target="_blank">CGU</a>{" "}
                      et les{" "}
                      <a className="text-blue-600 underline" href="/legal/cgv" target="_blank">CGV</a>.
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
              {step > 0 && (
                <button
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  type="button"
                  onClick={() => {
                    setStep(Math.max(0, step - 1));
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
                disabled={loading || (step === 3 && (!uploadedFiles.kbis?.url || !uploadedFiles.certifications?.url))}
              >
                {loading ? 'Envoi...' : step === 4 ? "Envoyer ma candidature" : "Suivant"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
