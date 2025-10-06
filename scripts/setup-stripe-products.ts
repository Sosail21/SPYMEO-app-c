#!/usr/bin/env ts-node

/**
 * Stripe Products Setup Script
 *
 * This script creates the necessary products and prices in Stripe for the SPYMEO PASS subscription.
 * Run this script once to set up your Stripe account with the correct products.
 *
 * Usage:
 *   npm run setup-stripe-products
 *
 * or directly with ts-node:
 *   ts-node scripts/setup-stripe-products.ts
 *
 * Make sure to set STRIPE_SECRET_KEY in your environment before running.
 */

import Stripe from "stripe";

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("❌ Error: STRIPE_SECRET_KEY environment variable is not set");
  console.error("Please set it in your .env file or export it in your shell:");
  console.error("  export STRIPE_SECRET_KEY=sk_test_...");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});

// Product and price configuration
const PRODUCTS = {
  passMonthly: {
    name: "PASS SPYMEO Mensuel",
    description: "Accès mensuel au PASS SPYMEO avec tous les avantages : réductions partenaires, ressources exclusives, et carnet de vie après 6 mois.",
    price: 19.90,
    interval: "month" as const,
    features: [
      "Réductions chez les partenaires",
      "Ressources mensuelles exclusives (podcasts, livrets, vidéos)",
      "Accès à la communauté SPYMEO",
      "Carnet de vie après 6 mois de cotisation",
    ],
  },
  passAnnual: {
    name: "PASS SPYMEO Annuel",
    description: "Accès annuel au PASS SPYMEO avec tous les avantages : réductions partenaires, ressources exclusives, et carnet de vie immédiat. Économisez 2 mois !",
    price: 199,
    interval: "year" as const,
    features: [
      "Réductions chez les partenaires",
      "Ressources mensuelles exclusives (podcasts, livrets, vidéos)",
      "Accès à la communauté SPYMEO",
      "Carnet de vie envoyé immédiatement",
      "Économisez 40,80€ par rapport au mensuel (239,80€ → 199€)",
    ],
  },
};

async function setupProducts() {
  console.log("🚀 Setting up Stripe products for SPYMEO PASS...\n");

  try {
    // Create Monthly Product
    console.log("📦 Creating Monthly PASS product...");
    const monthlyProduct = await stripe.products.create({
      name: PRODUCTS.passMonthly.name,
      description: PRODUCTS.passMonthly.description,
      metadata: {
        plan: "MONTHLY",
        features: JSON.stringify(PRODUCTS.passMonthly.features),
      },
    });
    console.log(`✅ Created product: ${monthlyProduct.id}`);

    // Create Monthly Price
    console.log("💰 Creating Monthly price...");
    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: Math.round(PRODUCTS.passMonthly.price * 100), // Convert to cents
      currency: "eur",
      recurring: {
        interval: PRODUCTS.passMonthly.interval,
      },
      metadata: {
        plan: "MONTHLY",
      },
    });
    console.log(`✅ Created price: ${monthlyPrice.id}\n`);

    // Create Annual Product
    console.log("📦 Creating Annual PASS product...");
    const annualProduct = await stripe.products.create({
      name: PRODUCTS.passAnnual.name,
      description: PRODUCTS.passAnnual.description,
      metadata: {
        plan: "ANNUAL",
        features: JSON.stringify(PRODUCTS.passAnnual.features),
      },
    });
    console.log(`✅ Created product: ${annualProduct.id}`);

    // Create Annual Price
    console.log("💰 Creating Annual price...");
    const annualPrice = await stripe.prices.create({
      product: annualProduct.id,
      unit_amount: Math.round(PRODUCTS.passAnnual.price * 100), // Convert to cents
      currency: "eur",
      recurring: {
        interval: PRODUCTS.passAnnual.interval,
      },
      metadata: {
        plan: "ANNUAL",
      },
    });
    console.log(`✅ Created price: ${annualPrice.id}\n`);

    // Print environment variables to add
    console.log("✨ Setup complete! Add these to your .env file:\n");
    console.log("# Stripe Products");
    console.log(`STRIPE_PRODUCT_PASS_MONTHLY=${monthlyProduct.id}`);
    console.log(`STRIPE_PRODUCT_PASS_ANNUAL=${annualProduct.id}`);
    console.log("");
    console.log("# Stripe Prices");
    console.log(`STRIPE_PRICE_PASS_MONTHLY=${monthlyPrice.id}`);
    console.log(`STRIPE_PRICE_PASS_ANNUAL=${annualPrice.id}`);
    console.log("");

    console.log("📝 Summary:");
    console.log(`  Monthly Plan: €${PRODUCTS.passMonthly.price}/month`);
    console.log(`  Annual Plan:  €${PRODUCTS.passAnnual.price}/year`);
    console.log(`  Annual Savings: €${(PRODUCTS.passMonthly.price * 12 - PRODUCTS.passAnnual.price).toFixed(2)}`);
    console.log("");
    console.log("🔗 View in Stripe Dashboard:");
    console.log(`  https://dashboard.stripe.com/products/${monthlyProduct.id}`);
    console.log(`  https://dashboard.stripe.com/products/${annualProduct.id}`);
    console.log("");
    console.log("✅ All done! You can now use these products in your application.");

  } catch (error) {
    console.error("❌ Error setting up products:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run the setup
setupProducts();
