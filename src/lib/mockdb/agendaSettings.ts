// Simple in-memory mock DB for agenda settings
export type DayKey = "monday"|"tuesday"|"wednesday"|"thursday"|"friday"|"saturday"|"sunday";

export type AvailabilitySlot = {
  enabled: boolean;
  start: string; // "08:30"
  end: string;   // "18:00"
};

export type AppointmentType = {
  id: string;
  group: string;     // e.g. "Consultations", "Soins & pratiques", etc.
  label: string;     // e.g. "Bilan initial"
  durationMin: number; // minutes
  price?: number;    // optional price
  mode: "individuel" | "collectif";
  location: "cabinet" | "domicile" | "visio" | "entreprise";
};

export type AgendaSettings = {
  isConfigured: boolean;
  bufferMin: 0|10|15|20|25|30;
  defaultView: "timeGridWeek" | "dayGridMonth";
  availabilities: Record<DayKey, AvailabilitySlot>;
  allowedLocations: Array<AppointmentType["location"]>;
  appointmentTypes: AppointmentType[];
};

// Seed defaults
let SETTINGS: AgendaSettings = {
  isConfigured: true,
  bufferMin: 15,
  defaultView: "timeGridWeek",
  allowedLocations: ["cabinet", "visio", "domicile"],
  availabilities: {
    monday:    { enabled: true,  start: "09:00", end: "17:00" },
    tuesday:   { enabled: true,  start: "08:30", end: "18:00" },
    wednesday: { enabled: true,  start: "09:00", end: "17:00" },
    thursday:  { enabled: true,  start: "09:00", end: "17:00" },
    friday:    { enabled: true,  start: "09:00", end: "16:00" },
    saturday:  { enabled: false, start: "09:00", end: "12:00" },
    sunday:    { enabled: false, start: "09:00", end: "12:00" },
  },
  appointmentTypes: [
    { id: "bilan-initial", group: "Consultations individuelles", label: "Bilan initial", durationMin: 90, price: 75, mode: "individuel", location: "cabinet" },
    { id: "suivi", group: "Consultations individuelles", label: "Séance de suivi", durationMin: 60, price: 55, mode: "individuel", location: "cabinet" },
    { id: "visio", group: "Consultations individuelles", label: "Télé-consultation", durationMin: 45, price: 45, mode: "individuel", location: "visio" },
    { id: "reflexo", group: "Soins & pratiques corporelles", label: "Réflexologie plantaire", durationMin: 60, price: 60, mode: "individuel", location: "cabinet" },
    { id: "atelier-meditation", group: "Ateliers & collectifs", label: "Méditation en groupe", durationMin: 60, price: 15, mode: "collectif", location: "cabinet" },
  ],
};

export function getAgendaSettings(): AgendaSettings {
  return SETTINGS;
}

export function updateAgendaSettings(patch: Partial<AgendaSettings>): AgendaSettings {
  SETTINGS = { ...SETTINGS, ...patch };
  // Merge nested objects carefully
  if (patch.availabilities) {
    SETTINGS.availabilities = { ...SETTINGS.availabilities, ...patch.availabilities };
  }
  if (patch.appointmentTypes) {
    SETTINGS.appointmentTypes = [...patch.appointmentTypes];
  }
  return SETTINGS;
}
