// Cdw-Spm: Merchant Registration API (Artisans/Commerçants)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

const registerMerchantSchema = z.object({
  type: z.enum(['ARTISAN', 'COMMERCANT']),
  businessName: z.string().min(2, 'Raison sociale requise'),
  city: z.string().min(2, 'Ville requise'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
  categories: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerMerchantSchema.parse(body);

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
        name: data.businessName,
        role: data.type,
        status: 'PENDING_VALIDATION',
        businessData: {
          businessName: data.businessName,
          city: data.city,
          categories: data.categories,
          description: data.description,
        },
      },
    });

    console.log(`[REGISTER-MERCHANT] Nouvelle candidature ${data.type}: ${user.email}`);

    // Envoyer email à l'admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'cindy-dorbane@spymeo.fr',
        subject: `Nouvelle candidature ${data.type} - ${data.businessName}`,
        html: emailTemplates.adminNotification({
          role: data.type,
          firstName: data.businessName,
          lastName: '',
          email: data.email,
          city: data.city,
        }),
      });
    } catch (emailError) {
      console.error('[REGISTER-MERCHANT] Erreur envoi email admin:', emailError);
      // Continue anyway
    }

    // Envoyer email de confirmation au candidat
    try {
      await sendEmail({
        to: data.email,
        subject: 'Candidature reçue - SPYMEO',
        html: emailTemplates.candidatureReceived({
          firstName: data.businessName,
          role: data.type,
        }),
      });
    } catch (emailError) {
      console.error('[REGISTER-MERCHANT] Erreur envoi email candidat:', emailError);
      // Continue anyway
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      status: 'PENDING',
      message: 'Candidature envoyée avec succès. Vous recevrez une réponse sous 48h par email.',
    });
  } catch (error: any) {
    console.error('[REGISTER-MERCHANT] Erreur:', error);

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
