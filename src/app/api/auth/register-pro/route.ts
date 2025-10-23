// Cdw-Spm: Professional Registration API - Phase 2
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

const documentsSchema = z.object({
  diploma: z.string().url().optional(),
  insurance: z.string().url().optional(),
  kbis: z.string().url().optional(),
  criminalRecord: z.string().url().optional(),
});

const registerProSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
  phone: z.string().min(10, 'Téléphone requis'),
  discipline: z.string().min(2, 'Discipline requise'),
  city: z.string().min(2, 'Ville requise'),
  experience: z.number().min(0, 'Expérience invalide'),
  siret: z.string().min(14, 'SIRET invalide'),
  presentation: z.string().optional().default(''),
  documents: documentsSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerProSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Créer l'utilisateur avec status PENDING_VALIDATION
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        city: data.city,
        siret: data.siret,
        role: 'PRACTITIONER',
        status: 'PENDING_VALIDATION',
        profileData: {
          discipline: data.discipline,
          experience: data.experience,
          presentation: data.presentation,
        },
        applicationDocuments: data.documents,
      },
    });

    console.log(`[REGISTER-PRO] Nouvelle candidature: ${user.email}`);

    // Envoyer email à l'admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'cindy-dorbane@spymeo.fr',
        subject: `Nouvelle candidature Praticien - ${data.firstName} ${data.lastName}`,
        html: emailTemplates.adminNotificationPro({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          city: data.city,
          discipline: data.discipline,
          experience: data.experience,
          siret: data.siret,
          presentation: data.presentation,
          documents: data.documents,
        }),
      });
    } catch (emailError) {
      console.error('[REGISTER-PRO] Erreur envoi email admin:', emailError);
      // Continue anyway
    }

    // Envoyer email de confirmation au candidat
    try {
      await sendEmail({
        to: data.email,
        subject: 'Candidature reçue - SPYMEO',
        html: emailTemplates.candidatureReceived({
          firstName: data.firstName,
          role: 'Praticien',
        }),
      });
    } catch (emailError) {
      console.error('[REGISTER-PRO] Erreur envoi email candidat:', emailError);
      // Continue anyway
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      status: 'PENDING',
      message: 'Candidature envoyée avec succès. Vous recevrez une réponse sous 48h par email.',
    });
  } catch (error: any) {
    console.error('[REGISTER-PRO] Erreur:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur lors de la soumission de la candidature' },
      { status: 500 }
    );
  }
}
