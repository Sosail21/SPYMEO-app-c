type Evt = {
  id: string;
  title: string;
  start: string;
  end?: string;
  extendedProps?: { clientId?: string; clientName?: string; notes?: string; color?: string };
};

let EVENTS: Evt[] = [
  {
    id: "1",
    title: "Consultation adulte",
    start: new Date().toISOString(),
    end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    extendedProps: { clientId: "1", clientName: "Alice Dupont", notes: "Suivi", color: "#0b5b68" }
  }
];

export function listEvents(): Evt[] {
  return EVENTS;
}

export function createEvent(data: Partial<Evt>): Evt {
  const e: Evt = {
    id: Math.random().toString(36).slice(2),
    title: data.title ?? "RDV",
    start: data.start ?? new Date().toISOString(),
    end: data.end,
    extendedProps: data.extendedProps ?? {},
  };
  EVENTS.push(e);
  return e;
}

export function updateEvent(id: string, data: Partial<Evt>): Evt | null {
  const i = EVENTS.findIndex(e => e.id === id);
  if (i === -1) return null;
  EVENTS[i] = { ...EVENTS[i], ...data };
  return EVENTS[i];
}

export function deleteEvent(id: string): void {
  EVENTS = EVENTS.filter(e => e.id !== id);
}
