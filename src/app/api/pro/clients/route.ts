// API for practitioner clients management
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail, emailTemplates } from "@/lib/email";

// Helper function to generate a secure temporary password
function generateSecurePassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

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

    // Récupérer les clients avec leurs consultations et appointments
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
        lastVisitAt: true,
        createdAt: true,
        consultations: {
          select: { id: true },
        },
        appointments: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Calculer totalVisits pour chaque client (consultations + appointments complétés)
    const clientsWithStats = clients.map((client) => {
      const completedAppointments = client.appointments.filter(
        (apt) => apt.status === "COMPLETED"
      );
      const totalVisits = client.consultations.length + completedAppointments.length;

      return {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        birthDate: client.birthDate,
        totalVisits,
        lastVisitAt: client.lastVisitAt,
        createdAt: client.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      clients: clientsWithStats,
      total: clientsWithStats.length,
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

    // Récupérer le PractitionerProfile et les infos du praticien
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        firstName: true,
        lastName: true,
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
    const practitionerName = `${user.firstName} ${user.lastName}`;

    const body = await req.json();
    const { firstName, lastName, email, phone, birthDate, address, notes, antecedents } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "Prénom et nom requis" },
        { status: 400 }
      );
    }

    // Si un email est fourni, vérifier si un User existe déjà
    let existingUser = null;
    let userCreated = false;

    if (email) {
      existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
      });

      // Si aucun User n'existe, en créer un
      if (!existingUser) {
        try {
          const tempPassword = generateSecurePassword();
          const hashedPassword = await bcrypt.hash(tempPassword, 10);

          existingUser = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              firstName,
              lastName,
              phone: phone || null,
              role: "FREE_USER",
              status: "ACTIVE",
            },
            select: { id: true, email: true },
          });

          userCreated = true;

          // TODO: Optionally send a separate email with temporary credentials
          // For now, we'll just send the welcome email
        } catch (error) {
          console.error("[POST /api/pro/clients] Error creating user:", error);
          // Continue even if user creation fails
        }
      }
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

    // Envoyer un email de bienvenue si un User a été créé
    if (userCreated && email) {
      try {
        await sendEmail({
          to: email,
          subject: "🎉 Votre praticien a créé votre compte SPYMEO",
          html: emailTemplates.clientCreatedByPractitioner({
            firstName,
            lastName,
            practitionerName,
            email,
          }),
        });
      } catch (error) {
        console.error("[POST /api/pro/clients] Error sending email:", error);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      client,
      userCreated,
    });
  } catch (error) {
    console.error("[POST /api/pro/clients] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
