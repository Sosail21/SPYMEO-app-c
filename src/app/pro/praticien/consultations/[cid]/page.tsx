// Cdw-Spm: Page détails d'une consultation
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useConfirm } from "@/hooks/useConfirm";

type ConsultationDetail = {
  id: string;
  date: Date;
  motif: string | null;
  notes: string | null;
  diagnosis: string | null;
  duration: number | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    birthDate: Date | null;
    address: string | null;
    antecedents: string[];
  };
};

export default function ConsultationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params.cid as string;

  const [consultation, setConsultation] = useState<ConsultationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const confirmDialog = useConfirm();

  // Form state
  const [motif, setMotif] = useState("");
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    fetchConsultation();
  }, [consultationId]);

  async function fetchConsultation() {
    try {
      const res = await fetch(`/api/consultations/${consultationId}`);
      const data = await res.json();

      if (data.success && data.consultation) {
        const c = data.consultation;
        setConsultation(c);
        setMotif(c.motif || "");
        setNotes(c.notes || "");
        setDiagnosis(c.diagnosis || "");
        setDuration(c.duration?.toString() || "");
      }
    } catch (error) {
      console.error("Error fetching consultation:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);

    try {
      const res = await fetch(`/api/consultations/${consultationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motif,
          notes: notes || null,
          diagnosis: diagnosis || null,
          duration: duration ? parseInt(duration) : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setConsultation(data.consultation);
        setEditing(false);
        await confirmDialog.confirm({
          title: "Succès",
          message: "Consultation mise à jour avec succès",
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
      console.error("Error updating consultation:", error);
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
      title: "Supprimer la consultation",
      message: `Êtes-vous sûr de vouloir supprimer cette consultation ? Cette action est irréversible.`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/consultations/${consultationId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        await confirmDialog.confirm({
          title: "Succès",
          message: "Consultation supprimée avec succès",
          confirmText: "OK",
          cancelText: "",
        });
        router.push(`/pro/praticien/fiches-clients/${consultation?.client.id}`);
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
      console.error("Error deleting consultation:", error);
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Erreur lors de la suppression",
        confirmText: "OK",
        cancelText: "",
        variant: "danger",
      });
    }
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

  if (!consultation) {
    return (
      <div className="container-spy section">
        <div className="soft-card p-8 text-center">
          <p className="text-red-600">Consultation non trouvée</p>
          <Link href="/pro/praticien/fiches-clients" className="btn mt-4">
            Retour aux clients
          </Link>
        </div>
      </div>
    );
  }

  const client = consultation.client;

  return (
    <div className="container-spy section max-w-6xl">
      <div className="mb-6">
        <Link
          href={`/pro/praticien/fiches-clients/${client.id}`}
          className="text-sm text-muted hover:text-text mb-2 inline-block"
        >
          ← Retour à la fiche client
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Consultation</h1>
            <p className="text-muted">
              {client.firstName} {client.lastName} •{" "}
              {new Date(consultation.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
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
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 grid gap-6">
          {/* Détails de la consultation */}
          <section className="soft-card p-6">
            <h2 className="text-xl font-semibold mb-4">Détails de la consultation</h2>

            {!editing ? (
              <div className="grid gap-4">
                <div>
                  <div className="text-sm text-muted">Motif</div>
                  <div className="font-medium">{consultation.motif || "Non renseigné"}</div>
                </div>

                {consultation.duration && (
                  <div>
                    <div className="text-sm text-muted">Durée</div>
                    <div className="font-medium">{consultation.duration} minutes</div>
                  </div>
                )}

                {consultation.notes && (
                  <div>
                    <div className="text-sm text-muted">Notes</div>
                    <div className="whitespace-pre-wrap">{consultation.notes}</div>
                  </div>
                )}

                {consultation.diagnosis && (
                  <div>
                    <div className="text-sm text-muted">Diagnostic</div>
                    <div className="whitespace-pre-wrap">{consultation.diagnosis}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Motif *</label>
                  <input
                    type="text"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    placeholder="Ex: Consultation de suivi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    placeholder="Ex: 60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    placeholder="Notes sur la consultation..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Diagnostic</label>
                  <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    placeholder="Diagnostic établi..."
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar - Informations client */}
        <div className="grid gap-6">
          <section className="soft-card p-6">
            <h3 className="font-semibold mb-4">Patient</h3>

            <div className="grid gap-3 text-sm">
              <div>
                <div className="text-muted">Nom</div>
                <div className="font-medium">
                  {client.firstName} {client.lastName}
                </div>
              </div>

              {client.email && (
                <div>
                  <div className="text-muted">Email</div>
                  <div>{client.email}</div>
                </div>
              )}

              {client.phone && (
                <div>
                  <div className="text-muted">Téléphone</div>
                  <div>{client.phone}</div>
                </div>
              )}

              {client.birthDate && (
                <div>
                  <div className="text-muted">Date de naissance</div>
                  <div>{new Date(client.birthDate).toLocaleDateString("fr-FR")}</div>
                </div>
              )}

              {client.address && (
                <div>
                  <div className="text-muted">Adresse</div>
                  <div>{client.address}</div>
                </div>
              )}
            </div>

            <Link
              href={`/pro/praticien/fiches-clients/${client.id}`}
              className="btn btn-outline w-full mt-4"
            >
              Voir la fiche complète
            </Link>
          </section>

          {client.antecedents && client.antecedents.length > 0 && (
            <section className="soft-card p-6">
              <h3 className="font-semibold mb-4">Antécédents</h3>
              <div className="flex flex-wrap gap-2">
                {client.antecedents.map((ant, idx) => (
                  <span key={idx} className="pill pill-muted">
                    {ant}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
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
