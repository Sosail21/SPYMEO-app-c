"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  data?: {
    id: string;
    title: string;
    startText: string;
    endText?: string;
    clientId?: string;
  };
  onDelete?: (id: string) => void;
};

export default function EventModal({ open, onClose, data, onDelete }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onClose]);

  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] grid place-items-center p-4">
      <div ref={ref} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{data.title}</h3>
          <button className="btn btn-ghost px-2 py-1" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="mt-3 text-sm text-slate-700">
          <div className="mb-1">
            <span className="font-medium">Début :</span> {data.startText}
          </div>
          {data.endText && (
            <div className="mb-1">
              <span className="font-medium">Fin :</span> {data.endText}
            </div>
          )}
          {data.clientId && (
            <div className="mt-2">
              <a className="link" href={`/pro/fiches-clients/${data.clientId}`} target="_self">
                Ouvrir la fiche du client ↗
              </a>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          {onDelete && (
            <button className="btn btn-danger" onClick={() => onDelete(data.id)}>
              Supprimer le RDV
            </button>
          )}
          <button className="btn" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
