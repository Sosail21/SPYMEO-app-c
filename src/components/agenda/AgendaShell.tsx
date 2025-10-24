// Cdw-Spm: Agenda Shell with API integration
"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import frLocale from "@fullcalendar/core/locales/fr";
import EventModal from "./EventModal";

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

export default function AgendaShell() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; id?: string }>({ open: false });

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

  const handleDateSelect = async (selectInfo: DateSelectArg) => {
    const title = prompt("Titre du rendez-vous ?");
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (!title) return;

    try {
      const res = await fetch("/api/agenda/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr || undefined,
        }),
      });

      const data = await res.json();

      if (data.success && data.event) {
        setEvents((prev) => [...prev, data.event]);
      } else {
        alert("Erreur lors de la création du rendez-vous");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Erreur lors de la création du rendez-vous");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) {
      return;
    }

    try {
      const res = await fetch(`/api/agenda/events/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        setModal({ open: false });
      } else {
        alert("Erreur lors de la suppression du rendez-vous");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Erreur lors de la suppression du rendez-vous");
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

      <EventModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        event={selectedEvent}
        onDelete={handleDelete}
      />
    </div>
  );
}
