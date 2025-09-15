"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { EventDropArg, DateSelectArg, EventClickArg } from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import EventModal from "./EventModal";

type Event = {
  id: string;
  title: string;
  start: string;
  end?: string;
  clientId?: string;
};

const LS_KEY = "spymeo_agenda_events_v1";

const INITIAL_EVENTS: Event[] = [
  {
    id: "1",
    title: "Consultation - Aline Dupont",
    start: new Date().toISOString(),
    clientId: "1",
  },
];

function fmt(dt: string | Date) {
  const d = typeof dt === "string" ? new Date(dt) : dt;
  return d.toLocaleString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgendaShell() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [modal, setModal] = useState<{ open: boolean; id?: string }>({ open: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setEvents(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(events));
    } catch {}
  }, [events]);

  const headerToolbar = useMemo(
    () => ({
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    }),
    []
  );

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const title = prompt("Titre du rendez-vous ?");
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (title) {
      const newEvent: Event = {
        id: String(Date.now()),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr || undefined,
      };
      setEvents((prev) => [...prev, newEvent]);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setModal({ open: true, id: clickInfo.event.id });
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === dropInfo.event.id
          ? {
              ...e,
              start: dropInfo.event.startStr!,
              end: dropInfo.event.endStr || undefined,
            }
          : e
      )
    );
  };

  const dataForModal = useMemo(() => {
    if (!modal.open || !modal.id) return undefined;
    const e = events.find((x) => x.id === modal.id);
    if (!e) return undefined;
    return {
      id: e.id,
      title: e.title,
      startText: fmt(e.start),
      endText: e.end ? fmt(e.end) : undefined,
      clientId: e.clientId,
    };
  }, [modal, events]);

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setModal({ open: false });
  };

  return (
    <div className="soft-card p-3">
      <FullCalendar
        height="auto"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        locales={[frLocale]}
        locale="fr"
        headerToolbar={headerToolbar}
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
        data={dataForModal}
        onDelete={handleDelete}
      />
    </div>
  );
}
