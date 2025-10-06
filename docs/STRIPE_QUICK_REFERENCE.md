# Stripe Integration Quick Reference Card

## Essential Commands

```bash
# Setup
npm run setup-stripe-products        # Create Stripe products
npx prisma migrate dev               # Run database migration

# Development
npm run dev                          # Start dev server
stripe listen --forward-to localhost:3000/api/stripe/webhooks  # Forward webhooks

# Testing
npm test                             # Run all tests
npm run test:unit                    # Unit tests only
npm run test:integration             # Integration tests only
stripe trigger checkout.session.completed  # Test webhook
```

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_PASS_MONTHLY=prod_...
STRIPE_PRODUCT_PASS_ANNUAL=prod_...
STRIPE_PRICE_PASS_MONTHLY=price_...
STRIPE_PRICE_PASS_ANNUAL=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/stripe/create-checkout` | Start subscription |
| POST | `/api/stripe/create-portal` | Manage subscription |
| POST | `/api/stripe/webhooks` | Receive events |
| GET | `/api/user/pass` | Get subscription |
| POST | `/api/user/pass/toggle-plan` | Change plan |

## Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0025 0000 3155 | Requires auth |
| 4000 0000 0000 9995 | Declined |

## Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| Monthly | €19.90/mo | Carnet after 6 months |
| Annual | €199/yr | Carnet immediate, save €40.80 |

## Webhook Events

```typescript
checkout.session.completed    // → Create subscription
customer.subscription.created // → Link to database
customer.subscription.updated // → Sync changes
customer.subscription.deleted // → Deactivate
invoice.paid                  // → Record payment
invoice.payment_failed        // → Handle failure
```

## Key Files

```
src/lib/stripe/
  ├── client.ts              # Stripe client
  ├── config.ts              # Configuration
  └── client-helpers.ts      # Client utils

src/lib/services/
  └── stripe-service.ts      # Business logic

src/app/api/stripe/
  ├── create-checkout/route.ts
  ├── create-portal/route.ts
  └── webhooks/route.ts

docs/
  ├── stripe-integration.md        # Full docs
  ├── STRIPE_SETUP_QUICKSTART.md  # Quick start
  └── STRIPE_MIGRATION_GUIDE.md   # Migration
```

## Common Tasks

### Create Checkout Session
```typescript
import { redirectToCheckout } from "@/lib/stripe/client-helpers";

await redirectToCheckout({
  plan: "ANNUAL",
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
});
```

### Open Customer Portal
```typescript
import { redirectToPortal } from "@/lib/stripe/client-helpers";

await redirectToPortal({
  stripeCustomerId: user.stripeCustomerId,
});
```

### Get Subscription
```typescript
import { getSubscription } from "@/lib/services/stripe-service";

const subscription = await getSubscription(subscriptionId);
```

### Cancel Subscription
```typescript
import { cancelSubscription } from "@/lib/services/stripe-service";

await cancelSubscription(subscriptionId);
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Invalid API Key | Check `.env` file has correct keys |
| Webhooks not firing | Ensure `stripe listen` is running |
| Subscription not created | Check webhook logs in terminal |
| Payment declined | Use test card 4242... |

## Quick Checks

```bash
# Verify Stripe keys
echo $STRIPE_SECRET_KEY | cut -c1-7    # Should be: sk_test

# Check webhook secret
echo $STRIPE_WEBHOOK_SECRET | cut -c1-5  # Should be: whsec

# Test API connection
stripe customers list --limit 1

# View recent events
stripe events list --limit 5

# Test webhook endpoint
curl -X POST http://localhost:3000/api/stripe/webhooks \
  -H "Content-Type: application/json"
```

## Database Queries

```sql
-- Active subscriptions
SELECT COUNT(*) FROM "PassSubscription" WHERE active = true;

-- Stripe-linked users
SELECT COUNT(*) FROM "User" WHERE "stripeCustomerId" IS NOT NULL;

-- Recent payments
SELECT * FROM "Payment" ORDER BY "createdAt" DESC LIMIT 10;

-- Failed payments
SELECT * FROM "Payment" WHERE status = 'FAILED';
```

## Monitoring

```bash
# Watch webhook events
stripe listen

# Watch logs with filters
stripe events list --type checkout.session.completed

# Check webhook deliveries
stripe webhook-endpoints list
```

## Production Checklist

- [ ] Live API keys configured
- [ ] Products created in live mode
- [ ] Production webhook endpoint set
- [ ] HTTPS enabled
- [ ] Database backed up
- [ ] Tests passing
- [ ] Error monitoring active

## Resources

- **Stripe Dashboard**: https://dashboard.stripe.com
- **API Docs**: https://stripe.com/docs/api
- **Test Cards**: https://stripe.com/docs/testing
- **CLI Docs**: https://stripe.com/docs/stripe-cli

## Support

- Full docs: `/docs/stripe-integration.md`
- Quick start: `/docs/STRIPE_SETUP_QUICKSTART.md`
- Migration: `/docs/STRIPE_MIGRATION_GUIDE.md`
- Summary: `/STRIPE_INTEGRATION_SUMMARY.md`

---

Print this card or keep it handy for quick reference!
