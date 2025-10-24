// API for practitioner clients management
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

// GET - Liste tous les clients du praticien
export async function GET(req: NextRequest) {
  try {
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

    // Récupérer le PractitionerProfile de l'utilisateur
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

    // Paramètres de recherche et filtrage
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "lastVisitAt";
    const order = searchParams.get("order") || "desc";

    // Construire le filtre
    const where: any = { practitionerId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Récupérer les clients
    const clients = await prisma.client.findMany({
      where,
      orderBy: { [sortBy]: order },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        birthDate: true,
        totalVisits: true,
        lastVisitAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      clients,
      total: clients.length,
    });
  } catch (error) {
    console.error("[GET /api/pro/clients] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau client
export async function POST(req: NextRequest) {
  try {
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

    // Récupérer le PractitionerProfile de l'utilisateur
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

    const body = await req.json();
    const { firstName, lastName, email, phone, birthDate, address, notes, antecedents } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "Prénom et nom requis" },
        { status: 400 }
      );
    }

    // Créer le client
    const client = await prisma.client.create({
      data: {
        practitionerId,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address || null,
        notes: notes || null,
        antecedents: antecedents || [],
      },
    });

    return NextResponse.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("[POST /api/pro/clients] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
