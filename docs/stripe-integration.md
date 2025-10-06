# Stripe Integration Documentation

Complete guide for the SPYMEO PASS Stripe payment integration.

## Table of Contents

- [Overview](#overview)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Webhooks](#webhooks)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Overview

The SPYMEO PASS subscription system uses Stripe for payment processing, subscription management, and customer billing. The integration supports:

- **Two subscription plans:**
  - Monthly: €19.90/month
  - Annual: €199/year (saves €40.80 vs monthly)

- **Key features:**
  - Secure checkout with Stripe Checkout
  - Customer portal for subscription management
  - Automatic webhook handling for subscription events
  - Payment history tracking
  - Plan upgrades/downgrades
  - Subscription cancellation and reactivation

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed:
```bash
npm install stripe@latest @stripe/stripe-js@latest
```

### 2. Create Stripe Account

1. Sign up at [https://stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard

### 3. Set Up Products in Stripe

Run the setup script to create products and prices:

```bash
# Make sure STRIPE_SECRET_KEY is set
export STRIPE_SECRET_KEY=sk_test_...

# Run the setup script
npm run setup-stripe-products
# or
npx ts-node scripts/setup-stripe-products.ts
```

The script will output environment variables to add to your `.env` file.

### 4. Configure Webhooks

#### For Local Development:

Install the Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
```

Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

Copy the webhook signing secret provided.

#### For Production:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhooks`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy the webhook signing secret

### 5. Update Database Schema

Run Prisma migration to add Stripe fields:

```bash
npx prisma migrate dev --name add-stripe-integration
```

## Environment Variables

Create or update your `.env` file with the following:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Products (from setup script)
STRIPE_PRODUCT_PASS_MONTHLY=prod_...
STRIPE_PRODUCT_PASS_ANNUAL=prod_...

# Stripe Prices (from setup script)
STRIPE_PRICE_PASS_MONTHLY=price_...
STRIPE_PRICE_PASS_ANNUAL=price_...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (if not already set)
DATABASE_URL=postgresql://user:password@localhost:5432/spymeo
```

### Environment Variable Descriptions:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_`) | Yes | `sk_test_51234...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (starts with `pk_`) | Yes | `pk_test_51234...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (starts with `whsec_`) | Yes | `whsec_1234...` |
| `STRIPE_PRODUCT_PASS_MONTHLY` | Product ID for monthly plan | Yes | `prod_ABCD...` |
| `STRIPE_PRODUCT_PASS_ANNUAL` | Product ID for annual plan | Yes | `prod_EFGH...` |
| `STRIPE_PRICE_PASS_MONTHLY` | Price ID for monthly plan | Yes | `price_1234...` |
| `STRIPE_PRICE_PASS_ANNUAL` | Price ID for annual plan | Yes | `price_5678...` |
| `NEXT_PUBLIC_APP_URL` | Your application URL | Yes | `https://spymeo.com` |

## Architecture

### File Structure

```
src/
├── lib/
│   ├── stripe/
│   │   ├── client.ts           # Server-side Stripe client
│   │   ├── config.ts           # Configuration & constants
│   │   └── client-helpers.ts  # Client-side utilities
│   └── services/
│       └── stripe-service.ts   # Business logic layer
├── app/
│   └── api/
│       ├── stripe/
│       │   ├── create-checkout/
│       │   │   └── route.ts    # Checkout endpoint
│       │   ├── create-portal/
│       │   │   └── route.ts    # Portal endpoint
│       │   └── webhooks/
│       │       └── route.ts    # Webhook handler
│       └── user/
│           └── pass/
│               ├── route.ts            # Get subscription
│               └── toggle-plan/
│                   └── route.ts        # Change plan
├── components/
│   └── stripe/
│       ├── CheckoutButton.tsx  # Example checkout button
│       └── PortalButton.tsx    # Example portal button
└── prisma/
    └── schema.prisma           # Database schema with Stripe fields

scripts/
└── setup-stripe-products.ts   # Setup script

tests/
├── unit/
│   └── stripe-service.test.ts # Unit tests
└── integration/
    ├── checkout-flow.test.ts  # Integration tests
    └── webhooks.test.ts       # Webhook tests

docs/
└── stripe-integration.md      # This file
```

### Data Flow

#### Subscription Creation Flow:

```
1. User clicks "Subscribe" button
   ↓
2. Frontend calls /api/stripe/create-checkout
   ↓
3. Backend creates Stripe Checkout Session
   ↓
4. User redirected to Stripe Checkout page
   ↓
5. User completes payment
   ↓
6. Stripe sends checkout.session.completed webhook
   ↓
7. Backend processes webhook:
   - Updates user role to PASS_USER
   - Creates PassSubscription record
   - Links Stripe customer ID
   ↓
8. User redirected to success page
```

#### Subscription Management Flow:

```
1. User clicks "Manage Subscription"
   ↓
2. Frontend calls /api/stripe/create-portal
   ↓
3. Backend creates Stripe Customer Portal session
   ↓
4. User redirected to Stripe Customer Portal
   ↓
5. User makes changes (cancel, update payment, etc.)
   ↓
6. Stripe sends subscription.updated webhook
   ↓
7. Backend updates database accordingly
```

## API Endpoints

### POST /api/stripe/create-checkout

Creates a Stripe Checkout session for subscription purchase.

**Request Body:**
```json
{
  "plan": "MONTHLY" | "ANNUAL",
  "userId": "string",
  "userEmail": "string",
  "userName": "string",
  "stripeCustomerId": "string" // optional
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Usage Example:**
```typescript
import { redirectToCheckout } from "@/lib/stripe/client-helpers";

await redirectToCheckout({
  plan: "ANNUAL",
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
});
```

### POST /api/stripe/create-portal

Creates a Stripe Customer Portal session for subscription management.

**Request Body:**
```json
{
  "stripeCustomerId": "string",
  "returnUrl": "string" // optional
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

**Usage Example:**
```typescript
import { redirectToPortal } from "@/lib/stripe/client-helpers";

await redirectToPortal({
  stripeCustomerId: subscription.stripeCustomerId,
});
```

### POST /api/stripe/webhooks

Handles Stripe webhook events.

**Headers Required:**
- `stripe-signature`: Webhook signature for verification

**Events Handled:**
- `checkout.session.completed`: New subscription created
- `customer.subscription.created`: Subscription created
- `customer.subscription.updated`: Subscription changed
- `customer.subscription.deleted`: Subscription canceled
- `invoice.paid`: Payment successful
- `invoice.payment_failed`: Payment failed

## Webhooks

### Webhook Event Handling

#### checkout.session.completed
Triggered when a checkout session is completed successfully.

**Actions:**
- Update user role to PASS_USER
- Create or update PassSubscription
- Link Stripe customer ID to user

#### customer.subscription.created
Triggered when a subscription is created.

**Actions:**
- Update subscription with Stripe details
- Set subscription status

#### customer.subscription.updated
Triggered when a subscription changes (plan, status, etc.).

**Actions:**
- Update subscription plan
- Update billing dates
- Handle cancellations
- Update carnet eligibility

#### customer.subscription.deleted
Triggered when a subscription is deleted.

**Actions:**
- Deactivate subscription
- Downgrade user role to FREE_USER

#### invoice.paid
Triggered when an invoice is paid successfully.

**Actions:**
- Create Payment record
- Increment months paid (for monthly plans)
- Update carnet eligibility

#### invoice.payment_failed
Triggered when a payment attempt fails.

**Actions:**
- Create Payment record with failed status
- Send notification to user (TODO)

### Testing Webhooks Locally

Use the Stripe CLI to trigger test events:

```bash
# Trigger a successful checkout
stripe trigger checkout.session.completed

# Trigger a successful payment
stripe trigger invoice.paid

# Trigger a failed payment
stripe trigger invoice.payment_failed
```

View webhook logs:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

## Testing

### Run Unit Tests

```bash
npm run test:unit
```

Unit tests cover:
- Stripe service functions
- Customer management
- Subscription operations
- Webhook handlers

### Run Integration Tests

```bash
npm run test:integration
```

Integration tests cover:
- Complete checkout flow
- Customer portal creation
- Webhook processing
- End-to-end subscription lifecycle

### Test with Stripe Test Cards

Use Stripe test cards for different scenarios:

**Successful payment:**
```
Card number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Payment requires authentication:**
```
Card number: 4000 0025 0000 3155
```

**Payment declined:**
```
Card number: 4000 0000 0000 9995
```

**Insufficient funds:**
```
Card number: 4000 0000 0000 9995
```

More test cards: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## Error Handling

### Common Errors and Solutions

#### Invalid API Key
**Error:** `Invalid API Key provided`
**Solution:** Verify `STRIPE_SECRET_KEY` is correct and matches your environment (test/live)

#### Webhook Signature Verification Failed
**Error:** `Webhook signature verification failed`
**Solution:**
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Don't modify the raw body before verification
- Check that the endpoint URL matches Stripe dashboard configuration

#### Customer Not Found
**Error:** `No such customer`
**Solution:** Customer may have been deleted in Stripe. The service will create a new customer automatically.

#### Subscription Not Found
**Error:** `No such subscription`
**Solution:** Subscription may have been deleted. Check Stripe dashboard for the subscription status.

### Error Response Format

All API endpoints return errors in this format:

```json
{
  "error": "Human-readable error message",
  "details": {
    // Additional error details (in development)
  }
}
```

## Security

### Best Practices

1. **Never expose secret keys:**
   - Server-side only: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - Client-side safe: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

2. **Always verify webhook signatures:**
   - Protects against fake webhook requests
   - Implemented in `verifyWebhookSignature()`

3. **Use HTTPS in production:**
   - Stripe requires HTTPS for webhooks
   - Enable in production environment

4. **Validate user permissions:**
   - Verify user owns subscription before operations
   - Implement proper authentication

5. **Handle PII correctly:**
   - Don't store card details
   - Use Stripe Customer Portal for payment updates
   - Follow GDPR requirements

### PCI Compliance

✅ **Compliant:** Using Stripe Checkout and Customer Portal means you don't handle card data directly.

You are PCI DSS compliant when:
- Using Stripe Elements or Checkout
- Not storing card details
- Not transmitting card data through your servers

## Troubleshooting

### Checkout Session Not Redirecting

**Symptoms:** User stays on checkout page
**Possible causes:**
- Invalid success/cancel URLs
- Browser blocking redirect
- JavaScript errors

**Debug steps:**
1. Check browser console for errors
2. Verify URLs in `.env` are correct
3. Test with different browsers

### Webhooks Not Firing

**Symptoms:** Subscription created but database not updated
**Possible causes:**
- Webhook endpoint not reachable
- Invalid webhook secret
- Endpoint returning error

**Debug steps:**
1. Check Stripe Dashboard → Developers → Webhooks for failed attempts
2. View webhook logs for error messages
3. Test locally with Stripe CLI
4. Verify endpoint is not behind authentication

### Payments Succeeding but Subscription Not Active

**Symptoms:** Payment successful but user doesn't have PASS access
**Possible causes:**
- Webhook processing failed
- Database transaction error
- Subscription status sync issue

**Debug steps:**
1. Check webhook event logs in Stripe Dashboard
2. Check application logs for errors
3. Manually check subscription status in Stripe
4. Re-sync from Stripe using GET /api/user/pass endpoint

### Plan Change Not Working

**Symptoms:** User tries to change plan but it fails
**Possible causes:**
- No active Stripe subscription
- Invalid price ID
- Subscription already canceled

**Debug steps:**
1. Verify subscription exists in Stripe
2. Check subscription status
3. Ensure price IDs are correct in `.env`
4. Check application logs for specific error

## Migration from Mock to Production

### Checklist:

- [ ] Update `.env` with production Stripe keys
- [ ] Run `setup-stripe-products.ts` in production mode
- [ ] Update webhook endpoint in Stripe Dashboard
- [ ] Run database migrations
- [ ] Test checkout flow end-to-end
- [ ] Test webhook processing
- [ ] Set up monitoring and alerts
- [ ] Configure customer email notifications

### Data Migration:

If you have existing users with mock subscriptions:

1. Create a migration script to:
   - Create Stripe customers for existing users
   - Create Stripe subscriptions matching their current plan
   - Update database with Stripe IDs

2. Run script in staging first
3. Verify all data migrated correctly
4. Run in production during maintenance window

## Support and Resources

### Stripe Documentation
- [API Reference](https://stripe.com/docs/api)
- [Checkout Guide](https://stripe.com/docs/checkout)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)

### SPYMEO Resources
- Stripe configuration: `/src/lib/stripe/config.ts`
- Service layer: `/src/lib/services/stripe-service.ts`
- API routes: `/src/app/api/stripe/`
- Tests: `/tests/`

### Getting Help

For Stripe-specific issues:
- [Stripe Support](https://support.stripe.com/)
- [Stripe Discord](https://stripe.com/discord)

For SPYMEO integration issues:
- Check application logs
- Review webhook event logs in Stripe Dashboard
- Run test suite to identify failing components
- Check this documentation

## Changelog

### Version 1.0.0 (2025-01-XX)
- Initial Stripe integration
- Monthly and annual subscription plans
- Checkout and customer portal
- Webhook handling for all events
- Payment history tracking
- Comprehensive test suite
- Full documentation

---

**Last Updated:** 2025-01-06
**Integration Version:** 1.0.0
**Stripe API Version:** 2025-01-27.acacia
