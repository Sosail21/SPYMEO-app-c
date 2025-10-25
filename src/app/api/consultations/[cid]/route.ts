// Cdw-Spm: API for single consultation operations
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ cid: string }> };

// GET - Récupérer les détails d'une consultation
export async function GET(req: NextRequest, context: Context) {
  try {
    const { cid } = await context.params;

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

    // Récupérer la consultation avec les détails du client
    const consultation = await prisma.consultation.findUnique({
      where: { id: cid },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            birthDate: true,
            address: true,
            antecedents: true,
          },
        },
      },
    });

    if (!consultation) {
      return NextResponse.json(
        { success: false, error: "Consultation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que la consultation appartient au praticien
    if (consultation.practitionerId !== practitionerId) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      consultation,
    });
  } catch (error) {
    console.error("[GET /api/consultations/[cid]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une consultation
export async function PATCH(req: NextRequest, context: Context) {
  try {
    const { cid } = await context.params;

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

    // Vérifier que la consultation existe et appartient au praticien
    const existing = await prisma.consultation.findUnique({
      where: { id: cid },
      select: { practitionerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Consultation non trouvée" },
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
    const { motif, notes, diagnosis, duration } = body;

    // Construire les données de mise à jour
    const updateData: any = {};
    if (motif !== undefined) updateData.motif = motif;
    if (notes !== undefined) updateData.notes = notes || null;
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis || null;
    if (duration !== undefined) updateData.duration = duration ? parseInt(duration) : null;

    // Mettre à jour la consultation
    const consultation = await prisma.consultation.update({
      where: { id: cid },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      consultation,
    });
  } catch (error) {
    console.error("[PATCH /api/consultations/[cid]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une consultation
export async function DELETE(req: NextRequest, context: Context) {
  try {
    const { cid } = await context.params;

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

    // Vérifier que la consultation existe et appartient au praticien
    const existing = await prisma.consultation.findUnique({
      where: { id: cid },
      select: { practitionerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Consultation non trouvée" },
        { status: 404 }
      );
    }

    if (existing.practitionerId !== practitionerId) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Supprimer la consultation
    await prisma.consultation.delete({
      where: { id: cid },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/consultations/[cid]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}