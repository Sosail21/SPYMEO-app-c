// Cdw-Spm: Enhanced Appointment Modal with Client Management
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useConfirm } from "@/hooks/useConfirm";

type Appointment = {
  id: string;
  title: string;
  start: string;
  end?: string;
  extendedProps?: {
    description?: string;
    location?: string;
    status?: string;
    clientId?: string;
    clientName?: string;
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment;
  onUpdate?: (id: string, data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

const STATUS_LABELS: Record<string, { label: string; color: string; }> = {
  SCHEDULED: { label: "Programmé", color: "bg-blue-100 text-blue-700" },
  CONFIRMED: { label: "Confirmé", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Effectué", color: "bg-purple-100 text-purple-700" },
  NO_SHOW: { label: "Pas honoré", color: "bg-orange-100 text-orange-700" },
  CANCELLED: { label: "Annulé", color: "bg-red-100 text-red-700" },
};

function formatDate(isoString: string) {
  try {
    const date = new Date(isoString);
    return date.toLocaleString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export default function AppointmentModal({ open, onClose, appointment, onUpdate, onDelete }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const confirmDialog = useConfirm();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onClose]);

  if (!open || !appointment) return null;

  const status = appointment.extendedProps?.status || "SCHEDULED";
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.SCHEDULED;
  const clientId = appointment.extendedProps?.clientId;
  const clientName = appointment.extendedProps?.clientName;

  async function handleStatusChange(newStatus: string) {
    if (!onUpdate) return;
    setUpdating(true);
    try {
      await onUpdate(appointment.id, { status: newStatus });
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Erreur lors de la mise à jour du statut",
        confirmText: "OK",
        cancelText: "",
        variant: "danger"
      });
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    const confirmed = await confirmDialog.confirm({
      title: "Confirmer la suppression",
      message: "Êtes-vous sûr de vouloir supprimer ce rendez-vous ?",
      confirmText: "Confirmer",
      cancelText: "Annuler",
      variant: "danger"
    });
    if (!confirmed) return;

    try {
      await onDelete(appointment.id);
      onClose();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Erreur lors de la suppression",
        confirmText: "OK",
        cancelText: "",
        variant: "danger"
      });
    }
  }

  function handleOpenClient() {
    if (clientId) {
      router.push(`/pro/praticien/fiches-clients/${clientId}`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] grid place-items-center p-4">
      <div ref={ref} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{appointment.title}</h3>
            <span className={`pill text-xs ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <button className="btn btn-ghost px-2 py-1" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="grid gap-4 mb-6">
          {/* Dates */}
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted">Début :</span>
              <span className="text-sm">{formatDate(appointment.start)}</span>
            </div>
            {appointment.end && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted">Fin :</span>
                <span className="text-sm">{formatDate(appointment.end)}</span>
              </div>
            )}
          </div>

          {/* Client */}
          {clientName && (
            <div className="soft-card p-3 bg-accent/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted mb-1">Client</div>
                  <div className="font-medium">{clientName}</div>
                </div>
                {clientId && (
                  <button
                    onClick={handleOpenClient}
                    className="btn btn-sm btn-outline"
                  >
                    Voir la fiche
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {appointment.extendedProps?.description && (
            <div>
              <div className="text-sm font-medium text-muted mb-1">Description</div>
              <p className="text-sm whitespace-pre-wrap">{appointment.extendedProps.description}</p>
            </div>
          )}

          {/* Location */}
          {appointment.extendedProps?.location && (
            <div>
              <div className="text-sm font-medium text-muted mb-1">Lieu</div>
              <p className="text-sm">{appointment.extendedProps.location}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium text-muted mb-3">Actions</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {status !== "CONFIRMED" && status !== "CANCELLED" && (
              <button
                onClick={() => handleStatusChange("CONFIRMED")}
                disabled={updating}
                className="btn btn-sm btn-outline border-green-500 text-green-700 hover:bg-green-50"
              >
                Confirmer
              </button>
            )}
            {status !== "COMPLETED" && status !== "CANCELLED" && (
              <button
                onClick={() => handleStatusChange("COMPLETED")}
                disabled={updating}
                className="btn btn-sm btn-outline border-purple-500 text-purple-700 hover:bg-purple-50"
              >
                Marquer comme effectué
              </button>
            )}
            {status !== "NO_SHOW" && status !== "CANCELLED" && status !== "COMPLETED" && (
              <button
                onClick={() => handleStatusChange("NO_SHOW")}
                disabled={updating}
                className="btn btn-sm btn-outline border-orange-500 text-orange-700 hover:bg-orange-50"
              >
                Pas honoré
              </button>
            )}
            {status !== "CANCELLED" && (
              <button
                onClick={() => handleStatusChange("CANCELLED")}
                disabled={updating}
                className="btn btn-sm btn-outline border-red-500 text-red-700 hover:bg-red-50"
              >
                Annuler le RDV
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t">
            <button
              onClick={handleDelete}
              className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
            >
              Supprimer
            </button>
            <button onClick={onClose} className="btn btn-sm">
              Fermer
            </button>
          </div>
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
