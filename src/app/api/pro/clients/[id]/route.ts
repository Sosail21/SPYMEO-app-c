// API for single client operations
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

// GET - Récupérer les détails d'un client
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

    // Récupérer le PractitionerProfile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        practitionerProfile: {
          select: { id: true },
        },
      },
    });

    if (!user || user.role !== "PRACTITIONER" || !user.practitionerProfile) {
      return NextResponse.json(
        { success: false, error: "Accès réservé aux praticiens" },
        { status: 403 }
      );
    }

    const practitionerId = user.practitionerProfile.id;

    // Récupérer le client avec toutes ses infos
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        consultations: {
          orderBy: { date: "desc" },
          take: 10,
          select: {
            id: true,
            date: true,
            motif: true,
            notes: true,
            duration: true,
          },
        },
        appointments: {
          orderBy: { startAt: "desc" },
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
            status: true,
            description: true,
            location: true,
          },
        },
        documents: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            type: true,
            url: true,
            createdAt: true,
          },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            invoiceNumber: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le client appartient au praticien
    if (client.practitionerId !== practitionerId) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Calculer les stats basées sur les appointments complétés
    const completedAppointments = client.appointments.filter(
      (apt) => apt.status === "COMPLETED"
    );
    const totalVisits = client.consultations.length + completedAppointments.length;

    // Trouver la dernière visite (consultation ou appointment complété)
    const lastConsultation = client.consultations[0];
    const lastCompletedAppointment = completedAppointments[0];

    let lastVisitAt = client.lastVisitAt;
    if (lastConsultation && lastCompletedAppointment) {
      lastVisitAt = new Date(lastConsultation.date) > new Date(lastCompletedAppointment.startAt)
        ? lastConsultation.date.toISOString()
        : lastCompletedAppointment.startAt.toISOString();
    } else if (lastConsultation) {
      lastVisitAt = lastConsultation.date.toISOString();
    } else if (lastCompletedAppointment) {
      lastVisitAt = lastCompletedAppointment.startAt.toISOString();
    }

    return NextResponse.json({
      success: true,
      client: {
        ...client,
        totalVisits,
        lastVisitAt,
      },
    });
  } catch (error) {
    console.error("[GET /api/pro/clients/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un client
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

    // Récupérer le PractitionerProfile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        practitionerProfile: {
          select: { id: true },
        },
      },
    });

    if (!user || user.role !== "PRACTITIONER" || !user.practitionerProfile) {
      return NextResponse.json(
        { success: false, error: "Accès réservé aux praticiens" },
        { status: 403 }
      );
    }

    const practitionerId = user.practitionerProfile.id;

    // Vérifier que le client existe et appartient au praticien
    const existing = await prisma.client.findUnique({
      where: { id },
      select: { practitionerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Client non trouvé" },
        { status: 404 }
      );
    }

    if (existing.practitionerId !== practitionerId) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, email, phone, birthDate, address, notes, antecedents } = body;

    // Construire les données de mise à jour
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (address !== undefined) updateData.address = address || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (antecedents !== undefined) updateData.antecedents = antecedents;

    // Mettre à jour le client
    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("[PATCH /api/pro/clients/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un client
export async function DELETE(req: NextRequest, context: Context) {
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

    // Récupérer le PractitionerProfile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        practitionerProfile: {
          select: { id: true },
        },
      },
    });

    if (!user || user.role !== "PRACTITIONER" || !user.practitionerProfile) {
      return NextResponse.json(
        { success: false, error: "Accès réservé aux praticiens" },
        { status: 403 }
      );
    }

    const practitionerId = user.practitionerProfile.id;

    // Vérifier que le client existe et appartient au praticien
    const existing = await prisma.client.findUnique({
      where: { id },
      select: { practitionerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Client non trouvé" },
        { status: 404 }
      );
    }

    if (existing.practitionerId !== practitionerId) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Supprimer le client (cascade: consultations, documents, invoices)
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/pro/clients/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
