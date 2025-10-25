// Cdw-Spm: Public Practitioners API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Liste publique des praticiens vérifiés
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Paramètres de recherche
    const specialty = searchParams.get("specialty");
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const passOnly = searchParams.get("passOnly") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {
      verified: true,
      user: {
        status: "ACTIVE",
        active: true,
      },
    };

    if (specialty) {
      where.specialties = {
        has: specialty,
      };
    }

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    if (search) {
      where.OR = [
        { publicName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    // Récupérer les praticiens
    const [practitioners, total] = await Promise.all([
      prisma.practitionerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          featured: "desc", // Featured first
        },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              email: true,
            },
          },
        },
      }),
      prisma.practitionerProfile.count({ where }),
    ]);

    // Formatter les résultats pour l'affichage public
    const formattedPractitioners = practitioners.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.publicName,
      specialties: p.specialties,
      description: p.description,
      city: p.city,
      postalCode: p.postalCode,
      address: p.address,
      featured: p.featured,
      // Ne pas exposer les infos sensibles
      userId: p.userId,
      hasAvailabilities: true, // À calculer dynamiquement plus tard
    }));

    return NextResponse.json({
      success: true,
      practitioners: formattedPractitioners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/public/practitioners] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
