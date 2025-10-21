// Cdw-Spm: Stripe service for payments
import Stripe from 'stripe'

// Feature flag: Stripe is enabled if secret key is configured
export const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.warn(
    '⚠️ STRIPE_SECRET_KEY not configured. Payment features will be disabled. ' +
    'Set STRIPE_SECRET_KEY in environment variables to enable payments.'
  )
}

// Initialize Stripe client (or null if not configured)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  : null

/**
 * Require Stripe to be configured (throw error if not)
 * Use this in payment routes to ensure Stripe is available
 */
export function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
    )
  }
  return stripe
}

/**
 * Create a checkout session for subscription (PASS monthly/annual)
 */
export async function createCheckoutSession(params: {
  userId: string
  userEmail: string
  priceId: string
  successUrl: string
  cancelUrl: string
  mode?: 'subscription' | 'payment'
}) {
  const stripeClient = requireStripe()

  return await stripeClient.checkout.sessions.create({
    customer_email: params.userEmail,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: params.mode || 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
    },
    subscription_data: params.mode === 'subscription' ? {
      metadata: {
        userId: params.userId,
      },
    } : undefined,
  })
}

/**
 * Create a customer portal session (for managing subscription)
 */
export async function createPortalSession(params: {
  customerId: string
  returnUrl: string
}) {
  const stripeClient = requireStripe()

  return await stripeClient.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripeClient = requireStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not configured. Cannot verify webhook signature.'
    )
  }

  try {
    return stripeClient.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    )
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`)
  }
}
