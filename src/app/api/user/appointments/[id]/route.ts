// Cdw-Spm: Get and update user appointments
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

// GET - Récupérer les détails d'un rendez-vous
export async function GET(req: NextRequest, context: Context) {
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

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Find clients matching user email
    const clients = await prisma.client.findMany({
      where: { email: user.email },
      select: { id: true },
    });

    const clientIds = clients.map((c) => c.id);

    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        startAt: true,
        endAt: true,
        location: true,
        status: true,
        description: true,
        clientId: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            practitionerProfile: {
              select: {
                publicName: true,
                slug: true,
                address: true,
                city: true,
                postalCode: true,
              },
            },
            profile: {
              select: {
                avatar: true,
              },
            },
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

    // Verify user has access to this appointment
    if (!appointment.clientId || !clientIds.includes(appointment.clientId)) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Format response
    const now = new Date();
    const timeUntilAppointment = appointment.startAt.getTime() - now.getTime();
    const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);
    const canCancel = hoursUntilAppointment > 24 && ["SCHEDULED", "CONFIRMED"].includes(appointment.status);

    const practitionerName =
      appointment.user.practitionerProfile?.publicName ||
      `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim() ||
      "Praticien";

    const practitionerSlug = appointment.user.practitionerProfile?.slug || "";
    const practitionerPhoto = appointment.user.profile?.avatar || undefined;

    // Extract visio link if present in description
    const visioLinkMatch = appointment.description?.match(/https?:\/\/[^\s]+/);
    const visioLink = visioLinkMatch ? visioLinkMatch[0] : undefined;

    // Build full address
    let fullAddress = appointment.location || "";
    if (appointment.user.practitionerProfile?.address) {
      fullAddress = `${appointment.user.practitionerProfile.address}, ${appointment.user.practitionerProfile.postalCode} ${appointment.user.practitionerProfile.city}`;
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        title: appointment.title,
        date: appointment.startAt.toISOString(),
        endDate: appointment.endAt?.toISOString(),
        time: appointment.startAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        practitionerId: appointment.user.id,
        practitionerName,
        practitionerSlug,
        practitionerPhoto,
        practitionerEmail: appointment.user.email,
        practitionerPhone: appointment.user.phone,
        place: appointment.location || "Non spécifié",
        address: fullAddress,
        status: appointment.status,
        description: appointment.description,
        canCancel,
        canCancelUntil: appointment.startAt.toISOString(),
        visioLink,
      },
    });
  } catch (error) {
    console.error("[GET /api/user/appointments/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PATCH - Annuler un rendez-vous
export async function PATCH(req: NextRequest, context: Context) {
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

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Find clients matching user email
    const clients = await prisma.client.findMany({
      where: { email: user.email },
      select: { id: true },
    });

    const clientIds = clients.map((c) => c.id);

    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        startAt: true,
        status: true,
        clientId: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Rendez-vous non trouvé" },
        { status: 404 }
      );
    }

    // Verify user has access to this appointment
    if (!appointment.clientId || !clientIds.includes(appointment.clientId)) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Check if cancellation is allowed (more than 24h before)
    const now = new Date();
    const timeUntilAppointment = appointment.startAt.getTime() - now.getTime();
    const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);

    if (hoursUntilAppointment <= 24) {
      return NextResponse.json(
        { success: false, error: "Impossible d'annuler un rendez-vous moins de 24h avant" },
        { status: 400 }
      );
    }

    if (!["SCHEDULED", "CONFIRMED"].includes(appointment.status)) {
      return NextResponse.json(
        { success: false, error: "Ce rendez-vous ne peut pas être annulé" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (status !== "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Action non autorisée" },
        { status: 400 }
      );
    }

    // Update appointment status
    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      message: "Rendez-vous annulé avec succès",
    });
  } catch (error) {
    console.error("[PATCH /api/user/appointments/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
