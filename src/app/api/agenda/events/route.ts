// Cdw-Spm: Agenda Events API
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

// GET - Liste tous les rendez-vous du praticien
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

    // Récupérer tous les appointments de l'utilisateur
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { startAt: "asc" },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Format pour FullCalendar
    const events = appointments.map((apt) => ({
      id: apt.id,
      title: apt.title,
      start: apt.startAt.toISOString(),
      end: apt.endAt?.toISOString(),
      extendedProps: {
        description: apt.description,
        location: apt.location,
        status: apt.status,
        practitionerId: apt.practitionerId,
        clientId: apt.clientId,
        clientName: apt.client ? `${apt.client.firstName} ${apt.client.lastName}` : undefined,
      },
    }));

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("[GET /api/agenda/events] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau rendez-vous
export async function POST(req: NextRequest) {
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
    const { title, description, start, end, location, status, clientId } = body;

    if (!title || !start) {
      return NextResponse.json(
        { success: false, error: "Titre et date de début requis" },
        { status: 400 }
      );
    }

    // Créer l'appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        title,
        description: description || null,
        startAt: new Date(start),
        endAt: end ? new Date(end) : null,
        location: location || null,
        status: status || "SCHEDULED",
        clientId: clientId || null,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      event: {
        id: appointment.id,
        title: appointment.title,
        start: appointment.startAt.toISOString(),
        end: appointment.endAt?.toISOString(),
        extendedProps: {
          description: appointment.description,
          location: appointment.location,
          status: appointment.status,
          clientId: appointment.clientId,
          clientName: appointment.client ? `${appointment.client.firstName} ${appointment.client.lastName}` : undefined,
        },
      },
    });
  } catch (error) {
    console.error("[POST /api/agenda/events] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
