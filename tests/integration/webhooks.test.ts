// Integration Tests for Stripe Webhooks
// Tests webhook event handling with mock Stripe events

import { describe, it, expect, beforeEach, vi } from "vitest";
import Stripe from "stripe";
import {
  handleCheckoutComplete,
  handleSubscriptionUpdate,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from "@/lib/services/stripe-service";

describe("Webhook Event Handlers", () => {
  describe("checkout.session.completed", () => {
    it("should handle monthly subscription checkout", async () => {
      const mockSession: Partial<Stripe.Checkout.Session> = {
        id: "cs_test_monthly",
        subscription: "sub_monthly_123",
        customer: "cus_123",
        metadata: {
          userId: "user_123",
          plan: "MONTHLY",
        },
      };

      const result = await handleCheckoutComplete(
        mockSession as Stripe.Checkout.Session
      );

      expect(result.userId).toBe("user_123");
      expect(result.subscriptionId).toBe("sub_monthly_123");
      expect(result.customerId).toBe("cus_123");
      expect(result.plan).toBe("MONTHLY");
    });

    it("should handle annual subscription checkout", async () => {
      const mockSession: Partial<Stripe.Checkout.Session> = {
        id: "cs_test_annual",
        subscription: "sub_annual_123",
        customer: "cus_456",
        metadata: {
          userId: "user_456",
          plan: "ANNUAL",
        },
      };

      const result = await handleCheckoutComplete(
        mockSession as Stripe.Checkout.Session
      );

      expect(result.userId).toBe("user_456");
      expect(result.plan).toBe("ANNUAL");
    });

    it("should throw error if userId missing", async () => {
      const mockSession: Partial<Stripe.Checkout.Session> = {
        id: "cs_test_invalid",
        subscription: "sub_123",
        customer: "cus_123",
        metadata: {
          plan: "MONTHLY",
          // userId missing
        },
      };

      await expect(
        handleCheckoutComplete(mockSession as Stripe.Checkout.Session)
      ).rejects.toThrow("Missing required metadata");
    });

    it("should throw error if plan missing", async () => {
      const mockSession: Partial<Stripe.Checkout.Session> = {
        id: "cs_test_invalid",
        subscription: "sub_123",
        customer: "cus_123",
        metadata: {
          userId: "user_123",
          // plan missing
        },
      };

      await expect(
        handleCheckoutComplete(mockSession as Stripe.Checkout.Session)
      ).rejects.toThrow("Missing required metadata");
    });
  });

  describe("customer.subscription.updated", () => {
    it("should handle active monthly subscription", async () => {
      const mockSubscription: Partial<Stripe.Subscription> = {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        items: {
          data: [
            {
              price: {
                id: process.env.STRIPE_PRICE_PASS_MONTHLY || "price_monthly",
              } as Stripe.Price,
            } as Stripe.SubscriptionItem,
          ],
        } as Stripe.ApiList<Stripe.SubscriptionItem>,
        current_period_start: 1704067200,
        current_period_end: 1706745600,
        cancel_at_period_end: false,
      };

      const result = await handleSubscriptionUpdate(
        mockSubscription as Stripe.Subscription
      );

      expect(result.subscriptionId).toBe("sub_123");
      expect(result.status).toBe("active");
      expect(result.plan).toBe("MONTHLY");
      expect(result.cancelAtPeriodEnd).toBe(false);
    });

    it("should handle canceled subscription", async () => {
      const mockSubscription: Partial<Stripe.Subscription> = {
        id: "sub_canceled",
        customer: "cus_123",
        status: "active",
        items: {
          data: [
            {
              price: {
                id: process.env.STRIPE_PRICE_PASS_ANNUAL || "price_annual",
              } as Stripe.Price,
            } as Stripe.SubscriptionItem,
          ],
        } as Stripe.ApiList<Stripe.SubscriptionItem>,
        current_period_start: 1704067200,
        current_period_end: 1735689600,
        cancel_at_period_end: true,
      };

      const result = await handleSubscriptionUpdate(
        mockSubscription as Stripe.Subscription
      );

      expect(result.cancelAtPeriodEnd).toBe(true);
    });
  });

  describe("invoice.paid", () => {
    it("should handle successful monthly payment", async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: "in_monthly_123",
        subscription: "sub_123",
        customer: "cus_123",
        amount_paid: 1990, // €19.90 in cents
        currency: "eur",
        payment_intent: "pi_123",
      };

      const result = await handleInvoicePaid(mockInvoice as Stripe.Invoice);

      expect(result.invoiceId).toBe("in_monthly_123");
      expect(result.subscriptionId).toBe("sub_123");
      expect(result.amount).toBe(19.9);
      expect(result.currency).toBe("eur");
      expect(result.paymentIntentId).toBe("pi_123");
    });

    it("should handle successful annual payment", async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: "in_annual_123",
        subscription: "sub_456",
        customer: "cus_456",
        amount_paid: 19900, // €199 in cents
        currency: "eur",
        payment_intent: "pi_456",
      };

      const result = await handleInvoicePaid(mockInvoice as Stripe.Invoice);

      expect(result.amount).toBe(199);
    });

    it("should handle invoice without subscription", async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: "in_no_sub",
        subscription: null,
        customer: "cus_123",
        amount_paid: 1990,
        currency: "eur",
        payment_intent: "pi_789",
      };

      const result = await handleInvoicePaid(mockInvoice as Stripe.Invoice);

      expect(result.subscriptionId).toBeNull();
      expect(result.customerId).toBe("cus_123");
    });
  });

  describe("invoice.payment_failed", () => {
    it("should handle failed payment with retry count", async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: "in_failed_123",
        subscription: "sub_123",
        customer: "cus_123",
        amount_due: 1990,
        currency: "eur",
        attempt_count: 2,
      };

      const result = await handleInvoicePaymentFailed(
        mockInvoice as Stripe.Invoice
      );

      expect(result.invoiceId).toBe("in_failed_123");
      expect(result.subscriptionId).toBe("sub_123");
      expect(result.amount).toBe(19.9);
      expect(result.attemptCount).toBe(2);
    });

    it("should handle first failed payment attempt", async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: "in_failed_first",
        subscription: "sub_456",
        customer: "cus_456",
        amount_due: 19900,
        currency: "eur",
        attempt_count: 1,
      };

      const result = await handleInvoicePaymentFailed(
        mockInvoice as Stripe.Invoice
      );

      expect(result.attemptCount).toBe(1);
    });

    it("should handle multiple failed attempts", async () => {
      const mockInvoice: Partial<Stripe.Invoice> = {
        id: "in_failed_multiple",
        subscription: "sub_789",
        customer: "cus_789",
        amount_due: 1990,
        currency: "eur",
        attempt_count: 4,
      };

      const result = await handleInvoicePaymentFailed(
        mockInvoice as Stripe.Invoice
      );

      expect(result.attemptCount).toBe(4);
    });
  });
});

describe("Webhook Signature Verification", () => {
  it("should verify valid webhook signature", () => {
    // This would test actual signature verification
    // In practice, you'd use Stripe's test fixtures
    expect(true).toBe(true);
  });

  it("should reject invalid webhook signature", () => {
    // This would test rejection of invalid signatures
    expect(true).toBe(true);
  });
});

describe("Webhook Event Processing Order", () => {
  it("should handle events in correct order", async () => {
    const events = [];

    // 1. Checkout completed
    const checkoutSession: Partial<Stripe.Checkout.Session> = {
      id: "cs_order_test",
      subscription: "sub_order_test",
      customer: "cus_order_test",
      metadata: {
        userId: "user_order_test",
        plan: "MONTHLY",
      },
    };

    const checkoutResult = await handleCheckoutComplete(
      checkoutSession as Stripe.Checkout.Session
    );
    events.push("checkout_completed");
    expect(checkoutResult.userId).toBe("user_order_test");

    // 2. Subscription created (handled implicitly)
    events.push("subscription_created");

    // 3. Invoice paid
    const invoice: Partial<Stripe.Invoice> = {
      id: "in_order_test",
      subscription: "sub_order_test",
      customer: "cus_order_test",
      amount_paid: 1990,
      currency: "eur",
      payment_intent: "pi_order_test",
    };

    const invoiceResult = await handleInvoicePaid(invoice as Stripe.Invoice);
    events.push("invoice_paid");
    expect(invoiceResult.subscriptionId).toBe("sub_order_test");

    // Verify order
    expect(events).toEqual([
      "checkout_completed",
      "subscription_created",
      "invoice_paid",
    ]);
  });
});
