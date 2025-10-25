// Cdw-Spm: Public Appointment Booking API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { notifyAppointmentConfirmed } from "@/lib/notifications";

type Ctx = { params: Promise<{ slug: string }> };

// POST - Prendre un rendez-vous (côté client/public)
export async function POST(req: NextRequest, context: Ctx) {
  try {
    const { slug } = await context.params;
    const body = await req.json();

    const {
      start,
      consultationType,
      duration,
      price,
      clientFirstName,
      clientLastName,
      clientEmail,
      clientPhone,
      description,
    } = body;

    // Validation
    if (!start || !consultationType || !clientFirstName || !clientLastName || !clientEmail) {
      return NextResponse.json(
        { success: false, error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    // Récupérer le praticien
    const practitioner = await prisma.practitionerProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            agendaSettings: true,
          },
        },
      },
    });

    if (!practitioner || !practitioner.verified) {
      return NextResponse.json(
        { success: false, error: "Praticien non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur est connecté
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    let currentUserId: string | null = null;
    let currentUserEmail: string | null = null;

    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        currentUserId = session.id;
        currentUserEmail = session.email;
      } catch {}
    }

    // Calculer la date de fin
    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + (duration || 60) * 60000);

    // Use transaction to prevent race condition (double booking)
    let appointment;
    let client;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Vérifier si le créneau est toujours disponible (within transaction)
        const existingAppointment = await tx.appointment.findFirst({
          where: {
            userId: practitioner.userId,
            status: {
              not: "CANCELLED",
            },
            OR: [
              {
                AND: [
                  { startAt: { lte: startDate } },
                  { endAt: { gt: startDate } },
                ],
              },
              {
                AND: [
                  { startAt: { lt: endDate } },
                  { endAt: { gte: endDate } },
                ],
              },
              {
                AND: [
                  { startAt: { gte: startDate } },
                  { endAt: { lte: endDate } },
                ],
              },
            ],
          },
        });

        if (existingAppointment) {
          throw new Error("SLOT_TAKEN");
        }

        // Créer ou récupérer le client dans la base du praticien
        let txClient = await tx.client.findFirst({
          where: {
            practitionerId: practitioner.id,
            email: clientEmail,
          },
        });

        if (!txClient) {
          txClient = await tx.client.create({
            data: {
              practitionerId: practitioner.id,
              firstName: clientFirstName,
              lastName: clientLastName,
              email: clientEmail,
              phone: clientPhone || null,
            },
          });
        }

        // Créer le rendez-vous (within same transaction)
        const txAppointment = await tx.appointment.create({
          data: {
            userId: practitioner.userId,
            clientId: txClient.id,
            title: `Consultation ${consultationType} - ${clientFirstName} ${clientLastName}`,
            description: description || null,
            startAt: startDate,
            endAt: endDate,
            consultationType,
            duration,
            price,
            status: "SCHEDULED",
          },
        });

        return { appointment: txAppointment, client: txClient };
      });

      appointment = result.appointment;
      client = result.client;
    } catch (error: any) {
      if (error.message === "SLOT_TAKEN") {
        return NextResponse.json(
          { success: false, error: "Ce créneau n'est plus disponible" },
          { status: 409 }
        );
      }
      throw error; // Re-throw other errors
    }

    // Créer une notification pour le praticien
    await notifyAppointmentConfirmed(
      practitioner.userId,
      appointment.id,
      appointment.title,
      appointment.startAt
    );

    // Si le client est connecté, créer aussi une notification pour lui
    if (currentUserId && currentUserEmail === clientEmail) {
      await notifyAppointmentConfirmed(
        currentUserId,
        appointment.id,
        appointment.title,
        appointment.startAt
      );
    }

    // TODO: Envoyer un email de confirmation au client et au praticien

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        start: appointment.startAt.toISOString(),
        end: appointment.endAt?.toISOString(),
        consultationType: appointment.consultationType,
        practitionerName: practitioner.publicName,
      },
      message: "Rendez-vous confirmé ! Vous recevrez un email de confirmation.",
    });
  } catch (error) {
    console.error("[POST /api/public/practitioners/[slug]/book] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
