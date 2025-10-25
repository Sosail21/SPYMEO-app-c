// Cdw-Spm: Public Practitioner Detail API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

// GET - Détails publics d'un praticien
export async function GET(req: NextRequest, context: Ctx) {
  try {
    const { slug } = await context.params;

    // Récupérer le praticien
    const practitioner = await prisma.practitionerProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
            status: true,
            agendaSettings: true,
          },
        },
      },
    });

    if (!practitioner) {
      return NextResponse.json(
        { success: false, error: "Praticien non trouvé" },
        { status: 404 }
      );
    }

    if (!practitioner.verified || practitioner.user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Praticien non disponible" },
        { status: 403 }
      );
    }

    // Formatter les données pour l'affichage public
    const formattedPractitioner = {
      id: practitioner.id,
      slug: practitioner.slug,
      name: practitioner.publicName,
      specialties: practitioner.specialties,
      description: practitioner.description,
      city: practitioner.city,
      postalCode: practitioner.postalCode,
      address: practitioner.address,
      featured: practitioner.featured,
      userId: practitioner.userId,
      // Infos de contact publiques (optionnel selon tes besoins)
      phone: practitioner.user.phone,
      email: practitioner.user.email,
      // Configuration de l'agenda
      agendaSettings: practitioner.user.agendaSettings,
    };

    return NextResponse.json({
      success: true,
      practitioner: formattedPractitioner,
    });
  } catch (error) {
    console.error("[GET /api/public/practitioners/[slug]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
