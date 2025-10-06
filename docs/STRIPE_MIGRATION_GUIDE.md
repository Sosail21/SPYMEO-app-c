# Stripe Migration Guide

Guide for migrating from mock subscriptions to real Stripe subscriptions.

## Overview

If you have existing users with mock PASS subscriptions (cookie-based or database-only), this guide will help you migrate them to real Stripe subscriptions.

## Pre-Migration Checklist

- [ ] Stripe integration is fully set up and tested
- [ ] All environment variables are configured
- [ ] Database migrations have been run
- [ ] Webhooks are configured and working
- [ ] You have a database backup
- [ ] You've tested the migration script in a staging environment

## Migration Strategy

### Option 1: Manual Migration (Recommended for Small User Base)

For fewer than 100 users, manual migration via Stripe Dashboard is safest.

#### Steps:

1. **Export existing subscriptions**
   ```sql
   SELECT
     u.id as user_id,
     u.email,
     u.name,
     ps.plan,
     ps.active,
     ps.startedAt,
     ps.monthsPaid
   FROM "User" u
   INNER JOIN "PassSubscription" ps ON u.id = ps.userId
   WHERE ps.active = true;
   ```

2. **For each user:**
   - Create customer in Stripe Dashboard
   - Create subscription with correct plan
   - Note the customer ID and subscription ID
   - Update database with Stripe IDs

3. **Update database**
   ```sql
   UPDATE "User"
   SET "stripeCustomerId" = 'cus_xxx'
   WHERE id = 'user_xxx';

   UPDATE "PassSubscription"
   SET
     "stripeSubscriptionId" = 'sub_xxx',
     "stripePriceId" = 'price_xxx'
   WHERE "userId" = 'user_xxx';
   ```

### Option 2: Automated Migration (For Larger User Base)

Use the migration script for bulk migration.

#### Create Migration Script

```typescript
// scripts/migrate-to-stripe.ts

import { PrismaClient } from "@prisma/client";
import { stripe } from "../src/lib/stripe/client";
import { getPriceIdFromPlan } from "../src/lib/stripe/config";

const prisma = new PrismaClient();

async function migrateUser(userId: string) {
  console.log(`Migrating user: ${userId}`);

  // Get user and subscription
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { passSubscription: true },
  });

  if (!user || !user.passSubscription) {
    console.log(`User ${userId} has no subscription, skipping`);
    return;
  }

  const subscription = user.passSubscription;

  // Skip if already migrated
  if (user.stripeCustomerId && subscription.stripeSubscriptionId) {
    console.log(`User ${userId} already migrated, skipping`);
    return;
  }

  try {
    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
          migrated: "true",
          migratedAt: new Date().toISOString(),
        },
      });
      customerId = customer.id;
      console.log(`Created Stripe customer: ${customerId}`);
    }

    // Create subscription in Stripe
    const priceId = getPriceIdFromPlan(subscription.plan);
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        userId: user.id,
        plan: subscription.plan,
        migrated: "true",
        originalStartDate: subscription.startedAt.toISOString(),
      },
      // Backdate to original start date
      backdate_start_date: Math.floor(
        subscription.startedAt.getTime() / 1000
      ),
    });

    console.log(`Created Stripe subscription: ${stripeSubscription.id}`);

    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });

    await prisma.passSubscription.update({
      where: { userId },
      data: {
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(
          stripeSubscription.current_period_end * 1000
        ),
      },
    });

    console.log(`✅ Successfully migrated user ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to migrate user ${userId}:`, error);
    throw error;
  }
}

async function migrateAll() {
  console.log("Starting migration...\n");

  // Get all active subscriptions
  const subscriptions = await prisma.passSubscription.findMany({
    where: {
      active: true,
      stripeSubscriptionId: null, // Not yet migrated
    },
    include: { user: true },
  });

  console.log(`Found ${subscriptions.length} users to migrate\n`);

  let successCount = 0;
  let failCount = 0;

  for (const subscription of subscriptions) {
    try {
      await migrateUser(subscription.userId);
      successCount++;
    } catch (error) {
      failCount++;
      console.error(`Failed to migrate ${subscription.userId}`);
    }

    // Add delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n=== Migration Summary ===");
  console.log(`Total: ${subscriptions.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

// Run migration
migrateAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

#### Run Migration

```bash
# Test with one user first
npm run migrate:stripe -- --user-id=user_123

# Then run full migration
npm run migrate:stripe
```

## Post-Migration Tasks

### 1. Verify Migrations

```sql
-- Check how many users were migrated
SELECT
  COUNT(*) as total_active_subscriptions,
  SUM(CASE WHEN "stripeSubscriptionId" IS NOT NULL THEN 1 ELSE 0 END) as migrated_count
FROM "PassSubscription"
WHERE active = true;
```

### 2. Test User Access

- Log in as a migrated user
- Verify PASS features are accessible
- Check subscription details display correctly
- Test "Manage Subscription" button

### 3. Monitor Webhooks

- Watch for any webhook errors
- Verify subscription renewals work
- Check payment processing

### 4. Update User Communication

Send email to migrated users:

```
Subject: Your SPYMEO PASS is now powered by Stripe

Bonjour [Name],

Bonne nouvelle ! Votre abonnement PASS SPYMEO est maintenant géré
par Stripe, notre nouveau partenaire de paiement sécurisé.

Qu'est-ce qui change ?
- Paiements plus sécurisés
- Gestion simplifiée de votre abonnement
- Reçus automatiques par email

Votre abonnement actuel reste inchangé :
- Plan: [Monthly/Annual]
- Prochain paiement: [Date]
- Montant: [Amount]

Gérer mon abonnement: [Link to Customer Portal]

Merci de votre confiance,
L'équipe SPYMEO
```

## Handling Edge Cases

### Users with Trial Periods

```typescript
// Add trial end date when creating subscription
const stripeSubscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_end: Math.floor(trialEndDate.getTime() / 1000),
  // ... other options
});
```

### Users with Custom Pricing

```typescript
// Create custom price for user
const customPrice = await stripe.prices.create({
  unit_amount: Math.round(customAmount * 100),
  currency: "eur",
  recurring: { interval: "month" },
  product: productId,
});

// Use custom price in subscription
const stripeSubscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: customPrice.id }],
  // ... other options
});
```

### Users with Cancelled Subscriptions

Don't migrate canceled subscriptions automatically. Let users re-subscribe through normal flow.

```typescript
// Skip canceled subscriptions
if (!subscription.active) {
  console.log(`Subscription for ${userId} is inactive, skipping`);
  return;
}
```

## Rollback Plan

If migration fails, you can rollback:

### 1. Restore Database Backup

```bash
psql spymeo < backup_before_migration.sql
```

### 2. Cancel Stripe Subscriptions

```typescript
// Cancel all migrated subscriptions
const subscriptions = await stripe.subscriptions.list({
  limit: 100,
  metadata: { migrated: "true" },
});

for (const sub of subscriptions.data) {
  await stripe.subscriptions.cancel(sub.id);
}
```

### 3. Remove Stripe IDs from Database

```sql
UPDATE "User" SET "stripeCustomerId" = NULL;
UPDATE "PassSubscription"
SET
  "stripeSubscriptionId" = NULL,
  "stripePriceId" = NULL,
  "stripeCurrentPeriodEnd" = NULL;
```

## Testing Migrated Subscriptions

### Test Checklist

For each migrated subscription type (monthly/annual):

- [ ] User can access PASS features
- [ ] Subscription details display correctly
- [ ] "Manage Subscription" opens portal
- [ ] User can update payment method
- [ ] User can cancel subscription
- [ ] Webhooks update database correctly
- [ ] Next billing date is correct
- [ ] Payment history is tracked

### Test Script

```bash
# Test monthly subscription
curl -X GET http://localhost:3000/api/user/pass \
  -H "x-user-id: user_monthly_test"

# Test annual subscription
curl -X GET http://localhost:3000/api/user/pass \
  -H "x-user-id: user_annual_test"

# Test plan change
curl -X POST http://localhost:3000/api/user/pass/toggle-plan \
  -H "x-user-id: user_monthly_test" \
  -H "Content-Type: application/json" \
  -d '{"plan": "ANNUAL"}'
```

## Monitoring After Migration

### Key Metrics to Track

1. **Subscription Health**
   - Active subscriptions count
   - Churn rate
   - Failed payments rate

2. **Revenue Metrics**
   - Monthly recurring revenue (MRR)
   - Annual recurring revenue (ARR)
   - Average revenue per user (ARPU)

3. **Technical Metrics**
   - Webhook success rate
   - API error rate
   - Database sync accuracy

### Set Up Alerts

Create alerts for:
- Failed webhook events
- Failed payments
- Subscription cancellations
- API errors

## Timeline Recommendation

### Week 1: Preparation
- Set up Stripe integration
- Test in staging environment
- Prepare migration scripts
- Create user communication

### Week 2: Pilot Migration
- Migrate 5-10 test users
- Monitor for issues
- Gather feedback
- Adjust scripts if needed

### Week 3: Batch Migration
- Migrate 10-20% of users
- Monitor closely
- Address any issues

### Week 4: Full Migration
- Migrate remaining users
- Monitor all metrics
- Send user communications

### Week 5: Post-Migration
- Remove old subscription code
- Update documentation
- Celebrate success! 🎉

## Common Issues and Solutions

### Issue: Webhook Events Not Processing

**Solution:**
- Verify webhook secret is correct
- Check endpoint is accessible
- Review webhook event logs in Stripe Dashboard

### Issue: Subscription Dates Don't Match

**Solution:**
- Use `backdate_start_date` in subscription creation
- Adjust billing cycle anchor if needed

### Issue: Payment Method Required

**Solution:**
- Create subscription with `collection_method: "send_invoice"`
- Send invoice to user for payment method addition
- Or require users to add payment method via portal

### Issue: Duplicate Subscriptions

**Solution:**
- Add checks in migration script to skip already-migrated users
- Clean up duplicates in Stripe Dashboard
- Update database to point to correct subscription

## Support During Migration

- Monitor Stripe Dashboard continuously
- Keep support team informed
- Have rollback plan ready
- Document all issues encountered

## Post-Migration Cleanup

After successful migration (2-4 weeks):

1. **Remove Mock Code**
   - Delete cookie-based subscription logic
   - Remove mock data files
   - Clean up old API routes

2. **Update Documentation**
   - Mark migration as complete
   - Archive old subscription docs
   - Update user guides

3. **Archive Data**
   - Export pre-migration data
   - Store securely for compliance
   - Document retention policy

## Resources

- [Stripe Migration Best Practices](https://stripe.com/docs/billing/migration)
- [Backdating Subscriptions](https://stripe.com/docs/billing/subscriptions/backdating)
- [Testing Subscriptions](https://stripe.com/docs/billing/subscriptions/testing)

---

**Last Updated:** 2025-01-06
**Version:** 1.0.0

For questions or issues during migration, refer to the main integration documentation or contact Stripe support.
