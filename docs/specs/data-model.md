# SPYMEO Data Model

## Overview

This document describes the complete data model for the SPYMEO platform, including all entity types, relationships, and validation rules. The model is designed to support multi-role functionality for practitioners, artisans, merchants, training centers, and end-users.

## Type Definitions

All types are defined in TypeScript with strict type checking. The current implementation uses in-memory mock storage but is designed for seamless migration to a relational database (PostgreSQL + Prisma).

## Core Entities

### User & Authentication

#### Session
User session data stored in cookies.

```typescript
type Session = {
  id: string;           // User ID
  name: string;         // Display name
  email: string;        // Email address
  role: Role;           // User role
}
```

#### Role
User roles determining access permissions.

```typescript
type Role =
  | "ADMIN"           // Platform administrator
  | "PRACTITIONER"    // Wellness professional
  | "ARTISAN"         // Service provider
  | "COMMERCANT"      // Merchant
  | "CENTER"          // Training center
  | "PASS_USER"       // Premium subscriber
  | "FREE_USER"       // Basic user
  | "AMBASSADOR"      // Community representative
  | "PARTNER"         // Business partner
  | "PUBLIC";         // Anonymous visitor
```

#### User
Complete user profile (extends across roles).

```typescript
type User = {
  id: string;
  email: string;
  password: string;     // Hashed in production
  name: string;
  role: Role;
  createdAt: string;    // ISO datetime
  updatedAt: string;    // ISO datetime
}
```

### Client Management (Practitioner)

#### Client
Patient/client record for practitioners.

```typescript
type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;   // YYYY-MM-DD
  address?: string;
  notes?: string;       // General notes
}
```

#### Consultation
Consultation session record.

```typescript
type Consultation = {
  id: string;
  clientId: string;     // FK to Client
  date: string;         // ISO datetime
  durationMin: number;
  reason: string;
  notes?: string;
  followUp?: string;
  price?: number;
}
```

#### Antecedent
Medical/health history record.

```typescript
type Antecedent = {
  id: string;
  clientId: string;     // FK to Client
  category: "medical" | "surgical" | "allergies" | "medications" | "lifestyle";
  description: string;
  date?: string;        // YYYY-MM-DD
  severity?: "low" | "medium" | "high";
  active: boolean;
}
```

#### Document
Client-related documents.

```typescript
type ClientDocument = {
  id: string;
  clientId: string;     // FK to Client
  title: string;
  filename: string;
  mimeType: string;
  uploadedAt: string;   // ISO datetime
  size: number;         // Bytes
  url?: string;         // Storage URL
}
```

#### Invoice
Consultation invoices.

```typescript
type Invoice = {
  id: string;
  clientId: string;     // FK to Client
  consultationId?: string;
  number: string;       // Invoice number
  date: string;         // ISO datetime
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate?: string;     // ISO datetime
  paidAt?: string;      // ISO datetime
}
```

### Agenda/Calendar

#### Event
Calendar event (practitioner agenda).

```typescript
type Event = {
  id: string;
  title: string;
  start: string;        // ISO datetime
  end?: string;         // ISO datetime
  allDay?: boolean;
  extendedProps?: {
    clientId?: string;
    clientName?: string;
    notes?: string;
    color?: string;
    type?: "consultation" | "blocked" | "personal";
  };
}
```

#### AgendaSettings
Practitioner agenda configuration.

```typescript
type AgendaSettings = {
  businessHours: {
    daysOfWeek: number[];  // 0=Sunday, 1=Monday, etc.
    startTime: string;     // HH:mm
    endTime: string;       // HH:mm
  };
  slotDuration: number;    // Minutes
  defaultEventDuration: number;  // Minutes
  allowBookings: boolean;
  bookingLeadTime: number; // Hours
  cancellationPolicy?: string;
}
```

### Academy (Learning Platform)

#### Lesson
Educational content module.

```typescript
type Lesson = {
  id: string;
  title: string;
  durationMin: number;
  kind: "cours" | "guide" | "atelier";
  tags: string[];
  difficulty: "débutant" | "intermédiaire" | "avancé";
  coverUrl?: string;
  description: string;
  content: string;      // Markdown or HTML
  likes: number;
  comments: number;
  publishedAt: string;  // ISO datetime
  updatedAt: string;    // ISO datetime
}
```

#### Progress
User progress on lessons.

```typescript
type Progress = {
  lessonId: string;     // FK to Lesson
  userId: string;       // FK to User
  status: "non_commencé" | "en_cours" | "terminé";
  percent: number;      // 0-100
  favorite: boolean;
  lastViewedAt?: string; // ISO datetime
}
```

#### Note
User notes on lessons.

```typescript
type Note = {
  id: string;
  lessonId: string;     // FK to Lesson
  userId: string;       // FK to User
  body: string;
  createdAt: string;    // ISO datetime
  updatedAt: string;    // ISO datetime
}
```

#### Comment
Public comments on lessons.

```typescript
type Comment = {
  id: string;
  lessonId: string;     // FK to Lesson
  authorId: string;     // FK to User
  body: string;
  createdAt: string;    // ISO datetime
  likes: number;
}
```

#### Chapter
Course chapter structure.

```typescript
type Chapter = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: string[];    // Array of Lesson IDs
}
```

### Pre-Accounting

#### Transaction
Financial transaction record.

```typescript
type Transaction = {
  id: string;
  date: string;         // ISO datetime
  label: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  receiptId?: string;   // FK to Receipt
  paymentMethod?: "cash" | "card" | "transfer" | "check";
  status: "pending" | "validated" | "reconciled";
}
```

#### Receipt
Uploaded receipt/proof document.

```typescript
type Receipt = {
  id: string;
  filename: string;
  mimeType: string;
  data: ArrayBuffer;    // Binary data (or S3 URL in production)
  uploadedAt: string;   // ISO datetime
  size: number;         // Bytes
  txId?: string;        // Linked transaction
}
```

#### PrecomptaConfig
User accounting configuration.

```typescript
type PrecomptaConfig = {
  userId: string;
  fiscalYear: string;   // YYYY
  regime: "micro" | "réel simplifié" | "réel normal";
  categories: Array<{
    id: string;
    name: string;
    type: "income" | "expense";
    deductible?: boolean;
  }>;
  bankAccounts?: Array<{
    id: string;
    name: string;
    iban?: string;
  }>;
}
```

### PASS System

#### PassSnapshot
User PASS subscription state.

```typescript
type PassSnapshot = {
  active: boolean;
  plan: PassPlan;
  startedAt: string;       // ISO datetime
  nextBillingAt?: string;  // ISO datetime (monthly)
  monthsPaid: number;      // Total months paid
  resources: PassResource[];
  discounts: PassDiscount[];
  carnet: {
    status: CarnetShipmentStatus;
    note?: string;
    eta?: string;          // Estimated delivery
    tracking?: string;
  };
}
```

#### PassPlan
Subscription plan type.

```typescript
type PassPlan = "ANNUAL" | "MONTHLY";
```

#### PassResource
Monthly exclusive content for PASS members.

```typescript
type PassResource = {
  id: string;
  title: string;
  type: PassResourceType;
  month: string;           // YYYY-MM
  description?: string;
  url?: string;            // Streaming/download URL
  availableFrom: string;   // ISO datetime
}

type PassResourceType = "PODCAST" | "BOOKLET" | "VIDEO";
```

#### PassDiscount
Partner discount for PASS members.

```typescript
type PassDiscount = {
  id: string;
  kind: "Praticien" | "Commerçant" | "Artisan" | "Centre";
  name: string;
  city?: string;
  rate: number;            // Percentage (0-100)
  href: string;            // Link to partner profile
}
```

#### CarnetShipmentStatus
Physical carnet delivery status.

```typescript
type CarnetShipmentStatus =
  | "NOT_ELIGIBLE"         // Not yet qualified
  | "PENDING"              // Ready to ship
  | "PROCESSING"           // Being prepared
  | "SHIPPED"              // In transit
  | "DELIVERED";           // Delivered
```

### User Features

#### Appointment
End-user appointment booking.

```typescript
type Appointment = {
  id: string;
  userId: string;          // FK to User
  title: string;
  practitionerName: string;
  practitionerSlug: string;
  date: string;            // ISO datetime
  durationMin: number;
  place: Place;
  address?: string;
  notesForUser?: string;
  status: AppointmentStatus;
  canCancelUntil?: string; // ISO datetime
  documents?: Array<{
    id: string;
    title: string;
  }>;
}

type Place = "Cabinet" | "Visio" | "Domicile";
type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "DONE";
```

#### UserDocument
User's personal documents.

```typescript
type UserDocument = {
  id: string;
  userId: string;          // FK to User
  title: string;
  filename: string;
  mimeType: string;
  uploadedAt: string;      // ISO datetime
  size: number;            // Bytes
  category?: string;
  sharedBy?: string;       // Practitioner who shared it
  url?: string;
}
```

#### Conversation
Messaging conversation.

```typescript
type Conversation = {
  id: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageAt: string;   // ISO datetime
  unreadCount: number;
  type: "direct" | "group";
}
```

#### Message
Individual message in conversation.

```typescript
type Message = {
  id: string;
  conversationId: string;  // FK to Conversation
  senderId: string;        // FK to User
  senderName: string;
  body: string;
  sentAt: string;          // ISO datetime
  readAt?: string;         // ISO datetime
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
  }>;
}
```

### Professional Features

#### Advantage
Community member perk/offer.

```typescript
type Advantage = {
  id: string;
  providerId: string;      // FK to User (provider)
  title: string;
  description: string;
  discountRate?: number;
  validUntil?: string;     // ISO datetime
  terms?: string;
  category: string;
  targetRoles?: Role[];    // Who can access
  createdAt: string;
  updatedAt: string;
}
```

#### ImpactCandidature
Application for impact program.

```typescript
type ImpactCandidature = {
  id: string;
  userId: string;          // FK to User
  projectTitle: string;
  projectDescription: string;
  motivation: string;
  status: "draft" | "submitted" | "reviewing" | "accepted" | "rejected";
  submittedAt?: string;    // ISO datetime
  reviewedAt?: string;     // ISO datetime
  feedback?: string;
}
```

#### Resource
Shared professional resource.

```typescript
type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  fileUrl?: string;
  thumbnailUrl?: string;
  uploadedBy: string;      // User ID
  uploadedAt: string;      // ISO datetime
  downloads: number;
  rating?: number;
  sharedWith?: "PUBLIC" | "PASS" | "PRO";
}
```

### Statistics

#### Stats
Aggregated statistics for professionals.

```typescript
type Stats = {
  period: "day" | "week" | "month" | "year";
  startDate: string;       // ISO datetime
  endDate: string;         // ISO datetime
  metrics: {
    revenue: number;
    consultations: number;
    newClients: number;
    cancelledAppointments: number;
    averageTicket: number;
    occupancyRate: number; // Percentage
  };
  chartData?: Array<{
    date: string;
    value: number;
    label?: string;
  }>;
}
```

### Artisan Module

#### Service
Artisan service offering.

```typescript
type Service = {
  id: string;
  providerId: string;      // FK to User
  title: string;
  description: string;
  duration?: number;       // Minutes
  price: number;
  currency: string;
  category: string;
  available: boolean;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}
```

#### Order
Service order/booking.

```typescript
type Order = {
  id: string;
  orderNumber: string;
  customerId: string;      // FK to User/Client
  customerName: string;
  providerId: string;      // FK to User
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: OrderStatus;
  orderDate: string;       // ISO datetime
  completedAt?: string;    // ISO datetime
  notes?: string;
}

type OrderItem = {
  serviceId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";
```

### Merchant Module

#### Product
E-commerce product.

```typescript
type Product = {
  id: string;
  merchantId: string;      // FK to User
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number; // Original price (for sales)
  currency: string;
  category: string;
  tags: string[];
  images: string[];
  stock: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  available: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### StockMovement
Inventory tracking.

```typescript
type StockMovement = {
  id: string;
  productId: string;       // FK to Product
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  reference?: string;      // Order ID or supplier ref
  date: string;            // ISO datetime
  notes?: string;
}
```

### Training Center Module

#### Formation
Training course/program.

```typescript
type Formation = {
  id: string;
  centerId: string;        // FK to User
  slug: string;
  title: string;
  description: string;
  duration: number;        // Hours
  level: "débutant" | "intermédiaire" | "avancé" | "expert";
  format: "présentiel" | "distanciel" | "hybride";
  price: number;
  maxParticipants: number;
  category: string;
  tags: string[];
  syllabus?: string;
  prerequisites?: string;
  certification?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### Session
Training session instance.

```typescript
type Session = {
  id: string;
  formationId: string;     // FK to Formation
  startDate: string;       // ISO datetime
  endDate: string;         // ISO datetime
  location?: string;
  instructorName?: string;
  maxParticipants: number;
  enrolledCount: number;
  status: "planned" | "open" | "full" | "in_progress" | "completed" | "cancelled";
  price: number;
}
```

#### Learner
Training center student.

```typescript
type Learner = {
  id: string;
  centerId: string;        // FK to User (center)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  enrolledAt: string;      // ISO datetime
  status: "active" | "inactive" | "graduated";
  enrollments: Array<{
    sessionId: string;
    enrolledAt: string;
    status: "enrolled" | "completed" | "dropped";
    progress?: number;     // Percentage
    certificateUrl?: string;
  }>;
}
```

### Blog/Content

#### Article
Blog article.

```typescript
type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;         // Markdown or HTML
  coverImage?: string;
  authorId: string;        // FK to User
  authorName: string;
  category: string;
  tags: string[];
  status: "draft" | "pending" | "published" | "archived";
  publishedAt?: string;    // ISO datetime
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
}
```

### Shared Office (Cabinet Partagé)

#### Annonce
Office sharing listing.

```typescript
type Annonce = {
  id: string;
  providerId: string;      // FK to User
  title: string;
  description: string;
  city: string;
  postalCode: string;
  address: string;
  type: "bureau" | "salle" | "cabinet_complet";
  availability: "disponible" | "complet" | "bientôt";
  pricePerDay?: number;
  pricePerMonth?: number;
  amenities: string[];     // WiFi, parking, equipment, etc.
  images: string[];
  contactEmail: string;
  contactPhone?: string;
  publishedAt: string;     // ISO datetime
  expiresAt?: string;      // ISO datetime
  status: "active" | "inactive" | "archived";
}
```

## Relationships

### Entity Relationship Diagram

```
User
  ├─ has many → Client (as practitioner)
  ├─ has many → Consultation (as practitioner)
  ├─ has many → Event (as practitioner)
  ├─ has many → Transaction (as owner)
  ├─ has many → Service (as artisan)
  ├─ has many → Product (as merchant)
  ├─ has many → Formation (as center)
  ├─ has many → Learner (as center)
  ├─ has many → Appointment (as end-user)
  ├─ has many → UserDocument
  ├─ has many → Advantage (as provider)
  ├─ has one → PassSnapshot
  ├─ has many → Progress
  └─ has many → Note

Client
  ├─ has many → Consultation
  ├─ has many → Antecedent
  ├─ has many → ClientDocument
  └─ has many → Invoice

Lesson
  ├─ has many → Progress
  ├─ has many → Note
  └─ has many → Comment

Formation
  └─ has many → Session

Conversation
  └─ has many → Message
```

## Validation Rules

### Email
- Format: RFC 5322 compliant
- Unique per user
- Required for registration

### Phone
- Format: E.164 or local French format
- Optional for most entities
- Required for booking/scheduling

### Dates
- Format: ISO 8601 (YYYY-MM-DD or full datetime)
- Timezone: UTC for storage, local for display
- Future dates validated for appointments

### Prices
- Type: Number (float)
- Currency: EUR (default)
- Minimum: 0
- Precision: 2 decimal places

### Text Fields
- Names: 1-100 characters
- Descriptions: 0-2000 characters
- Content: 0-50000 characters
- Email: Max 255 characters

### File Uploads
- Max size: 10MB (documents), 5MB (images)
- Allowed types: PDF, JPG, PNG, WEBP, MP4 (video)
- Filename sanitization required

## Data Integrity

### Referential Integrity
All foreign keys (e.g., `clientId`, `userId`) must reference existing entities. Cascade rules:
- User deletion: Cascade to owned entities (soft delete recommended)
- Client deletion: Cascade to consultations, documents, invoices
- Consultation deletion: Nullify invoice reference
- Lesson deletion: Cascade to progress, notes, comments

### Unique Constraints
- User email (global)
- Product slug (per merchant)
- Article slug (global)
- Formation slug (per center)
- Invoice number (per practitioner)

### Soft Deletes
Recommended for:
- Users (retain history)
- Clients (regulatory compliance)
- Consultations (audit trail)
- Invoices (legal requirement)
- Articles (content archive)

## Indexing Strategy (For Database Migration)

### Primary Indexes
- All `id` fields (UUID or auto-increment)

### Foreign Key Indexes
- `clientId`, `userId`, `practitionerId`
- `conversationId`, `lessonId`, `formationId`

### Search Indexes
- User: `email`, `role`
- Client: `lastName`, `firstName`, `email`
- Article: `slug`, `status`, `publishedAt`
- Product: `slug`, `category`, `merchantId`
- Appointment: `userId`, `date`, `status`

### Composite Indexes
- (userId, role) - Role-based queries
- (clientId, date) - Client history
- (practitionerId, date) - Agenda queries
- (productId, date) - Stock movements

## Migration Notes

### From Mock to Database
1. Replace in-memory stores with database queries
2. Add `createdAt`/`updatedAt` timestamps to all entities
3. Implement soft deletes with `deletedAt` field
4. Add database constraints and indexes
5. Implement connection pooling
6. Add query optimization

### Recommended Tech Stack
- **ORM**: Prisma (TypeScript-first, migrations, type generation)
- **Database**: PostgreSQL 14+ (robust, ACID, JSON support)
- **Cache**: Redis (sessions, frequently accessed data)
- **Files**: S3-compatible storage (Cloudflare R2, AWS S3)

## See Also

- [Architecture](./architecture.md) - System architecture overview
- [API Specifications](./api/) - Endpoint documentation
- [Type Definitions](../../src/lib/db/types.ts) - Source code types
- [Mock Data](../../src/lib/mockdb/) - Development data stores

---

Last updated: 2025-10-06
