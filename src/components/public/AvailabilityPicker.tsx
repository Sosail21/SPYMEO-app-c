// Cdw-Spm: Composant de sélection de créneaux disponibles
"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
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
  onBookingComplete?: () => void;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AvailabilityPicker({ practitionerSlug, practitionerName, onBookingComplete }: Props) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString().split("T")[0];
  });

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const confirmDialog = useConfirm();

  // Calculer la plage de dates (7 jours à partir d'aujourd'hui)
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 14); // 2 semaines

  // Charger les disponibilités
  const { data, error, isLoading } = useSWR(
    `/api/public/practitioners/${practitionerSlug}/availabilities?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
    fetcher
  );

  const availabilities = data?.availabilities || [];

  // Grouper par date
  const slotsByDate: Record<string, Slot[]> = {};
  availabilities.forEach((slot: Slot) => {
    const date = new Date(slot.start).toISOString().split("T")[0];
    if (!slotsByDate[date]) {
      slotsByDate[date] = [];
    }
    slotsByDate[date].push(slot);
  });

  // Générer les 7 prochains jours pour l'affichage
  const dates = [];
  const current = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  function formatTime(isoDate: string) {
    return new Date(isoDate).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleSlotClick(slot: Slot) {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="text-center py-8 text-muted">
          Chargement des disponibilités...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8 text-red-600">
          Erreur lors du chargement des disponibilités
        </div>
      </div>
    );
  }

  const slotsForSelectedDate = slotsByDate[selectedDate] || [];

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Disponibilités</h2>

      {/* Sélecteur de date */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => {
            const dateStr = date.toISOString().split("T")[0];
            const hasSlots = (slotsByDate[dateStr] || []).length > 0;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all
                  ${isSelected ? "border-accent bg-accent/10 font-semibold" : "border-border hover:border-accent/50"}
                  ${!hasSlots ? "opacity-50 cursor-not-allowed" : ""}
                `}
                disabled={!hasSlots}
              >
                <div className="text-sm">{formatDate(date)}</div>
                <div className="text-xs text-muted mt-1">
                  {hasSlots ? `${slotsByDate[dateStr].length} créneaux` : "Indisponible"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des créneaux pour la date sélectionnée */}
      {slotsForSelectedDate.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">📅</div>
          <p className="text-muted">Aucun créneau disponible pour cette date</p>
          <p className="text-sm text-muted mt-2">
            Sélectionnez une autre date ou contactez directement le praticien
          </p>
        </div>
      ) : (
        <div>
          <h3 className="font-medium mb-3">
            Créneaux disponibles le {new Date(selectedDate).toLocaleDateString("fr-FR", { dateStyle: "full" })}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {slotsForSelectedDate.map((slot, index) => (
              <button
                key={index}
                onClick={() => handleSlotClick(slot)}
                className="p-4 border-2 border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left"
              >
                <div className="font-semibold text-lg">{formatTime(slot.start)}</div>
                <div className="text-sm text-muted mt-1">{slot.consultationType}</div>
                <div className="text-xs text-muted mt-1">
                  {slot.duration} min {slot.price ? `• ${slot.price}€` : ""}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal de réservation */}
      {showBookingModal && selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          practitionerSlug={practitionerSlug}
          practitionerName={practitionerName}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
          onSuccess={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
            onBookingComplete?.();
          }}
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
    </div>
  );
}

// Modal de réservation
function BookingModal({
  slot,
  practitionerSlug,
  practitionerName,
  onClose,
  onSuccess,
}: {
  slot: Slot;
  practitionerSlug: string;
  practitionerName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const confirmDialog = useConfirm();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      await confirmDialog.confirm({
        title: "Attention",
        message: "Veuillez remplir tous les champs obligatoires",
        confirmText: "OK",
        cancelText: "",
        variant: "warning",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/public/practitioners/${practitionerSlug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: slot.start,
          consultationType: slot.consultationType,
          duration: slot.duration,
          price: slot.price,
          clientFirstName: firstName.trim(),
          clientLastName: lastName.trim(),
          clientEmail: email.trim(),
          clientPhone: phone.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la réservation");
      }

      await confirmDialog.confirm({
        title: "✅ Rendez-vous confirmé !",
        message: data.message || "Vous recevrez un email de confirmation.",
        confirmText: "OK",
        cancelText: "",
        variant: "default",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      await confirmDialog.confirm({
        title: "Erreur",
        message: error.message || "Une erreur est survenue lors de la réservation",
        confirmText: "OK",
        cancelText: "",
        variant: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const startDate = new Date(slot.start);
  const formattedDateTime = startDate.toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] grid place-items-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xl font-semibold">Réserver un rendez-vous</h3>
              <p className="text-sm text-muted mt-1">avec {practitionerName}</p>
            </div>
            <button className="btn btn-ghost px-2 py-1" onClick={onClose} aria-label="Fermer">
              ✕
            </button>
          </div>

          {/* Récapitulatif */}
          <div className="bg-accent/10 rounded-lg p-4 mb-6">
            <div className="font-medium">{slot.consultationType}</div>
            <div className="text-sm text-muted mt-1">{formattedDateTime}</div>
            <div className="text-sm text-muted">
              Durée : {slot.duration} min {slot.price ? `• Tarif : ${slot.price}€` : ""}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Informations personnelles */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nom *
                </label>
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
              <label className="block text-sm font-medium mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Motif de consultation (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Décrivez brièvement le motif de votre consultation..."
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
                disabled={submitting}
              >
                Annuler
              </button>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? "Réservation..." : "Confirmer le rendez-vous"}
              </button>
            </div>
          </form>
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
    </>
  );
}
