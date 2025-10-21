// Cdw-Spm: Payment Confirmation API (Webhook)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import { verifyPaymentToken } from '@/lib/jwt';

const confirmSchema = z.object({
  token: z.string().optional(),
  userId: z.string().optional(),
  paymentIntentId: z.string(),
  amount: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Vérifier signature Stripe
    const body = await request.json();
    const data = confirmSchema.parse(body);

    // Déterminer l'userId
    let userId = data.userId;
    if (data.token) {
      const decoded = verifyPaymentToken(data.token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID manquant' },
        { status: 400 }
      );
    }

    // Activer le compte
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 an
      },
    });

    // Email de bienvenue
    try {
      await sendEmail({
        to: user.email,
        subject: 'Bienvenue sur SPYMEO !',
        html: emailTemplates.accountActivated({
          firstName: user.firstName || user.name,
        }),
      });
    } catch (emailError) {
      console.error('[PAYMENT] Erreur envoi email bienvenue:', emailError);
    }

    console.log(`[PAYMENT] Compte activé: ${user.email}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[PAYMENT] Erreur confirmation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
