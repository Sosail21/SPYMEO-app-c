// Cdw-Spm: Create/Edit Appointment Modal with Client Selection
"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentData) => Promise<void>;
  initialData?: {
    start: string;
    end?: string;
  };
};

export type AppointmentData = {
  title: string;
  description?: string;
  start: string;
  end?: string;
  location?: string;
  clientId?: string;
  status?: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CreateAppointmentModal({ open, onClose, onSubmit, initialData }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useSWR(open ? "/api/pro/clients" : null, fetcher);

  const clients: Client[] = data?.success && Array.isArray(data.clients) ? data.clients : [];

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize dates from initialData
  useEffect(() => {
    if (open && initialData) {
      const start = new Date(initialData.start);
      setStartDate(start.toISOString().split("T")[0]);
      setStartTime(start.toTimeString().slice(0, 5));

      if (initialData.end) {
        const end = new Date(initialData.end);
        setEndDate(end.toISOString().split("T")[0]);
        setEndTime(end.toTimeString().slice(0, 5));
      } else {
        // Default: 1 hour after start
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        setEndDate(end.toISOString().split("T")[0]);
        setEndTime(end.toTimeString().slice(0, 5));
      }
    }
  }, [open, initialData]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onClose]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setLocation("");
      setClientId("");
      setClientSearch("");
      setShowClientDropdown(false);
    }
  }, [open]);

  // Filter clients by search
  const filteredClients = clients.filter((c) => {
    const searchLower = clientSearch.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(searchLower) ||
      c.lastName.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(clientSearch)
    );
  });

  // Get selected client name
  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedClientName = selectedClient
    ? `${selectedClient.firstName} ${selectedClient.lastName}`
    : "";

  function handleClientSelect(client: Client) {
    setClientId(client.id);
    setClientSearch(`${client.firstName} ${client.lastName}`);
    setShowClientDropdown(false);

    // Auto-fill title if empty
    if (!title) {
      setTitle(`Consultation ${client.firstName} ${client.lastName}`);
    }
  }

  function handleClientInputChange(value: string) {
    setClientSearch(value);
    setShowClientDropdown(true);

    // Clear clientId if user modifies the input
    if (value !== selectedClientName) {
      setClientId("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !startDate || !startTime) {
      alert("Veuillez remplir au moins le titre et la date/heure de début");
      return;
    }

    // Construct Date objects with local timezone, then convert to ISO
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const startISO = startDateTime.toISOString();

    let endISO: string | undefined;
    if (endDate && endTime) {
      const endDateTime = new Date(`${endDate}T${endTime}`);
      endISO = endDateTime.toISOString();
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        start: startISO,
        end: endISO,
        location: location.trim() || undefined,
        clientId: clientId || undefined,
        status: "SCHEDULED",
      });
      onClose();
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Erreur lors de la création du rendez-vous");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] grid place-items-center p-4">
      <div ref={ref} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-xl font-semibold">Nouveau rendez-vous</h3>
          <button className="btn btn-ghost px-2 py-1" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Client Selection */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Client <span className="text-muted text-xs">(optionnel)</span>
            </label>
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => handleClientInputChange(e.target.value)}
              onFocus={() => setShowClientDropdown(true)}
              placeholder="Rechercher un client..."
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
            {showClientDropdown && filteredClients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full px-3 py-2 text-left hover:bg-accent/10 border-b border-border last:border-b-0"
                  >
                    <div className="font-medium">
                      {client.firstName} {client.lastName}
                    </div>
                    {(client.email || client.phone) && (
                      <div className="text-xs text-muted">
                        {client.email && <span>{client.email}</span>}
                        {client.email && client.phone && <span> • </span>}
                        {client.phone && <span>{client.phone}</span>}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Consultation, Suivi..."
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Date de début *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Heure de début *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Heure de fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Lieu
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Cabinet, Visio, Domicile..."
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Notes complémentaires..."
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
            <button
              type="submit"
              className="btn"
              disabled={submitting}
            >
              {submitting ? "Création..." : "Créer le rendez-vous"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
