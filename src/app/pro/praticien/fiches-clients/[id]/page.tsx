"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ClientTabs from "@/components/patient/ClientTabs";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useConfirm } from "@/hooks/useConfirm";

type ApiClient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  notes: string | null;
  antecedents: string[];
  totalVisits: number;
  lastVisitAt: string | null;
  createdAt: string;
  consultations?: Array<{
    id: string;
    date: string;
    motif: string;
    notes: string | null;
    duration: number | null;
  }>;
  appointments?: Array<{
    id: string;
    title: string;
    startAt: string;
    endAt: string | null;
    status: string;
    description: string | null;
    location: string | null;
  }>;
  documents?: Array<{
    id: string;
    title: string;
    type: string;
    url: string;
    createdAt: string;
  }>;
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
};

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<ApiClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const confirmDialog = useConfirm();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [antecedents, setAntecedents] = useState<string[]>([]);
  const [newAntecedent, setNewAntecedent] = useState("");

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  async function fetchClient() {
    try {
      const res = await fetch(`/api/pro/clients/${clientId}`);
      const data = await res.json();

      if (data.success && data.client) {
        const c = data.client;
        setClient(c);
        setFirstName(c.firstName);
        setLastName(c.lastName);
        setEmail(c.email || "");
        setPhone(c.phone || "");
        setBirthDate(c.birthDate ? c.birthDate.split("T")[0] : "");
        setAddress(c.address || "");
        setNotes(c.notes || "");
        setAntecedents(c.antecedents || []);
      }
    } catch (error) {
      console.error("Error fetching client:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);

    try {
      const res = await fetch(`/api/pro/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          birthDate: birthDate || null,
          address: address || null,
          notes: notes || null,
          antecedents,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setClient(data.client);
        setEditing(false);
        await confirmDialog.confirm({
          title: "Succès",
          message: "Client mis à jour avec succès",
          confirmText: "OK",
          cancelText: "",
        });
      } else {
        await confirmDialog.confirm({
          title: "Erreur",
          message: data.error || "Erreur lors de la mise à jour",
          confirmText: "OK",
          cancelText: "",
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Error updating client:", error);
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Erreur lors de la mise à jour",
        confirmText: "OK",
        cancelText: "",
        variant: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = await confirmDialog.confirm({
      title: "Supprimer le client",
      message: `Êtes-vous sûr de vouloir supprimer ${client?.firstName} ${client?.lastName} ? Cette action est irréversible.`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/pro/clients/${clientId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        await confirmDialog.confirm({
          title: "Succès",
          message: "Client supprimé avec succès",
          confirmText: "OK",
          cancelText: "",
        });
        router.push("/pro/praticien/fiches-clients");
      } else {
        await confirmDialog.confirm({
          title: "Erreur",
          message: data.error || "Erreur lors de la suppression",
          confirmText: "OK",
          cancelText: "",
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Erreur lors de la suppression",
        confirmText: "OK",
        cancelText: "",
        variant: "danger",
      });
    }
  }

  async function addAntecedent() {
    const trimmed = newAntecedent.trim();
    if (!trimmed) return;
    if (antecedents.includes(trimmed)) {
      await confirmDialog.confirm({
        title: "Information",
        message: "Cet antécédent existe déjà",
        confirmText: "OK",
        cancelText: "",
        variant: "warning",
      });
      return;
    }
    setAntecedents([...antecedents, trimmed]);
    setNewAntecedent("");
  }

  function removeAntecedent(index: number) {
    setAntecedents(antecedents.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="container-spy section">
        <div className="soft-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container-spy section">
        <div className="soft-card p-8 text-center">
          <p className="text-red-600">Client non trouvé</p>
          <button onClick={() => router.push("/pro/praticien/fiches-clients")} className="btn mt-4">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-spy section max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.push("/pro/praticien/fiches-clients")}
            className="text-sm text-muted hover:text-text mb-2"
          >
            ← Retour à la liste
          </button>
          <h1 className="text-3xl font-bold">
            {client.firstName} {client.lastName}
          </h1>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => router.push(`/pro/praticien/agenda?clientId=${client.id}&clientName=${client.firstName}%20${client.lastName}`)}
                className="btn bg-accent text-white hover:bg-accent/90"
              >
                📅 Créer un RDV
              </button>
              <button onClick={() => setEditing(true)} className="btn btn-outline">
                Modifier
              </button>
              <button onClick={handleDelete} className="btn bg-red-500 text-white hover:bg-red-600">
                Supprimer
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="btn btn-ghost">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="btn">
                {saving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 grid gap-6">
          {/* Informations personnelles */}
          <section className="soft-card p-6">
            <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>

            {!editing ? (
              <div className="grid gap-3">
                <div>
                  <span className="text-sm text-muted">Email :</span>{" "}
                  {client.email || <span className="text-muted">Non renseigné</span>}
                </div>
                <div>
                  <span className="text-sm text-muted">Téléphone :</span>{" "}
                  {client.phone || <span className="text-muted">Non renseigné</span>}
                </div>
                <div>
                  <span className="text-sm text-muted">Date de naissance :</span>{" "}
                  {client.birthDate ? new Date(client.birthDate).toLocaleDateString("fr-FR") : <span className="text-muted">Non renseignée</span>}
                </div>
                <div>
                  <span className="text-sm text-muted">Adresse :</span>{" "}
                  {client.address || <span className="text-muted">Non renseignée</span>}
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prénom *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date de naissance</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adresse</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Antécédents */}
          <section className="soft-card p-6">
            <h2 className="text-xl font-semibold mb-4">Antécédents médicaux</h2>

            {antecedents.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {antecedents.map((ant, idx) => (
                  <span key={idx} className="pill pill-muted flex items-center gap-2">
                    {ant}
                    {editing && (
                      <button onClick={() => removeAntecedent(idx)} className="hover:opacity-70">
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {editing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAntecedent}
                  onChange={(e) => setNewAntecedent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAntecedent();
                    }
                  }}
                  placeholder="Ajouter un antécédent"
                  className="flex-1 px-3 py-2 border border-border rounded-lg"
                />
                <button onClick={addAntecedent} className="btn btn-outline">
                  Ajouter
                </button>
              </div>
            )}

            {!editing && antecedents.length === 0 && (
              <p className="text-muted">Aucun antécédent renseigné</p>
            )}
          </section>

          {/* Notes */}
          <section className="soft-card p-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>

            {!editing ? (
              <div className="text-sm whitespace-pre-wrap">
                {client.notes || <span className="text-muted">Aucune note</span>}
              </div>
            ) : (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-lg"
                placeholder="Notes sur le client..."
              />
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="grid gap-6">
          {/* Stats */}
          <section className="soft-card p-6">
            <h3 className="font-semibold mb-4">Statistiques</h3>
            <div className="grid gap-3 text-sm">
              <div>
                <span className="text-muted">Consultations :</span>{" "}
                <span className="font-semibold">{client.totalVisits}</span>
              </div>
              {client.lastVisitAt && (
                <div>
                  <span className="text-muted">Dernière visite :</span>{" "}
                  <span className="font-semibold">
                    {new Date(client.lastVisitAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Dernières consultations avec notes */}
          {client.consultations && client.consultations.length > 0 && (
            <section className="soft-card p-6">
              <h3 className="font-semibold mb-4">Dernières consultations</h3>
              <div className="grid gap-3">
                {client.consultations.slice(0, 3).map((c) => (
                  <div key={c.id} className="text-sm border-l-2 border-accent pl-3">
                    <div className="font-medium">{c.motif}</div>
                    <div className="text-xs text-muted mb-1">
                      {new Date(c.date).toLocaleDateString("fr-FR")}
                    </div>
                    {c.notes && (
                      <div className="text-xs mt-1 p-2 bg-slate-50 rounded text-slate-700 line-clamp-3">
                        {c.notes}
                      </div>
                    )}
                    <Link
                      href={`/pro/praticien/consultations/${c.id}`}
                      className="text-xs text-accent hover:underline inline-block mt-1"
                    >
                      Voir détails →
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Onglets détaillés */}
      <div className="mt-8">
        <ClientTabs client={{
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email || undefined,
          phone: client.phone || undefined,
          address: client.address || undefined,
          birthDate: client.birthDate || undefined,
          createdAt: client.createdAt,
          antecedents: client.antecedents || [],
          consultations: [
            // Consultations existantes
            ...(client.consultations?.map(c => ({
              id: c.id,
              clientId: client.id,
              date: c.date,
              motif: c.motif || undefined,
              notes: c.notes || undefined,
            })) || []),
            // Appointments complétés comme consultations
            ...(client.appointments
              ?.filter(a => a.status === "COMPLETED")
              .map(a => ({
                id: a.id,
                clientId: client.id,
                date: a.startAt,
                motif: a.title,
                notes: a.description || undefined,
              })) || []),
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          appointments: client.appointments?.map(a => ({
            id: a.id,
            title: a.title,
            startAt: a.startAt,
            endAt: a.endAt,
            status: a.status,
            description: a.description,
            location: a.location,
          })),
          documents: client.documents?.map(d => ({
            id: d.id,
            title: d.title,
            url: d.url,
            type: d.type,
            createdAt: d.createdAt,
          })),
          invoices: client.invoices?.map(inv => ({
            id: inv.id,
            clientId: client.id,
            amount: inv.amount,
            status: inv.status as "pending" | "paid" | "cancelled",
            date: inv.createdAt,
          })),
          stats: {
            totalVisits: client.totalVisits,
            lastVisit: client.lastVisitAt ? new Date(client.lastVisitAt).toLocaleDateString("fr-FR") : undefined,
          },
        }} />
      </div>

      <ConfirmModal
        open={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
      />
    </div>
  );
}
