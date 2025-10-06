// Client-side Stripe Helpers
// Utilities for Stripe integration in React components

"use client";

import { loadStripe, Stripe } from "@stripe/stripe-js";

// Initialize Stripe.js with publishable key
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
}

// ============================================================================
// CHECKOUT FLOW
// ============================================================================

export interface CreateCheckoutParams {
  plan: "MONTHLY" | "ANNUAL";
  userId: string;
  userEmail: string;
  userName: string;
  stripeCustomerId?: string;
}

/**
 * Create a checkout session and redirect to Stripe Checkout
 */
export async function redirectToCheckout(
  params: CreateCheckoutParams
): Promise<void> {
  try {
    // Call API to create checkout session
    const response = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create checkout session");
    }

    const { url } = await response.json();

    // Redirect to Stripe Checkout
    if (url) {
      window.location.href = url;
    } else {
      throw new Error("No checkout URL returned");
    }
  } catch (error) {
    console.error("Error redirecting to checkout:", error);
    throw error;
  }
}

// ============================================================================
// CUSTOMER PORTAL
// ============================================================================

export interface CreatePortalParams {
  stripeCustomerId: string;
  returnUrl?: string;
}

/**
 * Create a portal session and redirect to Stripe Customer Portal
 */
export async function redirectToPortal(
  params: CreatePortalParams
): Promise<void> {
  try {
    // Call API to create portal session
    const response = await fetch("/api/stripe/create-portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create portal session");
    }

    const { url } = await response.json();

    // Redirect to Stripe Customer Portal
    if (url) {
      window.location.href = url;
    } else {
      throw new Error("No portal URL returned");
    }
  } catch (error) {
    console.error("Error redirecting to portal:", error);
    throw error;
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format currency amount for display
 */
export function formatCurrency(
  amount: number,
  currency = "EUR",
  locale = "fr-FR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Get plan price display
 */
export function getPlanPrice(plan: "MONTHLY" | "ANNUAL"): string {
  return plan === "MONTHLY" ? formatCurrency(19.9) : formatCurrency(199);
}

/**
 * Get plan interval display
 */
export function getPlanInterval(plan: "MONTHLY" | "ANNUAL"): string {
  return plan === "MONTHLY" ? "par mois" : "par an";
}

/**
 * Calculate savings for annual plan
 */
export function getAnnualSavings(): {
  monthlyTotal: number;
  annualPrice: number;
  savings: number;
  savingsFormatted: string;
} {
  const monthlyTotal = 19.9 * 12;
  const annualPrice = 199;
  const savings = monthlyTotal - annualPrice;

  return {
    monthlyTotal,
    annualPrice,
    savings,
    savingsFormatted: formatCurrency(savings),
  };
}

/**
 * Check if checkout was successful (from URL params)
 */
export function checkCheckoutSuccess(): boolean {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  return params.get("success") === "true";
}

/**
 * Check if checkout was cancelled (from URL params)
 */
export function checkCheckoutCancelled(): boolean {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  return params.get("cancelled") === "true";
}
