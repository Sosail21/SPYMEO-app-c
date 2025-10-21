// Cdw-Spm: Admin Validation API
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import { generatePaymentToken } from '@/lib/jwt';

const validateSchema = z.object({
  userId: z.string(),
  approved: z.boolean(),
  adminNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = validateSchema.parse(body);

    // Récupérer utilisateur
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    if (user.status !== 'PENDING_VALIDATION') {
      return NextResponse.json(
        { success: false, error: 'Statut invalide pour validation' },
        { status: 400 }
      );
    }

    if (data.approved) {
      // Approuvé : passer en attente paiement
      const updatedUser = await prisma.user.update({
        where: { id: data.userId },
        data: {
          status: 'PENDING_PAYMENT',
          adminNotes: data.adminNotes,
        },
      });

      // Générer token paiement
      const paymentToken = generatePaymentToken(user.id);

      // Email au professionnel avec lien paiement
      try {
        await sendEmail({
          to: user.email,
          subject: 'Candidature approuvée - SPYMEO',
          html: emailTemplates.candidatureApproved({
            firstName: user.firstName || user.name,
            paymentToken,
          }),
        });
      } catch (emailError) {
        console.error('[ADMIN] Erreur envoi email approbation:', emailError);
      }

      console.log(`[ADMIN] Candidature approuvée: ${user.email}`);

      return NextResponse.json({
        success: true,
        message: 'Candidature approuvée, email envoyé au professionnel',
      });
    } else {
      // Refusé
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          status: 'REJECTED',
          adminNotes: data.adminNotes,
        },
      });

      // Email de refus
      try {
        await sendEmail({
          to: user.email,
          subject: 'Candidature SPYMEO',
          html: emailTemplates.candidatureRejected({
            firstName: user.firstName || user.name,
            reason: data.adminNotes,
          }),
        });
      } catch (emailError) {
        console.error('[ADMIN] Erreur envoi email refus:', emailError);
      }

      console.log(`[ADMIN] Candidature refusée: ${user.email}`);

      return NextResponse.json({
        success: true,
        message: 'Candidature refusée, email envoyé',
      });
    }
  } catch (error: any) {
    console.error('[ADMIN] Erreur validation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
