"use client";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type ProfileData = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  practitionerProfile: {
    id: string;
    slug: string;
    publicName: string;
    specialties: string[];
    description: string | null;
    siret: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    verified: boolean;
    featured: boolean;
  } | null;
  profileData: any;
};

export default function PractitionerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [data, setData] = useState<ProfileData | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [publicName, setPublicName] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [siret, setSiret] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/pro/praticien/profile");
      const json = await res.json();

      if (json.success && json.profile) {
        setData(json.profile);

        // Populate form
        setFirstName(json.profile.firstName || "");
        setLastName(json.profile.lastName || "");
        setPhone(json.profile.phone || "");
        setAvatar(json.profile.avatar || "");
        setBio(json.profile.bio || "");

        if (json.profile.practitionerProfile) {
          const pp = json.profile.practitionerProfile;
          setPublicName(pp.publicName || "");
          setSpecialties(pp.specialties || []);
          setDescription(pp.description || "");
          setAddress(pp.address || "");
          setCity(pp.city || "");
          setPostalCode(pp.postalCode || "");
          setSiret(pp.siret || "");
        }
      } else {
        setMessage({ type: "error", text: json.error || "Erreur de chargement" });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Erreur de connexion" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Le fichier doit être une image" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "La photo ne doit pas dépasser 5 Mo" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch("/api/pro/praticien/profile/photo", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        setAvatar(json.url);
        setMessage({ type: "success", text: "Photo mise à jour" });
      } else {
        setMessage({ type: "error", text: json.error || "Erreur d'upload" });
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      setMessage({ type: "error", text: "Erreur d'upload" });
    } finally {
      setUploading(false);
    }
  }

  function addSpecialty() {
    const trimmed = newSpecialty.trim();
    if (!trimmed) return;
    if (specialties.includes(trimmed)) {
      setMessage({ type: "error", text: "Cette spécialité existe déjà" });
      return;
    }
    setSpecialties([...specialties, trimmed]);
    setNewSpecialty("");
  }

  function removeSpecialty(index: number) {
    setSpecialties(specialties.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/pro/praticien/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          bio,
          publicName,
          specialties,
          description,
          address,
          city,
          postalCode,
          siret,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: "Profil mis à jour avec succès" });
        // Refresh data
        await fetchProfile();
      } else {
        setMessage({ type: "error", text: json.error || "Erreur de sauvegarde" });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: "Erreur de connexion" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-spy max-w-4xl py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ma fiche praticien</h1>
        <p className="text-muted mt-2">
          Gérez votre profil public visible par vos clients et dans le répertoire SPYMEO.
        </p>
      </div>

      {message && (
        <div className={`alert ${message.type === "error" ? "alert-error" : "alert-success"} mb-4`}>
          <p className="font-semibold">{message.type === "error" ? "Erreur" : "Succès"}</p>
          <p>{message.text}</p>
        </div>
      )}

      {data?.practitionerProfile?.verified && (
        <div className="alert alert-success mb-4">
          <p className="font-semibold">✅ Profil vérifié</p>
          <p>Votre profil a été vérifié par l'équipe SPYMEO.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Photo de profil */}
        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Photo de profil</h2>

          <div className="flex items-start gap-4">
            <div
              className="w-32 h-32 rounded-xl bg-[#e6eef2] overflow-hidden flex items-center justify-center"
              style={avatar ? { backgroundImage: `url(${avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {!avatar && <span className="text-4xl">👤</span>}
            </div>

            <div className="flex-1">
              <label className="btn cursor-pointer">
                {uploading ? "Upload en cours..." : "Changer la photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
              <p className="text-sm text-muted mt-2">
                Format accepté : JPG, PNG (max 5 Mo)
              </p>
            </div>
          </div>
        </section>

        {/* Informations personnelles */}
        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={data?.email || ""}
                disabled
                className="w-full px-3 py-2 border border-border rounded-lg bg-[#f7fbfd]"
              />
              <p className="text-xs text-muted mt-1">L'email ne peut pas être modifié ici</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prénom *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Profil public */}
        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Profil public</h2>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom public *</label>
              <input
                type="text"
                value={publicName}
                onChange={(e) => setPublicName(e.target.value)}
                required
                placeholder="Ex: Cabinet de Naturopathie Sophie Martin"
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
              <p className="text-xs text-muted mt-1">
                Le nom affiché sur votre fiche publique
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Spécialités</label>

              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {specialties.map((spec, idx) => (
                    <span
                      key={idx}
                      className="pill pill-solid flex items-center gap-2"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(idx)}
                        className="hover:opacity-70"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSpecialty();
                    }
                  }}
                  placeholder="Ajouter une spécialité"
                  className="flex-1 px-3 py-2 border border-border rounded-lg"
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="btn btn-outline"
                >
                  Ajouter
                </button>
              </div>
              <p className="text-xs text-muted mt-1">
                Ex: Naturopathie, Sophrologie, Réflexologie...
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Présentation</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Présentez votre approche, votre parcours, vos méthodes..."
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio courte</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Courte biographie (affichée dans les listes)"
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Coordonnées professionnelles */}
        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Coordonnées professionnelles</h2>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Adresse du cabinet</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="12 rue de la Santé"
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ville</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Paris"
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code postal</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="75001"
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SIRET</label>
              <input
                type="text"
                value={siret}
                onChange={(e) => setSiret(e.target.value)}
                placeholder="123 456 789 00010"
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.push("/pro/dashboard")}
            className="btn btn-ghost"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn"
          >
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </form>

      {/* Preview link */}
      {data?.practitionerProfile?.slug && (
        <div className="card mt-6 bg-[#f7fbfd]">
          <p className="text-sm text-muted mb-2">Votre fiche publique :</p>
          <a
            href={`/praticien/${data.practitionerProfile.slug}`}
            target="_blank"
            className="text-accent hover:underline font-medium"
          >
            https://spymeo.fr/praticien/{data.practitionerProfile.slug}
          </a>
        </div>
      )}
    </div>
  );
}
