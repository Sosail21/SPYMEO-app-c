// Cdw-Spm: Agenda Shell with API integration
"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import frLocale from "@fullcalendar/core/locales/fr";
import AppointmentModal from "./AppointmentModal";
import CreateAppointmentModal, { type AppointmentData } from "./CreateAppointmentModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useConfirm } from "@/hooks/useConfirm";

type Event = {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    description?: string;
    location?: string;
    status?: string;
    clientId?: string;
    clientName?: string;
  };
};

// Fonction pour définir la couleur d'un événement selon son statut
function getEventColor(status?: string) {
  switch (status) {
    case "CANCELLED":
    case "NO_SHOW":
      return { backgroundColor: "#ef4444", borderColor: "#dc2626" }; // Rouge
    case "COMPLETED":
      return { backgroundColor: "#22c55e", borderColor: "#16a34a" }; // Vert
    case "SCHEDULED":
    case "CONFIRMED":
      return { backgroundColor: "#3b82f6", borderColor: "#2563eb" }; // Bleu
    default:
      return { backgroundColor: "#3b82f6", borderColor: "#2563eb" }; // Bleu par défaut
  }
}

export default function AgendaShell() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [createModal, setCreateModal] = useState<{
    open: boolean;
    initialData?: { start: string; end?: string };
  }>({ open: false });
  const [activeTab, setActiveTab] = useState<"calendar" | "history">("calendar");
  const confirmDialog = useConfirm();

  // Charger les événements depuis l'API
  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/agenda/events");
      const data = await res.json();

      if (data.success && data.events) {
        // Appliquer les couleurs selon le statut
        const eventsWithColors = data.events.map((event: Event) => {
          const colors = getEventColor(event.extendedProps?.status);
          return {
            ...event,
            ...colors,
          };
        });
        setEvents(eventsWithColors);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    setCreateModal({
      open: true,
      initialData: {
        start: selectInfo.startStr,
        end: selectInfo.endStr || undefined,
      },
    });
  };

  const handleCreateAppointment = async (data: AppointmentData) => {
    try {
      const res = await fetch("/api/agenda/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success && result.event) {
        // Appliquer les couleurs au nouvel événement
        const colors = getEventColor(result.event.extendedProps?.status);
        const eventWithColors = { ...result.event, ...colors };
        setEvents((prev) => [...prev, eventWithColors]);
      } else {
        throw new Error(result.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setModal({ open: true, id: clickInfo.event.id });
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const eventId = dropInfo.event.id;

    try {
      const res = await fetch(`/api/agenda/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: dropInfo.event.startStr,
          end: dropInfo.event.endStr || undefined,
        }),
      });

      const data = await res.json();

      if (data.success && data.event) {
        // Appliquer les couleurs à l'événement déplacé
        const colors = getEventColor(data.event.extendedProps?.status);
        const eventWithColors = { ...data.event, ...colors };
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? eventWithColors : e))
        );
      } else {
        // Revert if failed
        dropInfo.revert();
        await confirmDialog.confirm({
          title: "Erreur",
          message: "Erreur lors de la modification du rendez-vous",
          confirmText: "OK",
          cancelText: "",
          variant: "danger"
        });
      }
    } catch (error) {
      console.error("Error updating event:", error);
      dropInfo.revert();
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Erreur lors de la modification du rendez-vous",
        confirmText: "OK",
        cancelText: "",
        variant: "danger"
      });
    }
  };

  const handleUpdate = async (id: string, updateData: any) => {
    try {
      const res = await fetch(`/api/agenda/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (data.success && data.event) {
        // Appliquer les couleurs à l'événement mis à jour
        const colors = getEventColor(data.event.extendedProps?.status);
        const eventWithColors = { ...data.event, ...colors };
        setEvents((prev) => prev.map((e) => (e.id === id ? eventWithColors : e)));
      } else {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/agenda/events/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        throw new Error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  const selectedEvent = modal.id ? events.find((e) => e.id === modal.id) : undefined;

  const now = new Date();
  const upcomingAppointments = events
    .filter((e) => new Date(e.start) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const pastAppointments = events
    .filter((e) => new Date(e.start) < now)
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  if (loading) {
    return (
      <div className="soft-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-muted">Chargement de l'agenda...</p>
      </div>
    );
  }

  return (
    <>
      {/* Tabs */}
      <div className="soft-card p-2 mb-4">
        <div className="segmented">
          <button
            className={activeTab === "calendar" ? "is-active" : ""}
            onClick={() => setActiveTab("calendar")}
          >
            📅 Calendrier
          </button>
          <button
            className={activeTab === "history" ? "is-active" : ""}
            onClick={() => setActiveTab("history")}
          >
            📋 Historique
          </button>
        </div>
      </div>

      {activeTab === "calendar" ? (
        <div className="soft-card p-3">
          <FullCalendar
        height="auto"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        locales={[frLocale]}
        locale="fr"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        initialView="timeGridWeek"
        nowIndicator
        selectable
        selectMirror
        editable
        eventOverlap
        slotDuration="00:30:00"
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: "08:00",
          endTime: "19:00",
        }}
        buttonText={{
          today: "aujourd'hui",
          month: "mois",
          week: "semaine",
          day: "jour",
          list: "liste",
        }}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
      />
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Upcoming Appointments */}
          <section className="soft-card p-6">
            <h2 className="text-xl font-semibold mb-4">Rendez-vous à venir ({upcomingAppointments.length})</h2>
            {upcomingAppointments.length === 0 ? (
              <p className="text-muted">Aucun rendez-vous à venir</p>
            ) : (
              <div className="grid gap-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="border border-border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition"
                    onClick={() => setModal({ open: true, id: apt.id })}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{apt.title}</div>
                        <div className="text-sm text-muted mt-1">
                          📅 {new Date(apt.start).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-muted">
                          🕐 {new Date(apt.start).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {apt.extendedProps?.clientName && (
                          <div className="text-sm text-muted mt-1">
                            👤 {apt.extendedProps.clientName}
                          </div>
                        )}
                        {apt.extendedProps?.location && (
                          <div className="text-sm text-muted">
                            📍 {apt.extendedProps.location}
                          </div>
                        )}
                      </div>
                      <span className="pill pill-muted flex-shrink-0">
                        {apt.extendedProps?.status || "SCHEDULED"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past Appointments */}
          <section className="soft-card p-6">
            <h2 className="text-xl font-semibold mb-4">Rendez-vous passés ({pastAppointments.length})</h2>
            {pastAppointments.length === 0 ? (
              <p className="text-muted">Aucun rendez-vous passé</p>
            ) : (
              <div className="grid gap-3">
                {pastAppointments.slice(0, 20).map((apt) => {
                  const status = apt.extendedProps?.status || "COMPLETED";
                  const isCompleted = status === "COMPLETED";
                  const isCancelled = status === "CANCELLED";

                  return (
                    <div
                      key={apt.id}
                      className="border border-border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition"
                      onClick={() => setModal({ open: true, id: apt.id })}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{apt.title}</div>
                          <div className="text-sm text-muted mt-1">
                            📅 {new Date(apt.start).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-sm text-muted">
                            🕐 {new Date(apt.start).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {apt.extendedProps?.clientName && (
                            <div className="text-sm text-muted mt-1">
                              👤 {apt.extendedProps.clientName}
                            </div>
                          )}
                        </div>
                        <span
                          className={`pill flex-shrink-0 ${
                            isCompleted
                              ? "pill-solid bg-green-100 text-green-700"
                              : isCancelled
                              ? "pill-solid bg-red-100 text-red-700"
                              : "pill-muted"
                          }`}
                        >
                          {isCompleted ? "✓ Honoré" : isCancelled ? "✕ Annulé" : status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      <AppointmentModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        appointment={selectedEvent}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <CreateAppointmentModal
        open={createModal.open}
        onClose={() => setCreateModal({ open: false })}
        onSubmit={handleCreateAppointment}
        initialData={createModal.initialData}
      />

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
