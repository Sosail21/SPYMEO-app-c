// Cdw-Spm: Page détails d'un rendez-vous
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Appointment } from "@/types/appointments";

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  async function fetchAppointment() {
    try {
      const res = await fetch(`/api/user/appointments/${appointmentId}`);
      const data = await res.json();

      if (data.success && data.appointment) {
        setAppointment(data.appointment);
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      return;
    }

    try {
      const res = await fetch(`/api/user/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'annulation");
        return;
      }

      alert("Rendez-vous annulé avec succès");
      router.push("/user/rendez-vous/a-venir");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Erreur lors de l'annulation");
    }
  }

  if (loading) {
    return (
      <main className="container-spy section">
        <div className="soft-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Chargement...</p>
        </div>
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="container-spy section">
        <div className="soft-card p-8 text-center">
          <p className="text-red-600">Rendez-vous non trouvé</p>
          <Link href="/user/rendez-vous/a-venir" className="btn mt-4">
            Retour aux rendez-vous
          </Link>
        </div>
      </main>
    );
  }

  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = appointmentDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="container-spy section max-w-4xl">
      <div className="mb-6">
        <Link
          href="/user/rendez-vous/a-venir"
          className="text-sm text-muted hover:text-text mb-2 inline-block"
        >
          ← Retour aux rendez-vous
        </Link>
        <h1 className="text-3xl font-bold">{appointment.title}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 grid gap-6">
          {/* Informations du rendez-vous */}
          <section className="soft-card p-6">
            <h2 className="text-xl font-semibold mb-4">Détails du rendez-vous</h2>

            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📅</div>
                <div>
                  <div className="font-medium">Date et heure</div>
                  <div className="text-muted capitalize">{formattedDate}</div>
                  <div className="text-muted">à {formattedTime}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">📍</div>
                <div>
                  <div className="font-medium">Lieu</div>
                  <div className="text-muted">{appointment.place}</div>
                  {appointment.address && (
                    <div className="text-sm text-muted mt-1">{appointment.address}</div>
                  )}
                </div>
              </div>

              {appointment.visioLink && (
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💻</div>
                  <div>
                    <div className="font-medium">Lien visio</div>
                    <a
                      href={appointment.visioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Rejoindre la consultation →
                    </a>
                  </div>
                </div>
              )}

              {appointment.description && (
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📝</div>
                  <div>
                    <div className="font-medium">Notes</div>
                    <div className="text-muted whitespace-pre-wrap">{appointment.description}</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <section className="soft-card p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>

            <div className="flex flex-wrap gap-3">
              {appointment.canCancel ? (
                <button onClick={handleCancel} className="btn bg-red-500 text-white hover:bg-red-600">
                  ✕ Annuler le rendez-vous
                </button>
              ) : (
                <div className="text-sm text-muted italic">
                  ⚠️ L'annulation n'est plus possible (moins de 24h avant le rendez-vous)
                </div>
              )}

              {appointment.practitionerPhone && (
                <a href={`tel:${appointment.practitionerPhone}`} className="btn btn-outline">
                  📞 Appeler le praticien
                </a>
              )}

              {appointment.practitionerEmail && (
                <a href={`mailto:${appointment.practitionerEmail}`} className="btn btn-outline">
                  ✉️ Envoyer un email
                </a>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar - Informations praticien */}
        <div className="grid gap-6">
          <section className="soft-card p-6">
            <h3 className="font-semibold mb-4">Praticien</h3>

            <div className="flex items-center gap-3 mb-4">
              {appointment.practitionerPhoto ? (
                <img
                  src={appointment.practitionerPhoto}
                  alt={appointment.practitionerName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl text-accent">
                    {appointment.practitionerName?.charAt(0) || "P"}
                  </span>
                </div>
              )}
              <div>
                <div className="font-semibold">{appointment.practitionerName}</div>
                <Link
                  href={`/praticien/${appointment.practitionerSlug}`}
                  className="text-sm text-accent hover:underline"
                >
                  Voir la fiche →
                </Link>
              </div>
            </div>

            {appointment.practitionerPhone && (
              <div className="text-sm text-muted mb-2">
                📞 {appointment.practitionerPhone}
              </div>
            )}

            {appointment.practitionerEmail && (
              <div className="text-sm text-muted">
                ✉️ {appointment.practitionerEmail}
              </div>
            )}
          </section>

          <section className="soft-card p-6 bg-emerald-50 border border-emerald-200">
            <div className="text-sm">
              <div className="font-semibold text-emerald-900 mb-2">
                ✓ Rappel automatique
              </div>
              <div className="text-emerald-800">
                Vous recevrez un rappel par email 24h avant votre rendez-vous.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
