// Stripe Server-Side Client
// Handles all server-side Stripe API interactions

import Stripe from "stripe";
import { STRIPE_CONFIG } from "./config";

// Initialize Stripe client with proper configuration
export const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: "2025-01-27.acacia", // Use latest API version
  typescript: true,
  appInfo: {
    name: "SPYMEO Platform",
    version: "1.0.0",
    url: "https://spymeo.com",
  },
});

// Webhook signature verification
export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err) {
    const error = err as Error;
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

// Export types for use throughout the application
export type {
  Stripe,
};
