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

type Event = {
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

export default function AgendaShell() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [createModal, setCreateModal] = useState<{
    open: boolean;
    initialData?: { start: string; end?: string };
  }>({ open: false });

  // Charger les événements depuis l'API
  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/agenda/events");
      const data = await res.json();

      if (data.success && data.events) {
        setEvents(data.events);
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
        setEvents((prev) => [...prev, result.event]);
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
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? data.event : e))
        );
      } else {
        // Revert if failed
        dropInfo.revert();
        alert("Erreur lors de la modification du rendez-vous");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      dropInfo.revert();
      alert("Erreur lors de la modification du rendez-vous");
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
        setEvents((prev) => prev.map((e) => (e.id === id ? data.event : e)));
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

  if (loading) {
    return (
      <div className="soft-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-muted">Chargement de l'agenda...</p>
      </div>
    );
  }

  return (
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
    </div>
  );
}
