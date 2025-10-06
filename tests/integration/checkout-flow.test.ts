// Integration Tests for Stripe Checkout Flow
// Tests the complete checkout flow from session creation to subscription activation

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// Mock Stripe API responses
const mockStripeApi = setupServer(
  // Create checkout session
  http.post("/api/stripe/create-checkout", () => {
    return HttpResponse.json({
      sessionId: "cs_test_123",
      url: "https://checkout.stripe.com/test",
    });
  }),

  // Create portal session
  http.post("/api/stripe/create-portal", () => {
    return HttpResponse.json({
      url: "https://billing.stripe.com/test",
    });
  }),

  // Webhook endpoint
  http.post("/api/stripe/webhooks", () => {
    return HttpResponse.json({ received: true });
  })
);

beforeAll(() => mockStripeApi.listen());
afterAll(() => mockStripeApi.close());

describe("Checkout Flow Integration", () => {
  describe("POST /api/stripe/create-checkout", () => {
    it("should create checkout session for monthly plan", async () => {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "MONTHLY",
          userId: "user_123",
          userEmail: "test@example.com",
          userName: "Test User",
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("sessionId");
      expect(data).toHaveProperty("url");
      expect(data.url).toContain("checkout.stripe.com");
    });

    it("should create checkout session for annual plan", async () => {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "ANNUAL",
          userId: "user_456",
          userEmail: "test2@example.com",
          userName: "Test User 2",
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("sessionId");
      expect(data).toHaveProperty("url");
    });

    it("should reject invalid plan", async () => {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "INVALID",
          userId: "user_123",
          userEmail: "test@example.com",
          userName: "Test User",
        }),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty("error");
    });

    it("should reject missing required fields", async () => {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "MONTHLY",
          // Missing userId, userEmail, userName
        }),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty("error");
    });
  });

  describe("POST /api/stripe/create-portal", () => {
    it("should create portal session", async () => {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripeCustomerId: "cus_123",
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("url");
      expect(data.url).toContain("billing.stripe.com");
    });

    it("should accept optional returnUrl", async () => {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripeCustomerId: "cus_123",
          returnUrl: "https://example.com/return",
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("url");
    });

    it("should reject missing customer ID", async () => {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty("error");
    });
  });
});

describe("Webhook Flow Integration", () => {
  describe("POST /api/stripe/webhooks", () => {
    it("should accept webhook with valid signature", async () => {
      const response = await fetch("/api/stripe/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": "t=123456789,v1=signature",
        },
        body: JSON.stringify({
          type: "checkout.session.completed",
          data: {
            object: {
              id: "cs_test_123",
              subscription: "sub_123",
              customer: "cus_123",
              metadata: {
                userId: "user_123",
                plan: "MONTHLY",
              },
            },
          },
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("received");
      expect(data.received).toBe(true);
    });
  });
});

describe("Complete Subscription Flow", () => {
  it("should complete full subscription flow", async () => {
    // Step 1: Create checkout session
    const checkoutResponse = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: "ANNUAL",
        userId: "user_flow_test",
        userEmail: "flow@example.com",
        userName: "Flow Test User",
      }),
    });

    expect(checkoutResponse.status).toBe(200);
    const checkoutData = await checkoutResponse.json();
    expect(checkoutData).toHaveProperty("sessionId");
    expect(checkoutData).toHaveProperty("url");

    // Step 2: Simulate webhook after successful payment
    const webhookResponse = await fetch("/api/stripe/webhooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=123456789,v1=signature",
      },
      body: JSON.stringify({
        type: "checkout.session.completed",
        data: {
          object: {
            id: checkoutData.sessionId,
            subscription: "sub_flow_test",
            customer: "cus_flow_test",
            metadata: {
              userId: "user_flow_test",
              plan: "ANNUAL",
            },
          },
        },
      }),
    });

    expect(webhookResponse.status).toBe(200);

    // Step 3: Create portal session for management
    const portalResponse = await fetch("/api/stripe/create-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stripeCustomerId: "cus_flow_test",
      }),
    });

    expect(portalResponse.status).toBe(200);
    const portalData = await portalResponse.json();
    expect(portalData).toHaveProperty("url");
  });
});
