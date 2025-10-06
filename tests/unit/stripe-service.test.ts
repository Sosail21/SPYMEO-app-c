// Unit Tests for Stripe Service Layer
// Tests all business logic functions for Stripe integration

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as stripeService from "@/lib/services/stripe-service";
import { stripe } from "@/lib/stripe/client";

// Mock the Stripe client
vi.mock("@/lib/stripe/client", () => ({
  stripe: {
    customers: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
    subscriptions: {
      retrieve: vi.fn(),
      update: vi.fn(),
    },
    invoices: {
      list: vi.fn(),
      retrieveUpcoming: vi.fn(),
    },
  },
}));

describe("Stripe Service - Customer Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrCreateCustomer", () => {
    it("should return existing customer ID if valid", async () => {
      const existingCustomerId = "cus_123456";
      const mockCustomer = { id: existingCustomerId, deleted: false };

      vi.mocked(stripe.customers.retrieve).mockResolvedValue(
        mockCustomer as any
      );

      const result = await stripeService.getOrCreateCustomer(
        "user_123",
        "test@example.com",
        "Test User",
        existingCustomerId
      );

      expect(result).toBe(existingCustomerId);
      expect(stripe.customers.retrieve).toHaveBeenCalledWith(existingCustomerId);
      expect(stripe.customers.create).not.toHaveBeenCalled();
    });

    it("should create new customer if no ID provided", async () => {
      const newCustomerId = "cus_new123";
      const mockCustomer = { id: newCustomerId };

      vi.mocked(stripe.customers.create).mockResolvedValue(
        mockCustomer as any
      );

      const result = await stripeService.getOrCreateCustomer(
        "user_123",
        "test@example.com",
        "Test User"
      );

      expect(result).toBe(newCustomerId);
      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test User",
        metadata: {
          userId: "user_123",
          platform: "spymeo",
        },
      });
    });

    it("should create new customer if existing one is deleted", async () => {
      const oldCustomerId = "cus_old123";
      const newCustomerId = "cus_new123";

      vi.mocked(stripe.customers.retrieve).mockResolvedValue({
        id: oldCustomerId,
        deleted: true,
      } as any);

      vi.mocked(stripe.customers.create).mockResolvedValue({
        id: newCustomerId,
      } as any);

      const result = await stripeService.getOrCreateCustomer(
        "user_123",
        "test@example.com",
        "Test User",
        oldCustomerId
      );

      expect(result).toBe(newCustomerId);
      expect(stripe.customers.create).toHaveBeenCalled();
    });
  });

  describe("updateCustomer", () => {
    it("should update customer with provided data", async () => {
      const customerId = "cus_123";
      const updateData = {
        email: "newemail@example.com",
        name: "Updated Name",
      };

      vi.mocked(stripe.customers.update).mockResolvedValue({
        id: customerId,
        ...updateData,
      } as any);

      const result = await stripeService.updateCustomer(customerId, updateData);

      expect(result.id).toBe(customerId);
      expect(stripe.customers.update).toHaveBeenCalledWith(
        customerId,
        updateData
      );
    });
  });
});

describe("Stripe Service - Checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCheckoutSession", () => {
    it("should create checkout session for monthly plan", async () => {
      const mockSession = {
        id: "cs_test_123",
        url: "https://checkout.stripe.com/test",
      };

      vi.mocked(stripe.customers.create).mockResolvedValue({
        id: "cus_123",
      } as any);

      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockSession as any
      );

      const result = await stripeService.createCheckoutSession({
        userId: "user_123",
        userEmail: "test@example.com",
        userName: "Test User",
        plan: "MONTHLY",
      });

      expect(result.id).toBe(mockSession.id);
      expect(stripe.checkout.sessions.create).toHaveBeenCalled();
    });

    it("should create checkout session for annual plan", async () => {
      const mockSession = {
        id: "cs_test_456",
        url: "https://checkout.stripe.com/test",
      };

      vi.mocked(stripe.customers.create).mockResolvedValue({
        id: "cus_456",
      } as any);

      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockSession as any
      );

      const result = await stripeService.createCheckoutSession({
        userId: "user_456",
        userEmail: "test2@example.com",
        userName: "Test User 2",
        plan: "ANNUAL",
      });

      expect(result.id).toBe(mockSession.id);
    });
  });
});

describe("Stripe Service - Subscription Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSubscription", () => {
    it("should retrieve and format subscription data", async () => {
      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        items: {
          data: [
            {
              price: {
                id: process.env.STRIPE_PRICE_PASS_MONTHLY || "price_monthly",
              },
            },
          ],
        },
        current_period_start: 1704067200, // 2024-01-01
        current_period_end: 1706745600, // 2024-02-01
        cancel_at_period_end: false,
      };

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(
        mockSubscription as any
      );

      const result = await stripeService.getSubscription("sub_123");

      expect(result).toBeDefined();
      expect(result?.subscriptionId).toBe("sub_123");
      expect(result?.customerId).toBe("cus_123");
      expect(result?.status).toBe("active");
    });

    it("should return null if subscription not found", async () => {
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue({
        id: "sub_123",
        items: { data: [] },
      } as any);

      const result = await stripeService.getSubscription("sub_123");

      expect(result).toBeNull();
    });
  });

  describe("cancelSubscription", () => {
    it("should cancel subscription at period end", async () => {
      const mockSubscription = {
        id: "sub_123",
        cancel_at_period_end: true,
      };

      vi.mocked(stripe.subscriptions.update).mockResolvedValue(
        mockSubscription as any
      );

      const result = await stripeService.cancelSubscription("sub_123");

      expect(result.cancel_at_period_end).toBe(true);
      expect(stripe.subscriptions.update).toHaveBeenCalledWith("sub_123", {
        cancel_at_period_end: true,
      });
    });
  });

  describe("reactivateSubscription", () => {
    it("should reactivate a canceled subscription", async () => {
      const mockSubscription = {
        id: "sub_123",
        cancel_at_period_end: false,
      };

      vi.mocked(stripe.subscriptions.update).mockResolvedValue(
        mockSubscription as any
      );

      const result = await stripeService.reactivateSubscription("sub_123");

      expect(result.cancel_at_period_end).toBe(false);
      expect(stripe.subscriptions.update).toHaveBeenCalledWith("sub_123", {
        cancel_at_period_end: false,
      });
    });
  });
});

describe("Stripe Service - Webhook Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleCheckoutComplete", () => {
    it("should extract data from checkout session", async () => {
      const mockSession = {
        id: "cs_123",
        subscription: "sub_123",
        customer: "cus_123",
        metadata: {
          userId: "user_123",
          plan: "MONTHLY",
        },
      };

      const result = await stripeService.handleCheckoutComplete(
        mockSession as any
      );

      expect(result.userId).toBe("user_123");
      expect(result.subscriptionId).toBe("sub_123");
      expect(result.customerId).toBe("cus_123");
      expect(result.plan).toBe("MONTHLY");
    });

    it("should throw error if metadata is missing", async () => {
      const mockSession = {
        id: "cs_123",
        subscription: "sub_123",
        customer: "cus_123",
        metadata: {},
      };

      await expect(
        stripeService.handleCheckoutComplete(mockSession as any)
      ).rejects.toThrow("Missing required metadata");
    });
  });

  describe("handleInvoicePaid", () => {
    it("should extract payment data from invoice", async () => {
      const mockInvoice = {
        id: "in_123",
        subscription: "sub_123",
        customer: "cus_123",
        amount_paid: 1990, // €19.90 in cents
        currency: "eur",
        payment_intent: "pi_123",
      };

      const result = await stripeService.handleInvoicePaid(mockInvoice as any);

      expect(result.invoiceId).toBe("in_123");
      expect(result.subscriptionId).toBe("sub_123");
      expect(result.customerId).toBe("cus_123");
      expect(result.amount).toBe(19.9);
      expect(result.currency).toBe("eur");
    });
  });

  describe("handleInvoicePaymentFailed", () => {
    it("should extract failure data from invoice", async () => {
      const mockInvoice = {
        id: "in_456",
        subscription: "sub_123",
        customer: "cus_123",
        amount_due: 1990,
        currency: "eur",
        attempt_count: 2,
      };

      const result = await stripeService.handleInvoicePaymentFailed(
        mockInvoice as any
      );

      expect(result.invoiceId).toBe("in_456");
      expect(result.subscriptionId).toBe("sub_123");
      expect(result.amount).toBe(19.9);
      expect(result.attemptCount).toBe(2);
    });
  });
});
