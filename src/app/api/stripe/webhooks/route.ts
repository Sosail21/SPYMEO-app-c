// API Route: Stripe Webhooks Handler
// POST /api/stripe/webhooks

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { verifyWebhookSignature } from "@/lib/stripe/client";
import { WEBHOOK_EVENTS } from "@/lib/stripe/config";
import {
  handleCheckoutComplete,
  handleSubscriptionUpdate,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from "@/lib/services/stripe-service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Disable body parsing for webhooks
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Get raw body
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      console.error("Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case WEBHOOK_EVENTS.CHECKOUT_COMPLETED:
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case WEBHOOK_EVENTS.INVOICE_PAID:
        await handleInvoicePaidEvent(event.data.object as Stripe.Invoice);
        break;

      case WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        await handleInvoicePaymentFailedEvent(
          event.data.object as Stripe.Invoice
        );
        break;

      case WEBHOOK_EVENTS.CUSTOMER_CREATED:
      case WEBHOOK_EVENTS.CUSTOMER_UPDATED:
        // Log for debugging, but no action needed
        console.log(`Customer event: ${event.type}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// ============================================================================
// WEBHOOK EVENT HANDLERS
// ============================================================================

/**
 * Handle checkout session completed
 * Creates or updates PassSubscription and User records
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const checkoutData = await handleCheckoutComplete(session);
    const { userId, subscriptionId, customerId, plan } = checkoutData;

    // Update user with Stripe customer ID
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customerId,
        role: "PASS_USER", // Upgrade user role
      },
    });

    // Get subscription details from Stripe
    const subscription = await prisma.$transaction(async (tx) => {
      // Check if subscription already exists
      const existing = await tx.passSubscription.findUnique({
        where: { userId },
      });

      const now = new Date();
      const nextBilling = new Date(now);
      if (plan === "MONTHLY") {
        nextBilling.setMonth(nextBilling.getMonth() + 1);
      } else {
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      }

      if (existing) {
        // Update existing subscription
        return await tx.passSubscription.update({
          where: { userId },
          data: {
            active: true,
            plan,
            stripeSubscriptionId: subscriptionId,
            nextBillingAt: nextBilling,
            monthsPaid: plan === "ANNUAL" ? 12 : existing.monthsPaid + 1,
            carnetStatus: plan === "ANNUAL" ? "PENDING" : existing.carnetStatus,
          },
        });
      } else {
        // Create new subscription
        return await tx.passSubscription.create({
          data: {
            userId,
            active: true,
            plan,
            stripeSubscriptionId: subscriptionId,
            startedAt: now,
            nextBillingAt: nextBilling,
            monthsPaid: plan === "ANNUAL" ? 12 : 1,
            carnetStatus: plan === "ANNUAL" ? "PENDING" : "NOT_ELIGIBLE",
          },
        });
      }
    });

    console.log(
      `Checkout completed for user ${userId}, subscription ${subscriptionId}`
    );
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
    throw error;
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.warn("No userId in subscription metadata");
      return;
    }

    const subscriptionData = await handleSubscriptionUpdate(subscription);

    // Update subscription with Stripe details
    await prisma.passSubscription.update({
      where: { userId },
      data: {
        stripeSubscriptionId: subscriptionData.subscriptionId,
        stripePriceId: subscriptionData.priceId,
        stripeCurrentPeriodEnd: subscriptionData.currentPeriodEnd,
        active: subscriptionData.status === "active",
      },
    });

    console.log(`Subscription created: ${subscription.id}`);
  } catch (error) {
    console.error("Error handling subscription created:", error);
    throw error;
  }
}

/**
 * Handle subscription updated
 * Handles plan changes, renewals, cancellations
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const subscriptionData = await handleSubscriptionUpdate(subscription);

    // Find subscription by Stripe ID
    const existingSubscription = await prisma.passSubscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSubscription) {
      console.warn(`Subscription not found: ${subscription.id}`);
      return;
    }

    // Determine carnet status based on plan and months paid
    let carnetStatus = existingSubscription.carnetStatus;
    if (subscriptionData.plan === "ANNUAL" && carnetStatus === "NOT_ELIGIBLE") {
      carnetStatus = "PENDING";
    } else if (
      subscriptionData.plan === "MONTHLY" &&
      existingSubscription.monthsPaid >= 6 &&
      carnetStatus === "NOT_ELIGIBLE"
    ) {
      carnetStatus = "PENDING";
    }

    // Update subscription
    await prisma.passSubscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        active: subscriptionData.status === "active",
        plan: subscriptionData.plan,
        stripePriceId: subscriptionData.priceId,
        stripeCurrentPeriodEnd: subscriptionData.currentPeriodEnd,
        nextBillingAt: subscriptionData.cancelAtPeriodEnd
          ? null
          : subscriptionData.currentPeriodEnd,
        carnetStatus,
      },
    });

    console.log(`Subscription updated: ${subscription.id}`);
  } catch (error) {
    console.error("Error handling subscription updated:", error);
    throw error;
  }
}

/**
 * Handle subscription deleted/canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Find subscription by Stripe ID
    const existingSubscription = await prisma.passSubscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSubscription) {
      console.warn(`Subscription not found: ${subscription.id}`);
      return;
    }

    // Deactivate subscription
    await prisma.passSubscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        active: false,
        nextBillingAt: null,
      },
    });

    // Downgrade user role if no active subscription
    await prisma.user.update({
      where: { id: existingSubscription.userId },
      data: {
        role: "FREE_USER",
      },
    });

    console.log(`Subscription deleted: ${subscription.id}`);
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
    throw error;
  }
}

/**
 * Handle invoice paid
 * Records payment and updates subscription months paid
 */
async function handleInvoicePaidEvent(invoice: Stripe.Invoice) {
  try {
    const paymentData = await handleInvoicePaid(invoice);

    if (!paymentData.subscriptionId) {
      console.log("Invoice not related to subscription, skipping");
      return;
    }

    // Find subscription by Stripe ID
    const subscription = await prisma.passSubscription.findUnique({
      where: { stripeSubscriptionId: paymentData.subscriptionId },
    });

    if (!subscription) {
      console.warn(`Subscription not found: ${paymentData.subscriptionId}`);
      return;
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        stripePaymentIntentId: paymentData.paymentIntentId,
        stripeInvoiceId: paymentData.invoiceId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: "SUCCEEDED",
        description: `PASS ${subscription.plan} subscription payment`,
        metadata: {
          plan: subscription.plan,
          periodStart: invoice.period_start,
          periodEnd: invoice.period_end,
        },
      },
    });

    // Increment months paid for monthly subscriptions
    if (subscription.plan === "MONTHLY") {
      const newMonthsPaid = subscription.monthsPaid + 1;
      const carnetStatus =
        newMonthsPaid >= 6 && subscription.carnetStatus === "NOT_ELIGIBLE"
          ? "PENDING"
          : subscription.carnetStatus;

      await prisma.passSubscription.update({
        where: { id: subscription.id },
        data: {
          monthsPaid: newMonthsPaid,
          carnetStatus,
        },
      });
    }

    console.log(`Invoice paid: ${invoice.id}`);
  } catch (error) {
    console.error("Error handling invoice paid:", error);
    throw error;
  }
}

/**
 * Handle invoice payment failed
 * Records failed payment attempt
 */
async function handleInvoicePaymentFailedEvent(invoice: Stripe.Invoice) {
  try {
    const paymentData = await handleInvoicePaymentFailed(invoice);

    if (!paymentData.subscriptionId) {
      console.log("Invoice not related to subscription, skipping");
      return;
    }

    // Find subscription by Stripe ID
    const subscription = await prisma.passSubscription.findUnique({
      where: { stripeSubscriptionId: paymentData.subscriptionId },
    });

    if (!subscription) {
      console.warn(`Subscription not found: ${paymentData.subscriptionId}`);
      return;
    }

    // Create payment record with failed status
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        stripeInvoiceId: paymentData.invoiceId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: "FAILED",
        description: `PASS ${subscription.plan} subscription payment failed`,
        failureReason: "payment_failed",
        failureMessage: `Payment failed after ${paymentData.attemptCount} attempts`,
        metadata: {
          plan: subscription.plan,
          attemptCount: paymentData.attemptCount,
        },
      },
    });

    // TODO: Send email notification to user about failed payment

    console.log(`Invoice payment failed: ${invoice.id}`);
  } catch (error) {
    console.error("Error handling invoice payment failed:", error);
    throw error;
  }
}
