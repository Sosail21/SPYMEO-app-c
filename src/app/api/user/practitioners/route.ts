// Cdw-Spm: User practitioners API - shows practitioners the user has appointments with
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
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
      return NextResponse.json({ practitioners: [] });
    }

    // Get all appointments for these clients with practitioner info
    const appointments = await prisma.appointment.findMany({
      where: { clientId: { in: clientIds } },
      orderBy: { startAt: "desc" },
      select: {
        id: true,
        startAt: true,
        status: true,
        userId: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            practitionerProfile: {
              select: {
                id: true,
                publicName: true,
                slug: true,
                specialties: true,
                city: true,
              },
            },
          },
        },
      },
    });

    // Group appointments by practitioner (userId)
    const practitionersMap = new Map<string, {
      userId: string;
      name: string;
      slug: string;
      specialties: string[];
      city?: string;
      appointments: Array<{ startAt: Date; status: string }>;
    }>();

    for (const apt of appointments) {
      const userId = apt.userId;

      if (!practitionersMap.has(userId)) {
        const name = apt.user.practitionerProfile?.publicName ||
          `${apt.user.firstName || ""} ${apt.user.lastName || ""}`.trim() ||
          "Praticien";

        practitionersMap.set(userId, {
          userId,
          name,
          slug: apt.user.practitionerProfile?.slug || "",
          specialties: apt.user.practitionerProfile?.specialties || [],
          city: apt.user.practitionerProfile?.city,
          appointments: [],
        });
      }

      practitionersMap.get(userId)!.appointments.push({
        startAt: apt.startAt,
        status: apt.status,
      });
    }

    // Format response
    const now = new Date();
    const practitioners = Array.from(practitionersMap.values()).map((p) => {
      // Find last completed/past visit
      const pastAppointments = p.appointments.filter(
        (a) => a.startAt < now || a.status === "COMPLETED"
      );
      const lastVisitAt = pastAppointments.length > 0
        ? pastAppointments[0].startAt.toISOString()
        : undefined;

      // Find next upcoming appointment
      const upcomingAppointments = p.appointments.filter(
        (a) => a.startAt >= now && ["SCHEDULED", "CONFIRMED"].includes(a.status)
      );
      const nextAvailable = upcomingAppointments.length > 0
        ? upcomingAppointments[upcomingAppointments.length - 1].startAt.toISOString()
        : undefined;

      return {
        id: p.userId,
        name: p.name,
        slug: p.slug,
        specialties: p.specialties,
        city: p.city,
        lastVisitAt,
        nextAvailable,
      };
    });

    return NextResponse.json({ practitioners });
  } catch (error) {
    console.error("[GET /api/user/practitioners] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
