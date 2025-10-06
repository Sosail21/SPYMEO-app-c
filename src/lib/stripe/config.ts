// Stripe Configuration
// Contains all Stripe-related configuration including product IDs, prices, and settings

export const STRIPE_CONFIG = {
  // API Keys (loaded from environment variables)
  secretKey: process.env.STRIPE_SECRET_KEY!,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

  // Product IDs (will be set after running setup-stripe-products script)
  products: {
    passMonthly: process.env.STRIPE_PRODUCT_PASS_MONTHLY!,
    passAnnual: process.env.STRIPE_PRODUCT_PASS_ANNUAL!,
  },

  // Price IDs (will be set after running setup-stripe-products script)
  prices: {
    passMonthly: process.env.STRIPE_PRICE_PASS_MONTHLY!, // €19.90/month
    passAnnual: process.env.STRIPE_PRICE_PASS_ANNUAL!, // €199/year
  },

  // Currency
  currency: "eur" as const,

  // Subscription configuration
  subscription: {
    trialPeriodDays: 0, // No trial period by default
    billingCycleAnchorBehavior: "now" as const,
  },

  // Customer portal
  portal: {
    returnUrl: process.env.NEXT_PUBLIC_APP_URL + "/user/pass",
  },

  // Checkout
  checkout: {
    successUrl: process.env.NEXT_PUBLIC_APP_URL + "/user/pass?success=true",
    cancelUrl: process.env.NEXT_PUBLIC_APP_URL + "/pass",
    mode: "subscription" as const,
  },

  // PASS Plan details
  plans: {
    MONTHLY: {
      name: "PASS Mensuel",
      price: 19.9,
      interval: "month" as const,
      description: "Accès mensuel au PASS SPYMEO avec tous les avantages",
      features: [
        "Réductions chez les partenaires",
        "Ressources mensuelles exclusives",
        "Carnet de vie après 6 mois",
        "Accès à la communauté",
      ],
    },
    ANNUAL: {
      name: "PASS Annuel",
      price: 199,
      interval: "year" as const,
      description: "Accès annuel au PASS SPYMEO avec tous les avantages",
      features: [
        "Réductions chez les partenaires",
        "Ressources mensuelles exclusives",
        "Carnet de vie immédiat",
        "Accès à la communauté",
        "Économisez 2 mois (239,80€ → 199€)",
      ],
    },
  },
} as const;

// Webhook events we handle
export const WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: "checkout.session.completed",
  SUBSCRIPTION_CREATED: "customer.subscription.created",
  SUBSCRIPTION_UPDATED: "customer.subscription.updated",
  SUBSCRIPTION_DELETED: "customer.subscription.deleted",
  INVOICE_PAID: "invoice.paid",
  INVOICE_PAYMENT_FAILED: "invoice.payment_failed",
  CUSTOMER_CREATED: "customer.created",
  CUSTOMER_UPDATED: "customer.updated",
} as const;

// Validate that all required environment variables are set
export function validateStripeConfig(): {
  valid: boolean;
  missing: string[];
} {
  const requiredVars = [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRODUCT_PASS_MONTHLY",
    "STRIPE_PRODUCT_PASS_ANNUAL",
    "STRIPE_PRICE_PASS_MONTHLY",
    "STRIPE_PRICE_PASS_ANNUAL",
    "NEXT_PUBLIC_APP_URL",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

// Helper to get price ID from plan
export function getPriceIdFromPlan(
  plan: "MONTHLY" | "ANNUAL"
): string {
  return plan === "MONTHLY"
    ? STRIPE_CONFIG.prices.passMonthly
    : STRIPE_CONFIG.prices.passAnnual;
}

// Helper to get plan from price ID
export function getPlanFromPriceId(
  priceId: string
): "MONTHLY" | "ANNUAL" | null {
  if (priceId === STRIPE_CONFIG.prices.passMonthly) return "MONTHLY";
  if (priceId === STRIPE_CONFIG.prices.passAnnual) return "ANNUAL";
  return null;
}
