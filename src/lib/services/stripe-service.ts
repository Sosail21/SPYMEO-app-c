// Stripe Service Layer
// Handles all business logic for Stripe interactions including subscriptions, payments, and webhooks

import Stripe from "stripe";
import { stripe } from "../stripe/client";
import { STRIPE_CONFIG, getPlanFromPriceId, getPriceIdFromPlan } from "../stripe/config";

// Types for our service
export type PassPlan = "MONTHLY" | "ANNUAL";

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  userName: string;
  plan: PassPlan;
  stripeCustomerId?: string;
}

export interface CreatePortalSessionParams {
  stripeCustomerId: string;
  returnUrl?: string;
}

export interface SubscriptionData {
  subscriptionId: string;
  customerId: string;
  status: Stripe.Subscription.Status;
  plan: PassPlan;
  priceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name: string,
  stripeCustomerId?: string
): Promise<string> {
  try {
    // If we have a customer ID, verify it exists
    if (stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        if (!customer.deleted) {
          return stripeCustomerId;
        }
      } catch (error) {
        console.warn(`Customer ${stripeCustomerId} not found, creating new one`);
      }
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
        platform: "spymeo",
      },
    });

    return customer.id;
  } catch (error) {
    console.error("Error in getOrCreateCustomer:", error);
    throw new Error(`Failed to get or create customer: ${error}`);
  }
}

/**
 * Update customer information
 */
export async function updateCustomer(
  customerId: string,
  data: {
    email?: string;
    name?: string;
    metadata?: Record<string, string>;
  }
): Promise<Stripe.Customer> {
  try {
    return await stripe.customers.update(customerId, data);
  } catch (error) {
    console.error("Error updating customer:", error);
    throw new Error(`Failed to update customer: ${error}`);
  }
}

// ============================================================================
// CHECKOUT SESSION
// ============================================================================

/**
 * Create a Stripe checkout session for PASS subscription
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  try {
    const { userId, userEmail, userName, plan, stripeCustomerId } = params;

    // Get or create customer
    const customerId = await getOrCreateCustomer(
      userId,
      userEmail,
      userName,
      stripeCustomerId
    );

    // Get price ID for the plan
    const priceId = getPriceIdFromPlan(plan);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: STRIPE_CONFIG.checkout.mode,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: STRIPE_CONFIG.checkout.successUrl,
      cancel_url: STRIPE_CONFIG.checkout.cancelUrl,
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
      },
      metadata: {
        userId,
        plan,
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_update: {
        address: "auto",
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error(`Failed to create checkout session: ${error}`);
  }
}

// ============================================================================
// CUSTOMER PORTAL
// ============================================================================

/**
 * Create a customer portal session for subscription management
 */
export async function createPortalSession(
  params: CreatePortalSessionParams
): Promise<Stripe.BillingPortal.Session> {
  try {
    const { stripeCustomerId, returnUrl } = params;

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl || STRIPE_CONFIG.portal.returnUrl,
    });

    return session;
  } catch (error) {
    console.error("Error creating portal session:", error);
    throw new Error(`Failed to create portal session: ${error}`);
  }
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Get subscription data from Stripe
 */
export async function getSubscription(
  subscriptionId: string
): Promise<SubscriptionData | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription || !subscription.items.data[0]) {
      return null;
    }

    const priceId = subscription.items.data[0].price.id;
    const plan = getPlanFromPriceId(priceId);

    if (!plan) {
      throw new Error(`Unknown price ID: ${priceId}`);
    }

    return {
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      plan,
      priceId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error("Error getting subscription:", error);
    throw new Error(`Failed to get subscription: ${error}`);
  }
}

/**
 * Update subscription plan (upgrade/downgrade)
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPlan: PassPlan
): Promise<Stripe.Subscription> {
  try {
    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPriceId = subscription.items.data[0].price.id;
    const newPriceId = getPriceIdFromPlan(newPlan);

    // If already on this plan, return current subscription
    if (currentPriceId === newPriceId) {
      return subscription;
    }

    // Update the subscription
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: "create_prorations",
      metadata: {
        ...subscription.metadata,
        plan: newPlan,
      },
    });

    return updated;
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    throw new Error(`Failed to update subscription plan: ${error}`);
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return subscription;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error(`Failed to cancel subscription: ${error}`);
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return subscription;
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    throw new Error(`Failed to reactivate subscription: ${error}`);
  }
}

/**
 * Pause subscription (requires Stripe to have pause collection enabled)
 */
export async function pauseSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: "mark_uncollectible",
      },
    });

    return subscription;
  } catch (error) {
    console.error("Error pausing subscription:", error);
    throw new Error(`Failed to pause subscription: ${error}`);
  }
}

/**
 * Resume a paused subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: null,
    });

    return subscription;
  } catch (error) {
    console.error("Error resuming subscription:", error);
    throw new Error(`Failed to resume subscription: ${error}`);
  }
}

// ============================================================================
// WEBHOOK HANDLERS
// ============================================================================

/**
 * Handle successful checkout completion
 */
export async function handleCheckoutComplete(
  session: Stripe.Checkout.Session
): Promise<{
  userId: string;
  subscriptionId: string;
  customerId: string;
  plan: PassPlan;
}> {
  try {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as PassPlan;

    if (!userId || !plan) {
      throw new Error("Missing required metadata in checkout session");
    }

    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    if (!subscriptionId || !customerId) {
      throw new Error("Missing subscription or customer ID in checkout session");
    }

    return {
      userId,
      subscriptionId,
      customerId,
      plan,
    };
  } catch (error) {
    console.error("Error handling checkout complete:", error);
    throw error;
  }
}

/**
 * Handle subscription updates (plan changes, renewals, etc.)
 */
export async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription
): Promise<SubscriptionData> {
  try {
    const priceId = subscription.items.data[0]?.price.id;
    const plan = getPlanFromPriceId(priceId);

    if (!plan) {
      throw new Error(`Unknown price ID in subscription: ${priceId}`);
    }

    return {
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      plan,
      priceId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error("Error handling subscription update:", error);
    throw error;
  }
}

/**
 * Handle successful payment
 */
export async function handleInvoicePaid(
  invoice: Stripe.Invoice
): Promise<{
  subscriptionId: string | null;
  customerId: string;
  amount: number;
  currency: string;
  invoiceId: string;
  paymentIntentId: string | null;
}> {
  try {
    return {
      subscriptionId: invoice.subscription as string | null,
      customerId: invoice.customer as string,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      invoiceId: invoice.id,
      paymentIntentId: invoice.payment_intent as string | null,
    };
  } catch (error) {
    console.error("Error handling invoice paid:", error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<{
  subscriptionId: string | null;
  customerId: string;
  amount: number;
  currency: string;
  invoiceId: string;
  attemptCount: number;
}> {
  try {
    return {
      subscriptionId: invoice.subscription as string | null,
      customerId: invoice.customer as string,
      amount: invoice.amount_due / 100, // Convert from cents
      currency: invoice.currency,
      invoiceId: invoice.id,
      attemptCount: invoice.attempt_count,
    };
  } catch (error) {
    console.error("Error handling invoice payment failed:", error);
    throw error;
  }
}

// ============================================================================
// INVOICE & PAYMENT HISTORY
// ============================================================================

/**
 * Get all invoices for a customer
 */
export async function getCustomerInvoices(
  customerId: string,
  limit = 10
): Promise<Stripe.Invoice[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data;
  } catch (error) {
    console.error("Error getting customer invoices:", error);
    throw new Error(`Failed to get customer invoices: ${error}`);
  }
}

/**
 * Get upcoming invoice for a subscription
 */
export async function getUpcomingInvoice(
  subscriptionId: string
): Promise<Stripe.Invoice | null> {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscriptionId,
    });

    return invoice;
  } catch (error) {
    // Upcoming invoice may not exist
    console.warn("No upcoming invoice found:", error);
    return null;
  }
}
