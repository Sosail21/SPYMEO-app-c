// Cdw-Spm: Stripe Webhook Handler (SECURE)
// Handles all Stripe events with signature verification
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { verifyWebhookSignature } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    console.error('[WEBHOOK] Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature (CRITICAL SECURITY)
    event = verifyWebhookSignature(body, signature)
  } catch (err: any) {
    console.error('[WEBHOOK] Signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  console.log(`[WEBHOOK] Received event: ${event.type}`)

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error(`[WEBHOOK] Error processing ${event.type}:`, err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle checkout.session.completed
 * User just completed payment, activate account
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId

  if (!userId) {
    console.warn('[WEBHOOK] checkout.session.completed: No userId in metadata')
    return
  }

  console.log(`[WEBHOOK] Activating account for user ${userId}`)

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'ACTIVE',
      subscriptionStart: new Date(),
    },
  })

  // If PASS subscription, create PassSubscription record
  if (session.mode === 'subscription' && session.subscription) {
    await prisma.passSubscription.upsert({
      where: { userId },
      update: {
        active: true,
        startedAt: new Date(),
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      },
      create: {
        userId,
        active: true,
        plan: 'MONTHLY', // Default, will be updated by subscription.created
        startedAt: new Date(),
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      },
    })
  }

  console.log(`[WEBHOOK] Account activated: ${userId}`)
}

/**
 * Handle customer.subscription.created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.warn('[WEBHOOK] subscription.created: No userId in metadata')
    return
  }

  // Determine plan (MONTHLY or ANNUAL) from subscription interval
  const interval = subscription.items.data[0]?.price?.recurring?.interval
  const plan = interval === 'year' ? 'ANNUAL' : 'MONTHLY'

  await prisma.passSubscription.upsert({
    where: { userId },
    update: {
      active: true,
      plan,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
    },
    create: {
      userId,
      active: true,
      plan,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
    },
  })

  console.log(`[WEBHOOK] Subscription created: ${userId} (${plan})`)
}

/**
 * Handle customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id

  await prisma.passSubscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      active: subscription.status === 'active',
    },
  })

  console.log(`[WEBHOOK] Subscription updated: ${subscriptionId} (status: ${subscription.status})`)
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id

  await prisma.passSubscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      active: false,
    },
  })

  console.log(`[WEBHOOK] Subscription deleted: ${subscriptionId}`)
}

/**
 * Handle invoice.payment_succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Cast to any to access subscription property (Stripe SDK type issue)
  const invoiceData = invoice as any;
  const subscriptionId = typeof invoiceData.subscription === 'string' 
    ? invoiceData.subscription 
    : invoiceData.subscription?.id;
  
  if (!subscriptionId) return;

  // Increment months paid for PASS subscription
  await prisma.passSubscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      monthsPaid: { increment: 1 },
      nextBillingAt: invoice.next_payment_attempt
        ? new Date(invoice.next_payment_attempt * 1000)
        : null,
    },
  })

  console.log(`[WEBHOOK] Payment succeeded for subscription: ${subscriptionId}`)
}

/**
 * Handle invoice.payment_failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Cast to any to access subscription property (Stripe SDK type issue)
  const invoiceData = invoice as any;
  const subscriptionId = typeof invoiceData.subscription === 'string' 
    ? invoiceData.subscription 
    : invoiceData.subscription?.id;
  
  if (!subscriptionId) return;

  // Optionally deactivate subscription or send notification
  console.warn(`[WEBHOOK] Payment failed for subscription: ${subscriptionId}`)

  // TODO: Send email notification to user about failed payment
}