# MCP Integration Guide

This guide demonstrates how to integrate multiple MCP servers to build features in the SPYMEO platform.

## Overview

The power of MCP comes from combining multiple servers to accomplish complex tasks. This guide shows real-world integration patterns for SPYMEO development.

## Integration Patterns

### Pattern 1: Database + Email (User Registration)

**Scenario**: Create a complete user registration flow

```
Developer: "Create a user registration flow with email verification"

Claude Integration:
1. [Prisma MCP] Design User model with email verification fields
2. [Prisma MCP] Create migration
3. [Prisma MCP] Generate API query for user creation
4. [Resend MCP] Set up welcome email template
5. [Resend MCP] Configure verification email
6. Generate TypeScript API route
7. Add error handling and validation

Result: Complete registration system with database + email
```

**Generated Code**:

```typescript
// src/app/api/auth/register/route.ts
import { prisma } from '@/lib/db';
import { resend } from '@/lib/email';
import { hash } from 'bcrypt';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  // 1. Check if user exists (Prisma)
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return Response.json(
      { error: 'User already exists' },
      { status: 400 }
    );
  }

  // 2. Generate verification token
  const verificationToken = randomBytes(32).toString('hex');
  const hashedPassword = await hash(password, 10);

  // 3. Create user in database (Prisma)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      emailVerified: false,
      verificationToken,
      role: 'USER'
    }
  });

  // 4. Send verification email (Resend)
  const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/auth/verify?token=${verificationToken}`;

  await resend.emails.send({
    from: 'noreply@spymeo.com',
    to: email,
    subject: 'Vérifiez votre compte SPYMEO',
    template: 'welcome',
    templateData: {
      userName: name,
      activationLink: verificationUrl
    }
  });

  return Response.json({
    message: 'User created. Please check your email.',
    userId: user.id
  });
}
```

### Pattern 2: Database + Storage + Search (Practitioner Onboarding)

**Scenario**: Complete practitioner profile creation

```
Developer: "Create practitioner onboarding with profile picture and search indexing"

Claude Integration:
1. [Prisma MCP] Read Practitioner model schema
2. [Cloudinary MCP] Upload profile picture
3. [Cloudinary MCP] Generate thumbnail and optimized versions
4. [Prisma MCP] Create practitioner record with image URLs
5. [Algolia MCP] Index practitioner for search
6. [Resend MCP] Send approval notification
7. Generate complete API route

Result: Full onboarding with image handling and search integration
```

**Generated Code**:

```typescript
// src/app/api/practitioners/onboard/route.ts
import { prisma } from '@/lib/db';
import { cloudinary } from '@/lib/storage';
import { algolia } from '@/lib/search';
import { resend } from '@/lib/email';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const specialty = formData.get('specialty') as string;
  const bio = formData.get('bio') as string;
  const city = formData.get('city') as string;
  const profileImage = formData.get('profileImage') as File;

  try {
    // 1. Upload profile image to Cloudinary
    const imageBuffer = Buffer.from(await profileImage.arrayBuffer());
    const uploadResult = await cloudinary.uploader.upload(
      `data:${profileImage.type};base64,${imageBuffer.toString('base64')}`,
      {
        folder: 'spymeo/practitioners',
        public_id: `practitioner-${session.userId}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', quality: 'auto:good' }
        ]
      }
    );

    // 2. Generate thumbnail
    const thumbnailUrl = cloudinary.url(uploadResult.public_id, {
      width: 150,
      height: 150,
      crop: 'fill',
      quality: 'auto',
      format: 'webp'
    });

    // 3. Create practitioner in database (Prisma)
    const practitioner = await prisma.practitioner.create({
      data: {
        userId: session.userId,
        specialty,
        bio,
        city,
        avatar: uploadResult.secure_url,
        thumbnail: thumbnailUrl,
        status: 'PENDING_APPROVAL',
        acceptsPass: false,
        rating: 0
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // 4. Index in Algolia for search
    const searchIndex = algolia.initIndex('spymeo_practitioners');
    await searchIndex.saveObject({
      objectID: practitioner.id,
      name: practitioner.user.name,
      specialty: practitioner.specialty,
      bio: practitioner.bio,
      city: practitioner.city,
      avatar: practitioner.avatar,
      acceptsPass: practitioner.acceptsPass,
      rating: practitioner.rating,
      reviewCount: 0,
      status: practitioner.status
    });

    // 5. Send notification email (Resend)
    await resend.emails.send({
      from: 'noreply@spymeo.com',
      to: practitioner.user.email,
      subject: 'Votre profil est en cours de validation',
      template: 'practitioner-pending',
      templateData: {
        practitionerName: practitioner.user.name,
        dashboardLink: `${process.env.NEXT_PUBLIC_URL}/pro/dashboard`
      }
    });

    return Response.json({
      success: true,
      practitioner: {
        id: practitioner.id,
        status: practitioner.status
      }
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return Response.json(
      { error: 'Onboarding failed' },
      { status: 500 }
    );
  }
}
```

### Pattern 3: Database + Payment + Email (Subscription Management)

**Scenario**: Create PASS subscription with payment and confirmation

```
Developer: "Create a PASS subscription flow with Stripe payment"

Claude Integration:
1. [Stripe MCP] Get or create Stripe customer
2. [Stripe MCP] Create subscription with price ID
3. [Prisma MCP] Update user's PASS status
4. [Prisma MCP] Create subscription record
5. [Resend MCP] Send subscription confirmation email
6. Generate webhook handler for payment events

Result: Complete subscription system
```

**Generated Code**:

```typescript
// src/app/api/user/pass/subscribe/route.ts
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/payment';
import { resend } from '@/lib/email';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { passType } = await req.json(); // 'premium' or 'pro'

  try {
    // 1. Get user with current subscription
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { passSubscription: true }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id
        }
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id }
      });
    }

    // 3. Determine price ID based on PASS type
    const priceId = passType === 'premium'
      ? process.env.STRIPE_PASS_PREMIUM_PRICE_ID
      : process.env.STRIPE_PASS_PRO_PRICE_ID;

    // 4. Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user.id,
        passType
      }
    });

    // 5. Create or update subscription in database
    await prisma.passSubscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        stripeSubscriptionId: stripeSubscription.id,
        type: passType.toUpperCase(),
        status: 'PENDING',
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
      },
      update: {
        stripeSubscriptionId: stripeSubscription.id,
        type: passType.toUpperCase(),
        status: 'PENDING',
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
      }
    });

    // 6. Get client secret for payment
    const invoice = stripeSubscription.latest_invoice as any;
    const paymentIntent = invoice.payment_intent;

    // 7. Send confirmation email (will be sent after successful payment via webhook)
    // This is just a pending notification
    await resend.emails.send({
      from: 'noreply@spymeo.com',
      to: user.email,
      subject: 'Confirmation de votre abonnement PASS',
      template: 'pass-pending',
      templateData: {
        userName: user.name,
        passType: passType === 'premium' ? 'Premium' : 'Pro'
      }
    });

    return Response.json({
      subscriptionId: stripeSubscription.id,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return Response.json(
      { error: 'Subscription creation failed' },
      { status: 500 }
    );
  }
}

// Webhook handler
// src/app/api/webhooks/stripe/route.ts
import { prisma } from '@/lib/db';
import { resend } from '@/lib/email';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return Response.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle subscription events
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;

      await prisma.passSubscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status === 'active' ? 'ACTIVE' : 'PENDING',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });

      // Send activation email if now active
      if (subscription.status === 'active') {
        const passSubscription = await prisma.passSubscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
          include: { user: true }
        });

        if (passSubscription) {
          await resend.emails.send({
            from: 'noreply@spymeo.com',
            to: passSubscription.user.email,
            subject: 'Votre PASS est activé !',
            template: 'pass-activation',
            templateData: {
              userName: passSubscription.user.name,
              passType: passSubscription.type,
              benefits: getBenefits(passSubscription.type),
              expiryDate: passSubscription.currentPeriodEnd.toLocaleDateString('fr-FR')
            }
          });
        }
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;

      await prisma.passSubscription.update({
        where: { stripeSubscriptionId: deletedSubscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });
      break;
  }

  return Response.json({ received: true });
}

function getBenefits(passType: string): string[] {
  const benefits = {
    PREMIUM: [
      'Réductions chez tous les partenaires',
      'Accès prioritaire aux événements',
      'Support client dédié'
    ],
    PRO: [
      'Tous les avantages Premium',
      'Formations exclusives',
      'Outils professionnels avancés',
      'Networking avec d\'autres professionnels'
    ]
  };
  return benefits[passType as keyof typeof benefits] || [];
}
```

### Pattern 4: Search + Database (Advanced Search)

**Scenario**: Implement faceted search with database sync

```
Developer: "Create a practitioner search with filters and facets"

Claude Integration:
1. [Algolia MCP] Configure search index with facets
2. [Algolia MCP] Set up searchable attributes
3. [Prisma MCP] Query practitioners from database
4. [Algolia MCP] Sync records to search index
5. Generate search API with faceted filtering
6. Add real-time sync on data updates

Result: Full-featured search with facets
```

**Generated Code**:

```typescript
// src/app/api/search/practitioners/route.ts
import { algolia } from '@/lib/search';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const city = searchParams.get('city');
  const specialty = searchParams.get('specialty');
  const acceptsPass = searchParams.get('acceptsPass');
  const minRating = searchParams.get('minRating');
  const page = parseInt(searchParams.get('page') || '0');

  try {
    const index = algolia.initIndex('spymeo_practitioners');

    // Build filters
    const filters: string[] = [];

    if (city) filters.push(`city:"${city}"`);
    if (specialty) filters.push(`specialty:"${specialty}"`);
    if (acceptsPass === 'true') filters.push('acceptsPass:true');
    if (minRating) filters.push(`rating >= ${minRating}`);
    filters.push('status:APPROVED'); // Only show approved practitioners

    const filterString = filters.join(' AND ');

    // Search with facets
    const results = await index.search(query, {
      filters: filterString,
      facets: ['city', 'specialty', 'acceptsPass', 'rating'],
      hitsPerPage: 20,
      page,
      attributesToRetrieve: [
        'objectID',
        'name',
        'specialty',
        'bio',
        'city',
        'avatar',
        'rating',
        'reviewCount',
        'acceptsPass'
      ],
      getRankingInfo: true
    });

    return Response.json({
      practitioners: results.hits,
      facets: results.facets,
      total: results.nbHits,
      page: results.page,
      totalPages: results.nbPages
    });

  } catch (error) {
    console.error('Search error:', error);
    return Response.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// Sync function (called when practitioner is updated)
// src/lib/search/sync.ts
import { prisma } from '@/lib/db';
import { algolia } from '@/lib/search';

export async function syncPractitionerToSearch(practitionerId: string) {
  const practitioner = await prisma.practitioner.findUnique({
    where: { id: practitionerId },
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

  if (!practitioner) return;

  const index = algolia.initIndex('spymeo_practitioners');

  // Only index approved practitioners
  if (practitioner.status === 'APPROVED') {
    await index.saveObject({
      objectID: practitioner.id,
      name: practitioner.user.name,
      specialty: practitioner.specialty,
      bio: practitioner.bio,
      city: practitioner.city,
      region: practitioner.region,
      avatar: practitioner.avatar,
      acceptsPass: practitioner.acceptsPass,
      rating: practitioner.rating,
      reviewCount: practitioner._count.reviews,
      appointmentCount: practitioner._count.appointments,
      status: practitioner.status
    });
  } else {
    // Remove from index if not approved
    await index.deleteObject(practitioner.id);
  }
}
```

### Pattern 5: Full-Stack Feature (Appointment Booking)

**Scenario**: Complete appointment booking system

```
Developer: "Build an appointment booking system with calendar, payment, and notifications"

Claude Integration:
1. [Prisma MCP] Design Appointment model with relations
2. [Prisma MCP] Create migration
3. [Stripe MCP] Create payment intent for appointment fee
4. [Prisma MCP] Create appointment record
5. [Resend MCP] Send confirmation to user
6. [Resend MCP] Send notification to practitioner
7. [Cloudinary MCP] Generate calendar event attachment
8. Generate complete booking flow

Result: End-to-end appointment system
```

**Generated Code**:

```typescript
// src/app/api/appointments/book/route.ts
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/payment';
import { resend } from '@/lib/email';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { practitionerId, dateTime, serviceType, notes } = await req.json();

  try {
    // 1. Get practitioner and pricing
    const practitioner = await prisma.practitioner.findUnique({
      where: { id: practitionerId },
      include: {
        user: true,
        services: {
          where: { type: serviceType }
        }
      }
    });

    if (!practitioner || practitioner.status !== 'APPROVED') {
      return Response.json(
        { error: 'Practitioner not available' },
        { status: 404 }
      );
    }

    const service = practitioner.services[0];
    if (!service) {
      return Response.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // 2. Check user's PASS status for discount
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { passSubscription: true }
    });

    let finalPrice = service.price;
    let discount = 0;

    if (
      user?.passSubscription?.status === 'ACTIVE' &&
      practitioner.acceptsPass
    ) {
      discount = service.price * 0.15; // 15% PASS discount
      finalPrice = service.price - discount;
    }

    // 3. Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalPrice * 100), // Convert to cents
      currency: 'eur',
      customer: user?.stripeCustomerId,
      metadata: {
        userId: session.userId,
        practitionerId,
        serviceType,
        passDiscount: discount > 0 ? 'true' : 'false'
      },
      description: `Appointment with ${practitioner.user.name} - ${service.name}`
    });

    // 4. Create appointment in database
    const appointment = await prisma.appointment.create({
      data: {
        userId: session.userId,
        practitionerId,
        dateTime: new Date(dateTime),
        serviceType,
        notes,
        price: finalPrice,
        originalPrice: service.price,
        discount,
        status: 'PENDING_PAYMENT',
        stripePaymentIntentId: paymentIntent.id
      },
      include: {
        user: true,
        practitioner: {
          include: {
            user: true
          }
        }
      }
    });

    // 5. Send confirmation email to user
    await resend.emails.send({
      from: 'noreply@spymeo.com',
      to: appointment.user.email,
      subject: 'Confirmation de votre rendez-vous',
      template: 'appointment-confirm-user',
      templateData: {
        userName: appointment.user.name,
        practitionerName: appointment.practitioner.user.name,
        dateTime: new Date(dateTime).toLocaleString('fr-FR'),
        serviceType: service.name,
        price: finalPrice,
        discount: discount,
        cancelLink: `${process.env.NEXT_PUBLIC_URL}/user/appointments/${appointment.id}/cancel`
      }
    });

    // 6. Send notification to practitioner
    await resend.emails.send({
      from: 'noreply@spymeo.com',
      to: appointment.practitioner.user.email,
      subject: 'Nouveau rendez-vous réservé',
      template: 'appointment-notify-practitioner',
      templateData: {
        practitionerName: appointment.practitioner.user.name,
        userName: appointment.user.name,
        dateTime: new Date(dateTime).toLocaleString('fr-FR'),
        serviceType: service.name,
        notes: notes || 'Aucune note',
        dashboardLink: `${process.env.NEXT_PUBLIC_URL}/pro/praticien/agenda`
      }
    });

    return Response.json({
      appointmentId: appointment.id,
      clientSecret: paymentIntent.client_secret,
      amount: finalPrice,
      discount
    });

  } catch (error) {
    console.error('Appointment booking error:', error);
    return Response.json(
      { error: 'Booking failed' },
      { status: 500 }
    );
  }
}
```

## Best Practices for MCP Integration

### 1. Error Handling

Always handle errors from each MCP server:

```typescript
try {
  // Prisma operation
  const user = await prisma.user.create({ data });

  // Cloudinary operation
  const upload = await cloudinary.uploader.upload(image);

  // Algolia operation
  await searchIndex.saveObject({ objectID: user.id, ...data });

} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle database errors
  } else if (error.http_code) {
    // Handle Cloudinary errors
  } else {
    // Handle other errors
  }
}
```

### 2. Transactions and Rollback

When operations span multiple services, implement compensation logic:

```typescript
let uploadedImage: any;
let createdUser: any;

try {
  // 1. Upload image
  uploadedImage = await cloudinary.uploader.upload(image);

  // 2. Create user
  createdUser = await prisma.user.create({
    data: {
      ...userData,
      avatar: uploadedImage.secure_url
    }
  });

  // 3. Index in search
  await searchIndex.saveObject({
    objectID: createdUser.id,
    ...createdUser
  });

} catch (error) {
  // Rollback: Delete uploaded image
  if (uploadedImage) {
    await cloudinary.uploader.destroy(uploadedImage.public_id);
  }

  // Rollback: Delete created user
  if (createdUser) {
    await prisma.user.delete({ where: { id: createdUser.id } });
  }

  throw error;
}
```

### 3. Idempotency

Make operations idempotent when possible:

```typescript
// Use upsert instead of create
await prisma.practitioner.upsert({
  where: { userId: session.userId },
  create: { ...data },
  update: { ...data }
});

// Use unique IDs for external services
await stripe.customers.create({
  id: `spymeo_user_${userId}`, // Deterministic ID
  email: user.email
});
```

### 4. Async Operations

Handle long-running operations asynchronously:

```typescript
// Queue background jobs for non-critical operations
await prisma.appointment.create({ data });

// Send email asynchronously (don't await)
resend.emails.send({ ... }).catch(console.error);

// Sync to search index in background
syncToAlgolia(appointment.id).catch(console.error);
```

### 5. Caching

Cache frequently accessed data:

```typescript
import { cache } from 'react';

// Cache Prisma queries
export const getPractitioner = cache(async (id: string) => {
  return await prisma.practitioner.findUnique({
    where: { id },
    include: { user: true }
  });
});

// Cache search results
const cacheKey = `search:${query}:${filters}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const results = await algolia.search(query);
await redis.setex(cacheKey, 300, JSON.stringify(results));
```

## Testing MCP Integrations

### Unit Tests

Test individual MCP operations:

```typescript
// __tests__/lib/email.test.ts
import { resend } from '@/lib/email';

jest.mock('@/lib/email');

describe('Email Service', () => {
  it('should send welcome email', async () => {
    const mockSend = jest.fn().mockResolvedValue({ id: 'email-id' });
    (resend.emails.send as jest.Mock) = mockSend;

    await sendWelcomeEmail('user@example.com', 'John Doe');

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        template: 'welcome'
      })
    );
  });
});
```

### Integration Tests

Test multi-service workflows:

```typescript
// __tests__/api/appointments.test.ts
import { POST } from '@/app/api/appointments/book/route';

describe('Appointment Booking', () => {
  it('should create appointment with payment', async () => {
    const request = new Request('http://localhost/api/appointments/book', {
      method: 'POST',
      body: JSON.stringify({
        practitionerId: 'prac-123',
        dateTime: '2025-11-01T10:00:00Z',
        serviceType: 'CONSULTATION'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    // Verify database record
    expect(data.appointmentId).toBeDefined();

    // Verify payment intent created
    expect(data.clientSecret).toBeDefined();

    // Verify emails sent (via mock)
    expect(mockResend.emails.send).toHaveBeenCalledTimes(2);
  });
});
```

## Common Issues and Solutions

### Issue: Race Conditions

**Problem**: Multiple operations updating the same record

**Solution**: Use database transactions or optimistic locking

```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.update({
    where: { id: userId },
    data: { credits: { decrement: 100 } }
  });

  await tx.appointment.create({
    data: { userId, ... }
  });
});
```

### Issue: API Rate Limits

**Problem**: Exceeding external service rate limits

**Solution**: Implement rate limiting and queuing

```typescript
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 'second'
});

await limiter.removeTokens(1);
await algolia.search(query);
```

### Issue: Webhook Reliability

**Problem**: Missing webhook events

**Solution**: Implement webhook retry logic and sync jobs

```typescript
// Sync job to catch missed webhooks
export async function syncSubscriptions() {
  const subscriptions = await prisma.passSubscription.findMany({
    where: { status: 'ACTIVE' }
  });

  for (const sub of subscriptions) {
    const stripeSub = await stripe.subscriptions.retrieve(
      sub.stripeSubscriptionId
    );

    if (stripeSub.status !== sub.status) {
      await prisma.passSubscription.update({
        where: { id: sub.id },
        data: { status: stripeSub.status }
      });
    }
  }
}
```

## Resources

- [Main MCP README](./README.md)
- [Database Operations Guide](./database-operations.md)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Stripe Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Algolia Search Best Practices](https://www.algolia.com/doc/guides/best-practices/)
- [Cloudinary Optimization Guide](https://cloudinary.com/documentation/image_optimization)

## Next Steps

- Review server configurations in `.mcp/servers/`
- Explore example prompts in each server config
- Try integrating MCP servers in your development workflow
- Share integration patterns with the team
