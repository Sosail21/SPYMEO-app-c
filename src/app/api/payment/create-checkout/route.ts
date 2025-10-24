// Cdw-Spm: Stripe Checkout Session API
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY non configurée');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-09-30.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan, type } = body;

    if (!userId || !plan || !type) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const stripe = getStripeInstance();

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Définir les prix selon le plan
    let priceData: Stripe.Checkout.SessionCreateParams.LineItem;
    
    if (type === 'PASS') {
      if (plan === 'monthly') {
        priceData = {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'SPYMEO PASS Mensuel',
              description: 'Accès à toutes les fonctionnalités premium',
            },
            unit_amount: 690, // 6.90 EUR en centimes
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        };
      } else {
        priceData = {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'SPYMEO PASS Annuel',
              description: 'Accès à toutes les fonctionnalités premium pour 1 an',
            },
            unit_amount: 6900, // 69 EUR en centimes
            recurring: {
              interval: 'year',
            },
          },
          quantity: 1,
        };
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Type de paiement non supporté' },
        { status: 400 }
      );
    }

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [priceData],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL}/payment/pass?userId=${userId}`,
      metadata: {
        userId,
        type,
        plan,
      },
    });

    console.log(`[STRIPE] Session créée pour ${user.email}: ${session.id}`);

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('[STRIPE] Erreur création session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}
