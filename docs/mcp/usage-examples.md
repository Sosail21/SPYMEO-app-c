# MCP Usage Examples for SPYMEO

This document provides practical examples of using MCP servers for common SPYMEO development tasks.

## Table of Contents

1. [Database Operations](#database-operations)
2. [File Storage](#file-storage)
3. [Email Sending](#email-sending)
4. [Payment Processing](#payment-processing)
5. [Search Operations](#search-operations)
6. [Multi-Service Workflows](#multi-service-workflows)

## Database Operations

### Example 1: Schema Design with AI Assistance

**Ask Claude:**
```
I need to add a review system for practitioners. Users should be able to:
- Leave a rating (1-5 stars)
- Write a review text
- Include photos (optional)
- Reply to reviews (practitioners only)

Design the database schema and create the migration.
```

**Claude will:**
1. Read the current schema
2. Design Review and ReviewReply models
3. Create migration with proper relations
4. Generate Prisma Client
5. Suggest API endpoints

**Result:**
```prisma
model Review {
  id             String   @id @default(cuid())
  rating         Int      @db.SmallInt
  text           String   @db.Text
  photos         String[]
  userId         String
  practitionerId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user         User         @relation(fields: [userId], references: [id])
  practitioner Practitioner @relation(fields: [practitionerId], references: [id])
  replies      ReviewReply[]

  @@index([practitionerId])
  @@index([userId])
}

model ReviewReply {
  id        String   @id @default(cuid())
  text      String   @db.Text
  reviewId  String
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  review Review @relation(fields: [reviewId], references: [id])
  author User   @relation(fields: [authorId], references: [id])

  @@index([reviewId])
}
```

### Example 2: Query Optimization

**Ask Claude:**
```
This query is slow. Optimize it:

const practitioners = await prisma.practitioner.findMany({
  include: {
    user: true,
    reviews: true,
    appointments: true
  }
});
```

**Claude will:**
1. Analyze the query
2. Identify performance issues
3. Suggest optimizations
4. Add necessary indexes

**Optimized Result:**
```typescript
// Add pagination
const practitioners = await prisma.practitioner.findMany({
  select: {
    id: true,
    specialty: true,
    rating: true,
    user: {
      select: {
        name: true,
        avatar: true
      }
    },
    _count: {
      select: {
        reviews: true,
        appointments: true
      }
    }
  },
  take: 20,
  skip: page * 20,
  orderBy: {
    rating: 'desc'
  }
});

// Add indexes to schema
model Practitioner {
  @@index([rating])
  @@index([specialty])
  @@index([city])
}
```

### Example 3: Data Migration

**Ask Claude:**
```
I need to migrate existing user roles from strings to an enum.
Current values: 'user', 'practitioner', 'merchant', 'admin'
Target: UserRole enum
```

**Claude will create migration:**
```sql
-- Create enum
CREATE TYPE "UserRole" AS ENUM ('USER', 'PRACTITIONER', 'MERCHANT', 'ADMIN');

-- Migrate existing data
UPDATE "User" SET "role" =
  CASE
    WHEN "role" = 'user' THEN 'USER'::text
    WHEN "role" = 'practitioner' THEN 'PRACTITIONER'::text
    WHEN "role" = 'merchant' THEN 'MERCHANT'::text
    WHEN "role" = 'admin' THEN 'ADMIN'::text
    ELSE 'USER'::text
  END;

-- Change column type
ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "UserRole"
  USING "role"::"UserRole";
```

## File Storage

### Example 4: Profile Image Upload

**Ask Claude:**
```
Upload and optimize a practitioner profile image.
Generate multiple sizes for different use cases.
File: /path/to/profile.jpg
Practitioner ID: prac-123
```

**Claude will:**
```typescript
// Upload original with transformations
const result = await cloudinary.uploader.upload('/path/to/profile.jpg', {
  folder: 'spymeo/practitioners',
  public_id: 'practitioner-prac-123',
  transformation: [
    { width: 800, height: 800, crop: 'limit', quality: 'auto:best' }
  ]
});

// Generate URLs for different sizes
const urls = {
  full: result.secure_url,
  profile: cloudinary.url(result.public_id, {
    width: 400,
    height: 400,
    crop: 'fill',
    quality: 'auto:good',
    format: 'webp'
  }),
  thumbnail: cloudinary.url(result.public_id, {
    width: 150,
    height: 150,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  }),
  mobile: cloudinary.url(result.public_id, {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  })
};

// Update database
await prisma.practitioner.update({
  where: { id: 'prac-123' },
  data: {
    avatar: urls.profile,
    thumbnail: urls.thumbnail
  }
});
```

### Example 5: Batch Image Upload

**Ask Claude:**
```
Upload 10 product images for merchant 'merch-456'.
Optimize for web and generate thumbnails.
Files are in /uploads/products/
```

**Claude will:**
```typescript
const fs = require('fs');
const path = require('path');

const uploadDir = '/uploads/products/';
const files = fs.readdirSync(uploadDir);

const uploadPromises = files.map(async (file, index) => {
  const filePath = path.join(uploadDir, file);

  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'spymeo/products/merch-456',
    public_id: `product-${index + 1}`,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' }
    ],
    tags: ['product', 'merch-456']
  });

  return {
    full: result.secure_url,
    thumbnail: cloudinary.url(result.public_id, {
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      format: 'webp'
    })
  };
});

const uploadedImages = await Promise.all(uploadPromises);
console.log(`Uploaded ${uploadedImages.length} images`);
```

## Email Sending

### Example 6: Welcome Email

**Ask Claude:**
```
Send a welcome email to a new user.
Email: john.doe@example.com
Name: John Doe
Include activation link
```

**Claude will:**
```typescript
await resend.emails.send({
  from: 'SPYMEO <noreply@spymeo.com>',
  to: 'john.doe@example.com',
  subject: 'Bienvenue sur SPYMEO',
  html: `
    <h1>Bienvenue, John Doe !</h1>
    <p>Merci de vous être inscrit sur SPYMEO, la plateforme du bien-être.</p>
    <p>Pour activer votre compte, cliquez sur le lien ci-dessous :</p>
    <a href="https://spymeo.com/auth/verify?token=xxx">Activer mon compte</a>
    <p>À bientôt,<br>L'équipe SPYMEO</p>
  `,
  tags: [
    { name: 'category', value: 'authentication' },
    { name: 'type', value: 'welcome' }
  ]
});
```

### Example 7: Appointment Confirmation

**Ask Claude:**
```
Send appointment confirmation to user and practitioner.
Appointment ID: appt-789
Date: 2025-11-15 at 14:00
```

**Claude will:**
```typescript
// Get appointment details
const appointment = await prisma.appointment.findUnique({
  where: { id: 'appt-789' },
  include: {
    user: true,
    practitioner: {
      include: { user: true }
    }
  }
});

// Email to user
await resend.emails.send({
  from: 'SPYMEO <noreply@spymeo.com>',
  to: appointment.user.email,
  subject: 'Confirmation de rendez-vous',
  html: `
    <h2>Rendez-vous confirmé</h2>
    <p>Bonjour ${appointment.user.name},</p>
    <p>Votre rendez-vous avec ${appointment.practitioner.user.name} est confirmé :</p>
    <ul>
      <li><strong>Date :</strong> 15 novembre 2025</li>
      <li><strong>Heure :</strong> 14:00</li>
      <li><strong>Spécialité :</strong> ${appointment.practitioner.specialty}</li>
    </ul>
    <p><a href="https://spymeo.com/user/appointments/appt-789">Voir les détails</a></p>
    <p><a href="https://spymeo.com/user/appointments/appt-789/cancel">Annuler</a></p>
  `,
  tags: [{ name: 'type', value: 'appointment-confirmation' }]
});

// Email to practitioner
await resend.emails.send({
  from: 'SPYMEO <noreply@spymeo.com>',
  to: appointment.practitioner.user.email,
  subject: 'Nouveau rendez-vous réservé',
  html: `
    <h2>Nouveau rendez-vous</h2>
    <p>Bonjour ${appointment.practitioner.user.name},</p>
    <p>Un nouveau rendez-vous a été réservé :</p>
    <ul>
      <li><strong>Client :</strong> ${appointment.user.name}</li>
      <li><strong>Date :</strong> 15 novembre 2025</li>
      <li><strong>Heure :</strong> 14:00</li>
    </ul>
    <p><a href="https://spymeo.com/pro/praticien/agenda">Voir dans l'agenda</a></p>
  `,
  tags: [{ name: 'type', value: 'appointment-notification' }]
});
```

## Payment Processing

### Example 8: Create PASS Subscription

**Ask Claude:**
```
Create a Premium PASS subscription for user 'user-123'.
Monthly billing at 29.99 EUR.
```

**Claude will:**
```typescript
// Get or create Stripe customer
const user = await prisma.user.findUnique({
  where: { id: 'user-123' }
});

let customerId = user.stripeCustomerId;

if (!customerId) {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id }
  });

  customerId = customer.id;

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customerId }
  });
}

// Create subscription
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: process.env.STRIPE_PASS_PREMIUM_PRICE_ID }],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
  metadata: {
    userId: user.id,
    passType: 'premium'
  }
});

// Save to database
await prisma.passSubscription.create({
  data: {
    userId: user.id,
    stripeSubscriptionId: subscription.id,
    type: 'PREMIUM',
    status: 'PENDING',
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  }
});

// Return client secret for payment
const invoice = subscription.latest_invoice;
const paymentIntent = invoice.payment_intent;

return {
  subscriptionId: subscription.id,
  clientSecret: paymentIntent.client_secret
};
```

### Example 9: Process Refund

**Ask Claude:**
```
Refund payment for appointment 'appt-789'.
Reason: Practitioner cancelled.
```

**Claude will:**
```typescript
// Get appointment
const appointment = await prisma.appointment.findUnique({
  where: { id: 'appt-789' }
});

// Create refund
const refund = await stripe.refunds.create({
  payment_intent: appointment.stripePaymentIntentId,
  reason: 'requested_by_customer',
  metadata: {
    appointmentId: appointment.id,
    reason: 'Practitioner cancelled'
  }
});

// Update appointment status
await prisma.appointment.update({
  where: { id: 'appt-789' },
  data: {
    status: 'CANCELLED_REFUNDED',
    refundedAt: new Date(),
    stripeRefundId: refund.id
  }
});

// Send notification email
await resend.emails.send({
  from: 'SPYMEO <noreply@spymeo.com>',
  to: appointment.user.email,
  subject: 'Remboursement effectué',
  html: `
    <p>Votre rendez-vous a été annulé et remboursé.</p>
    <p>Montant remboursé : ${appointment.price} EUR</p>
    <p>Le remboursement sera visible sur votre compte sous 5-10 jours.</p>
  `
});
```

## Search Operations

### Example 10: Configure Search Index

**Ask Claude:**
```
Configure the practitioners search index with optimal settings.
Enable faceted search on specialty, city, and rating.
```

**Claude will:**
```typescript
const index = algolia.initIndex('spymeo_practitioners');

await index.setSettings({
  searchableAttributes: [
    'name',
    'specialty',
    'bio',
    'city'
  ],
  attributesForFaceting: [
    'specialty',
    'city',
    'filterOnly(acceptsPass)',
    'searchable(region)',
    'rating'
  ],
  customRanking: [
    'desc(rating)',
    'desc(reviewCount)',
    'desc(appointmentCount)'
  ],
  ranking: [
    'typo',
    'geo',
    'words',
    'filters',
    'proximity',
    'attribute',
    'exact',
    'custom'
  ],
  replicas: [
    'spymeo_practitioners_rating_desc',
    'spymeo_practitioners_price_asc'
  ]
});

console.log('Index configured successfully');
```

### Example 11: Sync Database to Algolia

**Ask Claude:**
```
Sync all approved practitioners from database to Algolia search index.
```

**Claude will:**
```typescript
// Get all approved practitioners
const practitioners = await prisma.practitioner.findMany({
  where: { status: 'APPROVED' },
  include: {
    user: true,
    _count: {
      select: {
        reviews: true,
        appointments: true
      }
    }
  }
});

// Prepare records for Algolia
const records = practitioners.map(p => ({
  objectID: p.id,
  name: p.user.name,
  specialty: p.specialty,
  bio: p.bio,
  city: p.city,
  region: p.region,
  avatar: p.avatar,
  acceptsPass: p.acceptsPass,
  rating: p.rating,
  reviewCount: p._count.reviews,
  appointmentCount: p._count.appointments,
  status: p.status
}));

// Batch upload to Algolia
const index = algolia.initIndex('spymeo_practitioners');
const result = await index.saveObjects(records);

console.log(`Synced ${records.length} practitioners to Algolia`);
console.log(`Object IDs: ${result.objectIDs.join(', ')}`);
```

## Multi-Service Workflows

### Example 12: Complete User Onboarding

**Ask Claude:**
```
Create a complete practitioner onboarding flow:
1. Create practitioner in database
2. Upload and optimize profile picture
3. Index in search
4. Send welcome email
```

**Claude will orchestrate:**
```typescript
async function onboardPractitioner(data) {
  // 1. Upload profile picture
  const imageResult = await cloudinary.uploader.upload(data.profileImage, {
    folder: 'spymeo/practitioners',
    public_id: `practitioner-${data.userId}`,
    transformation: [
      { width: 400, height: 400, crop: 'fill', quality: 'auto:good' }
    ]
  });

  const thumbnailUrl = cloudinary.url(imageResult.public_id, {
    width: 150,
    height: 150,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  });

  // 2. Create in database
  const practitioner = await prisma.practitioner.create({
    data: {
      userId: data.userId,
      specialty: data.specialty,
      bio: data.bio,
      city: data.city,
      avatar: imageResult.secure_url,
      thumbnail: thumbnailUrl,
      status: 'PENDING_APPROVAL'
    },
    include: {
      user: true
    }
  });

  // 3. Index in Algolia (will be approved later)
  const searchIndex = algolia.initIndex('spymeo_practitioners');
  await searchIndex.saveObject({
    objectID: practitioner.id,
    name: practitioner.user.name,
    specialty: practitioner.specialty,
    bio: practitioner.bio,
    city: practitioner.city,
    avatar: practitioner.avatar,
    status: 'PENDING_APPROVAL' // Not visible in search yet
  });

  // 4. Send welcome email
  await resend.emails.send({
    from: 'SPYMEO <noreply@spymeo.com>',
    to: practitioner.user.email,
    subject: 'Bienvenue sur SPYMEO Pro',
    html: `
      <h1>Bienvenue, ${practitioner.user.name} !</h1>
      <p>Votre profil est en cours de validation.</p>
      <p>Vous recevrez un email dès qu'il sera approuvé.</p>
      <a href="https://spymeo.com/pro/dashboard">Accéder au tableau de bord</a>
    `
  });

  return {
    success: true,
    practitionerId: practitioner.id,
    status: 'PENDING_APPROVAL'
  };
}
```

### Example 13: Appointment Booking with Payment

**Ask Claude:**
```
Complete appointment booking workflow:
1. Create payment intent
2. Create appointment
3. Send confirmations
4. Add to calendar
```

**Full implementation in [Integration Guide](./integration-guide.md#pattern-5-full-stack-feature-appointment-booking)**

## Tips for Using MCP with Claude

### Be Specific

❌ Bad: "Fix the database"
✅ Good: "Add email verification fields to User model and create a migration"

### Provide Context

❌ Bad: "Upload this image"
✅ Good: "Upload profile.jpg as a practitioner profile picture for practitioner-123, optimize for web"

### Ask for Explanations

✅ "Explain the migration you just created"
✅ "What indexes should I add for this query?"
✅ "Why did you choose this transformation?"

### Request Best Practices

✅ "What's the best way to handle failed payments?"
✅ "How should I structure this database relationship?"
✅ "What's the optimal image size for practitioner profiles?"

## Next Steps

- Review [Main MCP Documentation](./README.md)
- Explore [Database Operations Guide](./database-operations.md)
- Study [Integration Patterns](./integration-guide.md)
- Try MCP with your own development tasks

## Resources

- [MCP Official Docs](https://modelcontextprotocol.io)
- [Prisma MCP Server](https://www.prisma.io/docs/postgres/integrations/mcp-server)
- [Stripe MCP Server](https://docs.stripe.com/mcp)
- [Claude Code CLI](https://claude.ai/code)
