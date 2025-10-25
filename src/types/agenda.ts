export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface AppointmentType {
  id: string;
  label: string;
  duration?: number;
  durationMin?: number;
  color?: string;
  group?: string;
  price?: number;
  mode?: string;
  location?: string;
}

export interface DayHours {
  enabled: boolean;
  start?: string;
  end?: string;
}

export interface AgendaSettings {
  id?: string;
  availableDays?: Partial<Record<DayKey, DayHours>>;
  availabilities?: Partial<Record<DayKey, DayHours>>;
  appointmentTypes?: AppointmentType[];
  defaultDuration?: number;
  bufferTime?: number;
  bufferMin?: number;
  defaultView?: string;
  allowedLocations?: string[];
  acceptNewClients?: boolean;
}
