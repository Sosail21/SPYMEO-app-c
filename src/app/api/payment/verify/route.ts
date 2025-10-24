// Cdw-Spm: Payment Verification API
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID manquant' },
        { status: 400 }
      );
    }

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Paiement non confirmé' },
        { status: 400 }
      );
    }

    const userId = session.metadata?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID non trouvé' },
        { status: 400 }
      );
    }

    // Activer le compte de l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
      },
    });

    console.log(`[PAYMENT] Compte activé pour userId: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Paiement vérifié et compte activé',
    });
  } catch (error: any) {
    console.error('[PAYMENT] Erreur vérification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
