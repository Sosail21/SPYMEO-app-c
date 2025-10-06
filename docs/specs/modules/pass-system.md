# PASS System Module Specification

## Overview

The PASS system is SPYMEO's subscription-based membership program offering exclusive benefits to end-users and partnerships with professionals. Members receive monthly resources, partner discounts, and physical wellness products.

## Target Users

- **End-Users**: `PASS_USER` role
- **Free Users**: Can view PASS benefits and subscribe
- **Professionals**: Partner with PASS to offer member discounts

## Access Points

- **Public**: `/pass` - Landing page and information
- **User Dashboard**: `/user/tableau-de-bord`, `/pass/tableau-de-bord`
- **User PASS Page**: `/user/pass` - Full subscription management
- **Professional**: `/pro/commun/pass-partenaire` - Partner dashboard

## Subscription Plans

### Monthly Plan (`MONTHLY`)

**Pricing**: €X/month (billed monthly)

**Benefits**:
- Monthly exclusive resource (podcast, booklet, or video)
- Discounts at partner professionals (practitioners, merchants, artisans, centers)
- Access to PASS-only community features
- Physical "Carnet de vie" after 6 months of continuous subscription

**Billing**:
- Charged on the same day each month
- Cancel anytime
- Pauses available (max 2 months/year)

### Annual Plan (`ANNUAL`)

**Pricing**: €Y/year (billed annually, ~15% savings)

**Benefits**:
- All monthly plan benefits
- Immediate "Carnet de vie" delivery
- Priority customer support
- Early access to new features
- Annual exclusive gift

**Billing**:
- One-time annual charge
- Auto-renews unless cancelled
- Pro-rated refunds within first 30 days

## Core Features

### 1. PASS Landing Page (`/pass`)

**Purpose**: Public-facing page to convert visitors to subscribers.

**Sections**:

**Hero**:
- Headline: "Rejoignez SPYMEO PASS"
- Subhead: Benefits summary
- CTA: "Découvrir" or "S'abonner"

**Benefits Overview**:
- Icon + title + description for each benefit
- Visual examples (mockup of carnet, resource screenshots)

**Pricing Cards**:
- Monthly vs Annual comparison
- Feature list for each
- Highlight savings on annual
- CTA buttons: "Choisir Mensuel" / "Choisir Annuel"

**Partner Network**:
- Map or list of partner professionals
- Category filters
- "X practitioners, Y merchants, Z artisans, W centers"

**Testimonials**:
- User reviews
- Before/after stories
- Star ratings

**FAQs**:
- What is PASS?
- What's included?
- How does the carnet work?
- Can I cancel anytime?
- How do partner discounts work?

### 2. User PASS Dashboard (`/user/pass`)

**Purpose**: Subscription management and benefits access.

#### 2.1 Subscription Status Card

**Active Subscription Display**:
- Plan badge (Monthly/Annual)
- "Actif depuis" start date
- Next billing date (monthly) or renewal date (annual)
- Total months paid (for monthly)
- "Gérer mon abonnement" button

**Actions**:
- Switch plan (monthly ↔ annual)
- Pause subscription (modal with reason and duration)
- Cancel subscription (with confirmation and exit survey)
- Update payment method

**Inactive/Expired**:
- "Votre PASS a expiré le [date]"
- Benefits summary
- "Réactiver" CTA

#### 2.2 Carnet de Vie

**Purpose**: Physical wellness journal/planner shipped to members.

**Eligibility**:
- **Annual**: Immediately eligible upon subscription
- **Monthly**: Eligible after 6 continuous months

**Status Tracking**:
```typescript
type CarnetShipmentStatus =
  | "NOT_ELIGIBLE"    // < 6 months (monthly plan)
  | "PENDING"         // Ready to ship
  | "PROCESSING"      // Being prepared
  | "SHIPPED"         // In transit
  | "DELIVERED"       // Delivered
```

**UI by Status**:

**NOT_ELIGIBLE**:
- Progress bar: X/6 months completed
- Message: "Encore Y mois pour débloquer l'envoi du carnet."
- Carnet preview image

**PENDING**:
- Message: "Votre carnet est prêt à être expédié!"
- "Confirmer l'adresse de livraison" button
- Shows saved address with edit option

**PROCESSING**:
- Message: "Votre carnet est en préparation."
- Estimated preparation time: 3-5 business days

**SHIPPED**:
- Message: "Votre carnet est en route !"
- Tracking number (clickable link to carrier)
- Estimated delivery date
- Carrier name and logo

**DELIVERED**:
- Message: "Votre carnet a été livré le [date]."
- "Commander un nouveau carnet" button (if eligible for next year)
- Link to carnet usage guide

**Carnet Actions**:
- `POST /api/user/pass/ship-carnet` - Initiate shipment (advances status)
- Shows modal to confirm shipping address
- Backend validates eligibility (6 months paid or annual)

#### 2.3 Exclusive Resources

**Purpose**: Monthly digital content (podcasts, booklets, videos).

**Resource Card Display**:
- Type badge (Podcast/Booklet/Video)
- Title
- Month attribution (e.g., "Octobre 2025")
- Thumbnail/cover image
- Duration or page count
- Description
- "Available from" date
- Download/stream button

**Resource Types**:

**Podcast** (`PODCAST`):
- Audio player embedded
- Download MP3 option
- Show notes
- Transcript (optional)

**Booklet** (`BOOKLET`):
- PDF viewer or download
- Page count
- Topics covered
- Printable format

**Video** (`VIDEO`):
- Video player embedded
- Duration
- Chapter markers
- Download for offline viewing (optional)

**Filtering**:
- By month
- By type
- By topic/tag

**API**:
- `GET /api/user/pass/resources?month=2025-10`

**Data Model**:
```typescript
type PassResource = {
  id: string;
  title: string;
  type: PassResourceType;
  month: string; // YYYY-MM
  description?: string;
  url?: string; // Streaming/download URL
  availableFrom: string; // ISO datetime
}

type PassResourceType = "PODCAST" | "BOOKLET" | "VIDEO";
```

#### 2.4 Partner Discounts

**Purpose**: Access to exclusive deals at partner professionals.

**Partner Discount Card**:
- Partner type badge (Praticien, Commerçant, Artisan, Centre)
- Partner name
- City
- Discount rate (e.g., "15% de réduction")
- "Voir la fiche" link to partner public profile

**Features**:
- Filter by partner type
- Filter by city/region
- Search by partner name
- Sort by: Discount rate, nearest, newest

**Redemption Flow**:
1. User finds partner on PASS discounts page
2. Clicks "Voir la fiche" → Partner public page
3. Books appointment or purchases product
4. At checkout/appointment, mentions PASS membership
5. Partner verifies PASS status
6. Discount applied

**Future Enhancement**: Digital coupon codes, QR code verification

**API**:
- `GET /api/user/pass/discounts?kind=Praticien&city=Dijon`

**Data Model**:
```typescript
type PassDiscount = {
  id: string;
  kind: "Praticien" | "Commerçant" | "Artisan" | "Centre";
  name: string;
  city?: string;
  rate: number; // Percentage
  href: string; // Link to partner profile
}
```

#### 2.5 Subscription Management

**Switch Plan**:
- Modal with plan comparison
- Prorated amount calculated
- Confirm switch
- `POST /api/user/pass/toggle-plan` - { plan: "ANNUAL" | "MONTHLY" }

**Pause Subscription** (Monthly only):
- Modal: "Pourquoi souhaitez-vous mettre en pause ?"
- Reason dropdown + optional note
- Date range picker (max 2 months)
- Confirm pause
- `POST /api/account/plan/pause` - { reason, pauseUntil }

**Cancel Subscription**:
- Confirmation modal with impact warning:
  - "Vous perdrez l'accès aux ressources exclusives"
  - "Vos réductions partenaires seront désactivées"
  - "Le carnet ne sera plus expédié (si en attente)"
- Exit survey (optional): "Pourquoi annulez-vous ?"
- Confirm cancellation
- Subscription remains active until end of billing period
- `DELETE /api/account/plan`

### 3. Professional Partner Dashboard (`/pro/commun/pass-partenaire`)

**Purpose**: Manage partnership with PASS system.

#### 3.1 Partnership Status

**Enrolled**:
- Badge: "Partenaire PASS"
- Benefits of being a PASS partner:
  - Visibility on PASS discounts page
  - Access to PASS member network
  - Featured in monthly PASS newsletters
  - Professional badge on public profile

**Not Enrolled**:
- "Devenir partenaire PASS"
- Benefits overview
- Enrollment form

#### 3.2 Discount Configuration

**Set Discount**:
- Discount rate slider (0-30%)
- Terms and conditions (optional text)
- Valid until date (optional)
- Target roles (all PASS members or specific types)
- Active/inactive toggle

**Preview**:
- Shows how discount appears on user-facing page

**API**:
- `GET /api/pro/pass` - Current partnership status
- `POST /api/pro/pass/offer` - Create/update discount offer

#### 3.3 Redemption Tracking

**Metrics** (Future):
- Total PASS member appointments/purchases
- Total discount amount given
- Top redeeming members
- Conversion rate

**Verification** (Future):
- QR code scanner to verify PASS membership
- Manual verification by email

### 4. Billing & Payment

**Payment Methods**:
- Credit/debit card (Stripe)
- SEPA direct debit (EU)
- PayPal (optional)

**Invoices**:
- Auto-generated monthly (monthly plan) or annually (annual plan)
- Downloadable PDF from account billing page
- Email copy sent to user

**Failed Payments**:
- Email notification
- Grace period (3 days)
- Retry payment
- If still failed, subscription downgraded to Free (benefits revoked)

**Refunds**:
- Annual plan: Pro-rated refund within 30 days
- Monthly plan: No refunds (cancel anytime, no future charges)

### 5. PASS Member Benefits Summary

**For End-Users**:
- Exclusive monthly content (podcast, booklet, video)
- Partner discounts (up to 30% off)
- Physical carnet de vie (after 6 months or immediately with annual)
- Priority support
- PASS-only community channels
- Early access to new features

**For Professionals (Partners)**:
- Increased visibility
- Access to loyal customer base
- Marketing through PASS channels
- Partnership badge on profile
- Analytics on redemptions

## Data Model

### PassSnapshot

Complete state of a user's PASS subscription:

```typescript
type PassSnapshot = {
  active: boolean;
  plan: PassPlan;
  startedAt: string; // ISO datetime
  nextBillingAt?: string; // For monthly plan
  monthsPaid: number; // Cumulative months paid
  resources: PassResource[];
  discounts: PassDiscount[];
  carnet: {
    status: CarnetShipmentStatus;
    note?: string;
    eta?: string; // Estimated delivery
    tracking?: string;
  };
}
```

### Carnet Logic

**Eligibility Calculation**:
```typescript
function computeCarnetStatus(
  plan: PassPlan,
  active: boolean,
  monthsPaid: number
): CarnetShipmentStatus {
  if (!active) return "NOT_ELIGIBLE";
  if (plan === "ANNUAL") return "PENDING"; // Immediate eligibility
  return monthsPaid >= 6 ? "PENDING" : "NOT_ELIGIBLE";
}
```

**Status Progression**:
- User calls `POST /api/user/pass/ship-carnet`
- Backend validates eligibility
- Advances status: PENDING → PROCESSING → SHIPPED → DELIVERED
- Each advancement triggered by admin action or time delay (mock)

## API Endpoints

**User PASS**:
- `GET /api/user/pass` - Get complete PASS snapshot
- `POST /api/user/pass/toggle-plan` - Switch between monthly/annual
- `POST /api/user/pass/increment-month` - (Mock) Simulate monthly payment
- `POST /api/user/pass/ship-carnet` - Request carnet shipment
- `GET /api/user/pass/discounts` - Get partner discounts
- `GET /api/user/pass/resources` - Get exclusive resources

**Professional PASS**:
- `GET /api/pro/pass` - Get partnership status
- `POST /api/pro/pass/offer` - Set discount offer

**Public**:
- `GET /api/public/pass/:userId` - Public PASS profile (limited info)

See [PASS API](../api/pass.yaml) for complete endpoint documentation.

## Workflows

### Workflow: Subscribe to PASS (Monthly)
```
1. User visits /pass landing page
2. Reviews benefits and pricing
3. Clicks "Choisir Mensuel"
4. Redirects to checkout (Stripe or internal)
5. Enters payment details
6. Confirms subscription
7. Account upgraded to PASS_USER role
8. Subscription activated:
   - startedAt: now
   - nextBillingAt: +1 month
   - monthsPaid: 0
   - carnet.status: NOT_ELIGIBLE
9. Welcome email sent with login credentials and benefits overview
10. User redirected to /user/pass dashboard
```

### Workflow: Carnet Unlock (Monthly Plan)
```
1. User subscribed for 5 months (monthsPaid = 5)
2. Dashboard shows: "Encore 1 mois pour débloquer l'envoi du carnet."
3. Month passes, billing succeeds
4. monthsPaid incremented to 6
5. carnet.status automatically changes to PENDING
6. Dashboard shows: "Votre carnet est prêt à être expédié!"
7. User clicks "Confirmer l'adresse de livraison"
8. Modal opens with address form (pre-filled from profile)
9. User confirms or updates address
10. Clicks "Confirmer l'envoi"
11. POST /api/user/pass/ship-carnet called
12. carnet.status → PROCESSING
13. (Admin action) Carnet prepared, status → SHIPPED, tracking added
14. User receives email with tracking link
15. (Time passes) Delivery confirmed, status → DELIVERED
16. User sees confirmation message
```

### Workflow: Switch to Annual Plan
```
1. User on monthly plan, 3 months paid
2. Visits /user/pass dashboard
3. Clicks "Passer à l'abonnement annuel"
4. Modal shows:
   - Current: €X/month, paid until [date]
   - Annual: €Y/year (~15% savings)
   - Prorated credit: €Z (for remaining monthly period)
   - New charge: €(Y - Z)
   - Benefit: Immediate carnet eligibility
5. User confirms switch
6. POST /api/user/pass/toggle-plan { plan: "ANNUAL" }
7. Payment processed
8. Subscription updated:
   - plan: ANNUAL
   - nextBillingAt: +1 year
   - carnet.status: PENDING (immediately eligible)
9. Confirmation email sent
10. Dashboard updates to show annual benefits
```

## Security & Privacy

**Data Protection**:
- Payment details handled by Stripe (PCI compliant)
- No card numbers stored in database
- Shipping address encrypted at rest

**Access Control**:
- PASS benefits only accessible to active PASS_USER role
- Expired subscriptions automatically downgrade to FREE_USER
- Grace period for payment failures before revocation

**Partner Verification**:
- Partners can request verification of PASS status
- Future: API endpoint for real-time verification
- Future: QR code on user's PASS card

## Analytics & Metrics

**Track**:
- Subscription conversions (monthly vs annual)
- Churn rate
- Average subscription duration
- Resource engagement (downloads, views, completion)
- Partner discount redemption rate
- Carnet shipment costs
- Revenue per user (lifetime value)

**Dashboard** (Admin):
- Total active PASS members
- Monthly recurring revenue (MRR)
- Annual recurring revenue (ARR)
- Carnet shipment queue
- Popular resources
- Top partner redemptions

## Future Enhancements

1. **Tiered Plans**: Introduce PASS Premium with additional benefits
2. **Family Plans**: Discounted multi-user subscriptions
3. **Gift Subscriptions**: Purchase PASS for someone else
4. **Loyalty Rewards**: Points system for long-term members
5. **Referral Program**: Earn free months by referring friends
6. **Mobile App**: Native app for resource access
7. **Offline Access**: Download resources for offline viewing
8. **Community Forums**: PASS-only discussion boards
9. **Exclusive Events**: Virtual or in-person member events
10. **Personalized Recommendations**: AI-suggested resources and partners
11. **Integration with Wearables**: Sync with fitness trackers
12. **Gamification**: Challenges, badges, leaderboards
13. **Partner API**: Allow partners to verify membership programmatically
14. **Dynamic Pricing**: Regional pricing, student discounts
15. **Corporate Plans**: B2B subscriptions for companies

## Related Documentation

- [Architecture](../architecture.md)
- [Data Model](../data-model.md)
- [PASS API](../api/pass.yaml)
- [User API](../api/user.yaml)
- [Account API](../api/account.yaml)
- [Mock PASS Data](../../src/lib/mockdb/pass.ts)

---

Last updated: 2025-10-06
