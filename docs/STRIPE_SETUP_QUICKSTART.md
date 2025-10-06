# Stripe Integration Quick Start Guide

Get your Stripe integration up and running in 10 minutes.

## Prerequisites

- Node.js installed
- Stripe account created
- PostgreSQL database running

## Setup Steps

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install stripe @stripe/stripe-js
```

### 2. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API keys**
3. Copy your **Secret key** (starts with `sk_test_`)
4. Copy your **Publishable key** (starts with `pk_test_`)

### 3. Add Environment Variables

Copy the example file:
```bash
cp .env.stripe.example .env
```

Or add these to your existing `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create Stripe Products

Run the setup script:
```bash
npx ts-node scripts/setup-stripe-products.ts
```

This will create:
- **Monthly PASS**: €19.90/month
- **Annual PASS**: €199/year

Copy the output and add to your `.env`:
```env
STRIPE_PRODUCT_PASS_MONTHLY=prod_...
STRIPE_PRODUCT_PASS_ANNUAL=prod_...
STRIPE_PRICE_PASS_MONTHLY=price_...
STRIPE_PRICE_PASS_ANNUAL=price_...
```

### 5. Set Up Webhooks

#### For Local Development:

Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Scoop)
scoop install stripe

# Or download from https://github.com/stripe/stripe-cli/releases
```

Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

Copy the webhook signing secret and add to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Leave this terminal running while developing.

### 6. Update Database

Run Prisma migration:
```bash
npx prisma migrate dev --name add-stripe-integration
```

### 7. Start Your Application

```bash
npm run dev
```

## Testing the Integration

### Test Checkout Flow

1. Navigate to your PASS subscription page
2. Click "Subscribe" button
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify subscription created in database

### Test Webhooks

In your Stripe CLI terminal, you should see:
```
✔ Received event: checkout.session.completed
✔ Received event: customer.subscription.created
✔ Received event: invoice.paid
```

### Test Customer Portal

1. As a subscribed user, click "Manage Subscription"
2. You'll be redirected to Stripe Customer Portal
3. Try canceling subscription
4. Verify webhook updates database

## Quick Reference

### Test Cards

| Scenario | Card Number |
|----------|-------------|
| Success | 4242 4242 4242 4242 |
| Requires auth | 4000 0025 0000 3155 |
| Declined | 4000 0000 0000 9995 |

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/stripe/create-checkout` | Create checkout session |
| `/api/stripe/create-portal` | Open customer portal |
| `/api/stripe/webhooks` | Receive Stripe events |
| `/api/user/pass` | Get subscription status |
| `/api/user/pass/toggle-plan` | Change subscription plan |

### Useful Commands

```bash
# View webhook events
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Trigger test event
stripe trigger checkout.session.completed

# View logs
stripe logs tail

# Run tests
npm run test:unit
npm run test:integration
```

## Troubleshooting

### "Invalid API Key" Error
- Verify keys in `.env` match Stripe Dashboard
- Ensure using test keys (start with `sk_test_` and `pk_test_`)
- Restart your dev server after changing `.env`

### Webhooks Not Working
- Ensure Stripe CLI is running
- Check webhook secret matches output from `stripe listen`
- Verify endpoint URL is correct
- Check for errors in server console

### Subscription Not Created
- Check webhook logs in Stripe CLI
- Verify database connection
- Look for errors in application logs
- Ensure Prisma migration ran successfully

## Next Steps

- Read full documentation: [`docs/stripe-integration.md`](./stripe-integration.md)
- Review example components: `src/components/stripe/`
- Run test suite: `npm run test`
- Set up monitoring and alerts
- Configure production webhooks
- Test error scenarios

## Production Checklist

Before going live:

- [ ] Use live API keys (replace `test` with `live`)
- [ ] Create products in live mode
- [ ] Set up production webhook endpoint in Stripe Dashboard
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Enable HTTPS
- [ ] Test complete checkout flow in live mode
- [ ] Set up monitoring and error tracking
- [ ] Configure email notifications
- [ ] Review security settings
- [ ] Test payment failure scenarios

## Support

- **Full Documentation**: `docs/stripe-integration.md`
- **Stripe Docs**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Test Cards**: https://stripe.com/docs/testing

---

Happy coding! 🚀
