// Cdw-Spm: User appointments API
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // "upcoming" | "past"

    // Authenticate
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

    if (clientIds.length === 0) {
      return NextResponse.json({ appointments: [] });
    }

    // Build appointment query based on scope
    const now = new Date();
    let whereClause: any = {
      clientId: { in: clientIds },
    };

    if (scope === "upcoming") {
      whereClause = {
        ...whereClause,
        startAt: { gte: now },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      };
    } else if (scope === "past") {
      whereClause = {
        OR: [
          { startAt: { lt: now } },
          { status: { in: ["COMPLETED", "CANCELLED", "NO_SHOW"] } },
        ],
        clientId: { in: clientIds },
      };
    }

    // Fetch appointments with practitioner info
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: scope === "upcoming" ? { startAt: "asc" } : { startAt: "desc" },
      select: {
        id: true,
        title: true,
        startAt: true,
        endAt: true,
        location: true,
        status: true,
        description: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            practitionerProfile: {
              select: {
                publicName: true,
                slug: true,
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

    // Format response
    const formattedAppointments = appointments.map((apt) => {
      const practitionerName =
        apt.user.practitionerProfile?.publicName ||
        `${apt.user.firstName || ""} ${apt.user.lastName || ""}`.trim() ||
        "Praticien";

      const practitionerSlug = apt.user.practitionerProfile?.slug || "";
      const practitionerPhoto = apt.user.profile?.avatar || undefined;

      // Calculate if can cancel (more than 24h before appointment)
      const timeUntilAppointment = apt.startAt.getTime() - now.getTime();
      const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);
      const canCancel = hoursUntilAppointment > 24 && ["SCHEDULED", "CONFIRMED"].includes(apt.status);

      // Extract visio link if present in description
      const visioLinkMatch = apt.description?.match(/https?:\/\/[^\s]+/);
      const visioLink = visioLinkMatch ? visioLinkMatch[0] : undefined;

      return {
        id: apt.id,
        title: apt.title,
        date: apt.startAt.toISOString(),
        endDate: apt.endAt?.toISOString(),
        time: apt.startAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        practitionerId: apt.user.id,
        practitionerName,
        practitionerSlug,
        practitionerPhoto,
        place: apt.location || "Non spécifié",
        status: apt.status,
        description: apt.description,
        canCancel,
        canCancelUntil: apt.startAt.toISOString(),
        visioLink,
      };
    });

    return NextResponse.json({ appointments: formattedAppointments });
  } catch (error) {
    console.error("[GET /api/user/appointments] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
