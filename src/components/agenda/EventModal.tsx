// Cdw-Spm: Event Modal for Agenda
"use client";

import { useEffect, useRef } from "react";

type Event = {
  id: string;
  title: string;
  start: string;
  end?: string;
  extendedProps?: {
    description?: string;
    location?: string;
    status?: string;
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  event?: Event;
  onDelete?: (id: string) => void;
};

function formatDate(isoString: string) {
  try {
    const date = new Date(isoString);
    return date.toLocaleString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export default function EventModal({ open, onClose, event, onDelete }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onClose]);

  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] grid place-items-center p-4">
      <div ref={ref} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <button className="btn btn-ghost px-2 py-1" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="mt-3 text-sm text-slate-700 grid gap-2">
          <div>
            <span className="font-medium">Début :</span> {formatDate(event.start)}
          </div>
          {event.end && (
            <div>
              <span className="font-medium">Fin :</span> {formatDate(event.end)}
            </div>
          )}
          {event.extendedProps?.description && (
            <div>
              <span className="font-medium">Description :</span> {event.extendedProps.description}
            </div>
          )}
          {event.extendedProps?.location && (
            <div>
              <span className="font-medium">Lieu :</span> {event.extendedProps.location}
            </div>
          )}
          {event.extendedProps?.status && (
            <div>
              <span className="font-medium">Statut :</span>{" "}
              <span className="pill pill-muted text-xs">
                {event.extendedProps.status}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          {onDelete && (
            <button
              className="btn bg-red-500 text-white hover:bg-red-600"
              onClick={() => onDelete(event.id)}
            >
              Supprimer le RDV
            </button>
          )}
          <button className="btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
