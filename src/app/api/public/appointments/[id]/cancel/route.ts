// Cdw-Spm: Public Appointment Cancellation API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAppointmentCancelled } from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

// POST - Annuler un rendez-vous (côté client)
export async function POST(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const { clientEmail, cancellationReason } = body;

    // Validation
    if (!clientEmail) {
      return NextResponse.json(
        { success: false, error: "Email requis" },
        { status: 400 }
      );
    }

    // Récupérer le rendez-vous
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Rendez-vous non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'email correspond au client
    if (appointment.client?.email !== clientEmail) {
      return NextResponse.json(
        { success: false, error: "Email incorrect" },
        { status: 403 }
      );
    }

    // Vérifier que le rendez-vous n'est pas déjà annulé
    if (appointment.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Rendez-vous déjà annulé" },
        { status: 400 }
      );
    }

    // Vérifier que le rendez-vous n'est pas dans le passé
    if (appointment.startAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Impossible d'annuler un rendez-vous passé" },
        { status: 400 }
      );
    }

    // Annuler le rendez-vous
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledBy: "client",
        cancellationReason: cancellationReason || "Annulé par le client",
      },
    });

    // Notifier le praticien
    await notifyAppointmentCancelled(
      appointment.userId,
      appointment.id,
      appointment.title,
      "client"
    );

    // TODO: Envoyer un email au praticien et au client

    return NextResponse.json({
      success: true,
      message: "Rendez-vous annulé avec succès. Le praticien a été notifié.",
      appointment: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
      },
    });
  } catch (error) {
    console.error("[POST /api/public/appointments/[id]/cancel] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
