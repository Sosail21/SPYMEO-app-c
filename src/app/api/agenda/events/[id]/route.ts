// Cdw-Spm: Agenda Event API (update/delete)
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notifyAppointmentCancelled, notifyAppointmentRescheduled } from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

// PATCH - Mettre à jour un rendez-vous
export async function PATCH(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;

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

    // Vérifier que l'appointment appartient à l'utilisateur et récupérer les données actuelles
    const existing = await prisma.appointment.findUnique({
      where: { id },
      select: {
        userId: true,
        title: true,
        startAt: true,
        status: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Rendez-vous non trouvé" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, start, end, location, status, clientId, consultationType, duration, price, cancelledBy, cancellationReason } = body;

    // Construire les données de mise à jour
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (start !== undefined) updateData.startAt = new Date(start);
    if (end !== undefined) updateData.endAt = end ? new Date(end) : null;
    if (location !== undefined) updateData.location = location;
    if (status !== undefined) updateData.status = status;
    if (clientId !== undefined) updateData.clientId = clientId || null;
    if (consultationType !== undefined) updateData.consultationType = consultationType || null;
    if (duration !== undefined) updateData.duration = duration || null;
    if (price !== undefined) updateData.price = price || null;
    if (cancelledBy !== undefined) updateData.cancelledBy = cancelledBy || null;
    if (cancellationReason !== undefined) updateData.cancellationReason = cancellationReason || null;

    // Détecter les changements pour les notifications
    const wasRescheduled = start && new Date(start).getTime() !== existing.startAt.getTime();
    const wasCancelled = status === "CANCELLED" && existing.status !== "CANCELLED";

    // Mettre à jour l'appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
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

    // Créer les notifications appropriées
    if (wasCancelled) {
      await notifyAppointmentCancelled(
        userId,
        appointment.id,
        appointment.title,
        (cancelledBy as "client" | "practitioner") || "practitioner"
      );
    } else if (wasRescheduled) {
      await notifyAppointmentRescheduled(
        userId,
        appointment.id,
        appointment.title,
        appointment.startAt
      );
    }

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
          consultationType: appointment.consultationType,
          duration: appointment.duration,
          price: appointment.price,
          cancelledBy: appointment.cancelledBy,
          cancellationReason: appointment.cancellationReason,
        },
      },
    });
  } catch (error) {
    console.error("[PATCH /api/agenda/events/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un rendez-vous
export async function DELETE(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;

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

    // Vérifier que l'appointment appartient à l'utilisateur
    const existing = await prisma.appointment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Rendez-vous non trouvé" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Supprimer l'appointment
    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/agenda/events/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
