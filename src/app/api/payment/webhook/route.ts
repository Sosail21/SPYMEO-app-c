// Cdw-Spm: Stripe Webhook Handler
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`[WEBHOOK] Signature verification failed:`, err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`[WEBHOOK] Event received: ${event.type}`);

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
          // Activer le compte de l'utilisateur
          await prisma.user.update({
            where: { id: userId },
            data: {
              status: 'ACTIVE',
            },
          });

          console.log(`[WEBHOOK] Compte activé pour userId: ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Récupérer le client pour obtenir l'email
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;

        if (email) {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Mettre à jour le statut selon l'état de l'abonnement
            const newStatus = subscription.status === 'active' ? 'ACTIVE' : 'SUSPENDED';

            await prisma.user.update({
              where: { id: user.id },
              data: {
                status: newStatus,
              },
            });

            console.log(`[WEBHOOK] Subscription updated for ${email}: ${subscription.status}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;

        if (email) {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user && user.role === 'PASS_USER') {
            // Rétrograder vers FREE_USER
            await prisma.user.update({
              where: { id: user.id },
              data: {
                role: 'FREE_USER',
                status: 'ACTIVE',
                userPlan: 'FREE',
              },
            });

            console.log(`[WEBHOOK] Subscription cancelled for ${email}, downgraded to FREE_USER`);
          }
        }
        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[WEBHOOK] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
