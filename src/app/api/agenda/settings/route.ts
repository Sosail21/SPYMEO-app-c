// Cdw-Spm: API pour les paramètres d'agenda
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { AgendaSettings, DayKey } from "@/types/agenda";

// Paramètres par défaut
const DEFAULT_SETTINGS: Partial<AgendaSettings> = {
  bufferMin: 0,
  defaultView: "timeGridWeek",
  allowedLocations: ["cabinet", "visio"],
  acceptNewClients: true,
  availabilities: {
    monday: { enabled: true, start: "09:00", end: "18:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00" },
    wednesday: { enabled: true, start: "09:00", end: "18:00" },
    thursday: { enabled: true, start: "09:00", end: "18:00" },
    friday: { enabled: true, start: "09:00", end: "18:00" },
    saturday: { enabled: false, start: "09:00", end: "12:00" },
    sunday: { enabled: false, start: "09:00", end: "12:00" },
  },
  appointmentTypes: [
    {
      id: "consult-1",
      group: "Consultations individuelles",
      label: "Consultation initiale",
      durationMin: 60,
      price: 60,
      mode: "individuel",
      location: "cabinet",
    },
    {
      id: "consult-2",
      group: "Consultations individuelles",
      label: "Consultation de suivi",
      durationMin: 45,
      price: 50,
      mode: "individuel",
      location: "cabinet",
    },
  ],
};

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;

    // Récupérer ou créer les paramètres
    let settings = await prisma.agendaSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Créer les paramètres par défaut
      settings = await prisma.agendaSettings.create({
        data: {
          userId,
          bufferMin: DEFAULT_SETTINGS.bufferMin!,
          defaultView: DEFAULT_SETTINGS.defaultView!,
          allowedLocations: DEFAULT_SETTINGS.allowedLocations as any,
          acceptNewClients: DEFAULT_SETTINGS.acceptNewClients!,
          availabilities: DEFAULT_SETTINGS.availabilities as any,
          appointmentTypes: DEFAULT_SETTINGS.appointmentTypes as any,
        },
      });
    }

    // Convertir en format AgendaSettings
    const response: AgendaSettings = {
      id: settings.id,
      bufferMin: settings.bufferMin,
      defaultView: settings.defaultView,
      allowedLocations: settings.allowedLocations as string[],
      acceptNewClients: settings.acceptNewClients,
      availabilities: settings.availabilities as any,
      appointmentTypes: settings.appointmentTypes as any,
    };

    return NextResponse.json({ ...response, isConfigured: true });
  } catch (error) {
    console.error("[GET /api/agenda/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;

    const body = await req.json();
    const {
      bufferMin,
      defaultView,
      allowedLocations,
      acceptNewClients,
      availabilities,
      appointmentTypes,
    } = body as AgendaSettings;

    // Mettre à jour ou créer les paramètres
    const settings = await prisma.agendaSettings.upsert({
      where: { userId },
      create: {
        userId,
        bufferMin: bufferMin ?? 0,
        defaultView: defaultView ?? "timeGridWeek",
        allowedLocations: (allowedLocations ?? ["cabinet"]) as any,
        acceptNewClients: acceptNewClients ?? true,
        availabilities: (availabilities ?? {}) as any,
        appointmentTypes: (appointmentTypes ?? []) as any,
      },
      update: {
        bufferMin,
        defaultView,
        allowedLocations: allowedLocations as any,
        acceptNewClients,
        availabilities: availabilities as any,
        appointmentTypes: appointmentTypes as any,
      },
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("[PUT /api/agenda/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
