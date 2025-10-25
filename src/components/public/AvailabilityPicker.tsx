// Cdw-Spm: Composant de sélection de créneaux disponibles (Version améliorée)
"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useConfirm } from "@/hooks/useConfirm";

type Slot = {
  start: string;
  end: string;
  consultationType: string;
  duration: number;
  price?: number;
};

type Props = {
  practitionerSlug: string;
  practitionerName: string;
  practitionerId: string;
  acceptNewClients: boolean;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AvailabilityPicker({
  practitionerSlug,
  practitionerName,
  practitionerId,
  acceptNewClients,
}: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [hasConsultedBefore, setHasConsultedBefore] = useState<boolean | null>(null);
  const [selectedConsultationType, setSelectedConsultationType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [booking, setBooking] = useState(false);
  const confirmDialog = useConfirm();

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUserInfo(data.user);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  // Calculer la plage de dates (2 semaines à partir d'aujourd'hui)
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 14);

  // Charger les disponibilités
  const { data, error, isLoading } = useSWR(
    selectedConsultationType
      ? `/api/public/practitioners/${practitionerSlug}/availabilities?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      : null,
    fetcher
  );

  const availabilities = data?.availabilities || [];

  // Filtrer les créneaux par type de consultation sélectionné
  const filteredSlots = availabilities.filter(
    (slot: Slot) => slot.consultationType === selectedConsultationType
  );

  // Grouper les créneaux par date
  const slotsByDate: Record<string, Slot[]> = {};
  filteredSlots.forEach((slot: Slot) => {
    const date = new Date(slot.start).toISOString().split("T")[0];
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push(slot);
  });

  // Récupérer les types de consultation uniques
  const consultationTypes = Array.from(
    new Set(availabilities.map((slot: Slot) => slot.consultationType))
  ).map((type: string) => {
    const slot = availabilities.find((s: Slot) => s.consultationType === type);
    return {
      label: type,
      duration: slot?.duration || 60,
      price: slot?.price,
    };
  });

  async function handleBooking() {
    if (!selectedSlot || !userInfo) return;

    setBooking(true);

    try {
      const res = await fetch(`/api/public/practitioners/${practitionerSlug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: selectedSlot.start,
          end: selectedSlot.end,
          consultationType: selectedSlot.consultationType,
          duration: selectedSlot.duration,
          price: selectedSlot.price,
          clientFirstName: userInfo.firstName || "",
          clientLastName: userInfo.lastName || "",
          clientEmail: userInfo.email,
          clientPhone: userInfo.phone || "",
        }),
      });

      const result = await res.json();

      if (result.success) {
        await confirmDialog.confirm({
          title: "✅ Rendez-vous confirmé !",
          message: result.message || "Vous recevrez un email de confirmation.",
          confirmText: "OK",
          cancelText: "",
          variant: "default",
        });

        // Reset
        setSelectedConsultationType(null);
        setSelectedDate(null);
        setSelectedSlot(null);
        setShowBookingModal(false);
      } else {
        await confirmDialog.confirm({
          title: "Erreur",
          message: result.error || "Impossible de réserver ce créneau.",
          confirmText: "OK",
          cancelText: "",
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Une erreur est survenue lors de la réservation.",
        confirmText: "OK",
        cancelText: "",
        variant: "danger",
      });
    } finally {
      setBooking(false);
    }
  }

  // Loading state
  if (isLoggedIn === null) {
    return (
      <article className="card">
        <h2 className="section-title m-0 mb-3">Prendre rendez-vous</h2>
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
          <p className="text-muted text-sm">Chargement...</p>
        </div>
      </article>
    );
  }

  // Non connecté
  if (!isLoggedIn) {
    return (
      <article className="card">
        <h2 className="section-title m-0 mb-3">Prendre rendez-vous</h2>
        <div className="text-center py-6 px-4">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-lg font-medium mb-2">Connexion requise</p>
          <p className="text-muted mb-4">
            Vous devez être connecté pour prendre rendez-vous.
          </p>
          <Link
            href={`/auth/login?next=/praticien/${practitionerSlug}`}
            className="btn"
          >
            Se connecter
          </Link>
        </div>
      </article>
    );
  }

  // Étape 1 : Demander si l'utilisateur a déjà consulté ce praticien
  if (hasConsultedBefore === null) {
    return (
      <article className="card">
        <h2 className="section-title m-0 mb-3">Prendre rendez-vous</h2>
        <div className="py-4">
          <p className="text-lg font-medium mb-4">
            Avez-vous déjà consulté {practitionerName} ?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setHasConsultedBefore(true)}
              className="btn flex-1"
            >
              Oui, déjà consulté
            </button>
            <button
              onClick={() => {
                if (!acceptNewClients) {
                  confirmDialog.confirm({
                    title: "Nouveaux clients non acceptés",
                    message: `${practitionerName} n'accepte pas de nouveaux clients pour le moment.`,
                    confirmText: "OK",
                    cancelText: "",
                    variant: "warning",
                  });
                } else {
                  setHasConsultedBefore(false);
                }
              }}
              className="btn btn-outline flex-1"
            >
              Non, première fois
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Message si praticien n'accepte pas de nouveaux clients (ne devrait pas arriver)
  if (!hasConsultedBefore && !acceptNewClients) {
    return (
      <article className="card bg-orange-50 border-orange-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-orange-900 mb-1">
              Nouveaux clients non acceptés
            </h3>
            <p className="text-sm text-orange-800">
              {practitionerName} n'accepte pas de nouveaux clients pour le moment.
            </p>
            <button
              onClick={() => setHasConsultedBefore(null)}
              className="text-sm text-orange-700 hover:underline mt-2"
            >
              ← Retour
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Étape 2 : Choisir le type de consultation
  if (!selectedConsultationType) {
    return (
      <article className="card">
        <h2 className="section-title m-0 mb-3">Choisir le type de consultation</h2>
        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
            <p className="text-muted text-sm">Chargement des consultations...</p>
          </div>
        ) : consultationTypes.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted">Aucune consultation disponible</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {consultationTypes.map((type) => (
              <button
                key={type.label}
                onClick={() => setSelectedConsultationType(type.label)}
                className="text-left p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <div className="font-medium text-lg">{type.label}</div>
                <div className="text-sm text-muted mt-1">
                  {type.duration} min {type.price && `• ${type.price}€`}
                </div>
              </button>
            ))}
            <button
              onClick={() => setHasConsultedBefore(null)}
              className="text-sm text-muted hover:underline mt-2"
            >
              ← Retour
            </button>
          </div>
        )}
      </article>
    );
  }

  // Étape 3 : Choisir le jour
  if (!selectedDate) {
    const availableDates = Object.keys(slotsByDate).sort();

    return (
      <article className="card">
        <h2 className="section-title m-0 mb-3">
          Choisir un jour - {selectedConsultationType}
        </h2>
        {availableDates.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted">Aucune disponibilité pour ce type de consultation</p>
            <button
              onClick={() => setSelectedConsultationType(null)}
              className="text-sm text-accent hover:underline mt-2"
            >
              ← Choisir un autre type
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {availableDates.map((date) => {
              const dateObj = new Date(date);
              const slotsCount = slotsByDate[date].length;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className="text-left p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  <div className="font-medium">
                    {dateObj.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </div>
                  <div className="text-sm text-muted mt-1">
                    {slotsCount} créneau{slotsCount > 1 ? "x" : ""} disponible{slotsCount > 1 ? "s" : ""}
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => setSelectedConsultationType(null)}
              className="text-sm text-muted hover:underline mt-2"
            >
              ← Choisir un autre type
            </button>
          </div>
        )}
      </article>
    );
  }

  // Étape 4 : Choisir l'horaire
  const slotsForSelectedDate = slotsByDate[selectedDate] || [];

  return (
    <>
      <article className="card">
        <h2 className="section-title m-0 mb-3">
          Choisir un horaire - {new Date(selectedDate).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h2>
        {slotsForSelectedDate.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted">Aucun créneau disponible</p>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-accent hover:underline mt-2"
            >
              ← Choisir un autre jour
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              {slotsForSelectedDate.map((slot, index) => {
                const time = new Date(slot.start).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setShowBookingModal(true);
                    }}
                    className="p-3 text-center border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors font-medium"
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-muted hover:underline"
            >
              ← Choisir un autre jour
            </button>
          </div>
        )}
      </article>

      {/* Modal de confirmation */}
      {showBookingModal && selectedSlot && (
        <ConfirmModal
          open={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
          onConfirm={handleBooking}
          title="Confirmer le rendez-vous"
          message={
            <div className="text-left space-y-3">
              <p>Vous êtes sur le point de réserver :</p>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                <div>
                  <span className="text-muted">Praticien :</span>{" "}
                  <strong>{practitionerName}</strong>
                </div>
                <div>
                  <span className="text-muted">Type :</span>{" "}
                  <strong>{selectedSlot.consultationType}</strong>
                </div>
                <div>
                  <span className="text-muted">Date :</span>{" "}
                  <strong>
                    {new Date(selectedSlot.start).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                </div>
                <div>
                  <span className="text-muted">Heure :</span>{" "}
                  <strong>
                    {new Date(selectedSlot.start).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </div>
                <div>
                  <span className="text-muted">Durée :</span>{" "}
                  <strong>{selectedSlot.duration} min</strong>
                </div>
                {selectedSlot.price && (
                  <div>
                    <span className="text-muted">Tarif :</span>{" "}
                    <strong>{selectedSlot.price}€</strong>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted">
                Vous recevrez un email de confirmation à <strong>{userInfo?.email}</strong>
              </div>
            </div>
          }
          confirmText={booking ? "Réservation..." : "Confirmer"}
          cancelText="Annuler"
          variant="default"
        />
      )}

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
    </>
  );
}
