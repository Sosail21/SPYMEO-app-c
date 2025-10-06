# SPYMEO System Architecture

## Overview

SPYMEO is a Next.js 14-based platform providing a comprehensive ecosystem for wellness professionals, service providers, merchants, training centers, and end-users. The architecture follows modern React patterns with Server Components, API Routes, and a role-based access control system.

## Architecture Principles

### Design Philosophy
1. **Role-Based Architecture** - Separate features and UI per user role
2. **Convention over Configuration** - Consistent URL patterns and file organization
3. **Progressive Enhancement** - Server-side rendering with client-side interactivity
4. **Type Safety** - Full TypeScript coverage with strict validation
5. **Modularity** - Independent feature modules per user type

### Key Characteristics
- **Monolithic Architecture** - Single Next.js application serving all roles
- **API-First Design** - REST APIs for all data operations
- **Cookie-Based Sessions** - Secure authentication without tokens
- **Mock Data Layer** - In-memory storage for development (DB-ready design)
- **Static + Dynamic Rendering** - Optimized performance with SSR/SSG hybrid

## Technology Stack

### Frontend Layer
```
Next.js 14.0+           - React framework with App Router
React 18                - UI library with Server Components
TypeScript 5.0+         - Type safety
Tailwind CSS 3.4+       - Utility-first styling
Lucide React            - Icon library
date-fns                - Date manipulation
Recharts                - Data visualization
React Hook Form         - Form management
Zod                     - Runtime validation
```

### Backend Layer
```
Next.js API Routes      - RESTful endpoints
TypeScript              - Type-safe server logic
In-Memory Storage       - Development data layer
Cookie Sessions         - Authentication
Zod Validation          - Request validation
```

### Build & Development
```
Node.js 18+             - Runtime environment
npm                     - Package management
ESLint                  - Code linting
PostCSS                 - CSS processing
Turbopack               - Fast refresh (dev)
```

## Project Structure

```
spymeo/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (public routes)/        # Public pages
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── praticiens/         # Practitioner directory
│   │   │   ├── commercants/        # Merchant directory
│   │   │   ├── artisans/           # Artisan directory
│   │   │   ├── centres-de-formation/ # Training center directory
│   │   │   ├── blog/               # Blog & articles
│   │   │   └── pass/               # PASS landing
│   │   │
│   │   ├── auth/                   # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── reset/
│   │   │
│   │   ├── user/                   # End-user area (FREE/PASS)
│   │   │   ├── tableau-de-bord/    # User dashboard
│   │   │   ├── rendez-vous/        # Appointments
│   │   │   ├── messagerie/         # Messaging
│   │   │   ├── documents/          # Document management
│   │   │   ├── pass/               # PASS subscription
│   │   │   ├── favoris/            # Favorites
│   │   │   └── mes-praticiens/     # Saved practitioners
│   │   │
│   │   ├── pro/                    # Professional area
│   │   │   ├── dashboard/          # Role-specific dashboards
│   │   │   ├── compte/             # Account settings
│   │   │   │
│   │   │   ├── praticien/          # Practitioner features
│   │   │   │   ├── agenda/         # Calendar
│   │   │   │   ├── fiches-clients/ # Client management
│   │   │   │   ├── statistiques/   # Statistics
│   │   │   │   ├── precompta/      # Pre-accounting
│   │   │   │   ├── academie/       # Learning platform
│   │   │   │   ├── ressources/     # Resources
│   │   │   │   ├── blog-proposer/  # Blog submission
│   │   │   │   ├── cabinet-partage/# Shared office
│   │   │   │   └── impact/         # Impact program
│   │   │   │
│   │   │   ├── artisan/            # Artisan features
│   │   │   │   ├── catalogue/      # Service catalog
│   │   │   │   ├── ventes/         # Orders
│   │   │   │   ├── clients/        # Clients
│   │   │   │   ├── statistiques/   # Statistics
│   │   │   │   └── precompta/      # Pre-accounting
│   │   │   │
│   │   │   ├── commercant/         # Merchant features
│   │   │   │   ├── produits/       # Product catalog
│   │   │   │   ├── commandes/      # Orders
│   │   │   │   ├── stock/          # Inventory
│   │   │   │   ├── clients/        # Clients
│   │   │   │   ├── statistiques/   # Statistics
│   │   │   │   └── pre-compta/     # Pre-accounting
│   │   │   │
│   │   │   ├── centre/             # Training center features
│   │   │   │   ├── formations/     # Course catalog
│   │   │   │   ├── apprenants/     # Learner management
│   │   │   │   ├── statistiques/   # Statistics
│   │   │   │   └── precompta/      # Pre-accounting
│   │   │   │
│   │   │   └── commun/             # Shared pro features
│   │   │       ├── fiche/          # Public profile
│   │   │       ├── spymcom/        # Community chat
│   │   │       ├── repertoire/     # Directory
│   │   │       ├── notes/          # Notes
│   │   │       ├── messages/       # Messaging
│   │   │       ├── avantages/      # Member perks
│   │   │       └── pass-partenaire/ # Partner PASS
│   │   │
│   │   ├── admin/                  # Admin panel
│   │   │   ├── page.tsx            # Admin dashboard
│   │   │   ├── utilisateurs/       # User management
│   │   │   ├── centres/            # Center management
│   │   │   ├── pros/               # Pro management
│   │   │   ├── pass/               # PASS management
│   │   │   └── blog/               # Blog moderation
│   │   │
│   │   └── api/                    # API Routes
│   │       ├── auth/               # Authentication
│   │       ├── account/            # Account management
│   │       ├── clients/            # Client management
│   │       ├── agenda/             # Calendar
│   │       ├── academy/            # Learning platform
│   │       ├── precompta/          # Pre-accounting
│   │       ├── user/               # User features
│   │       ├── pro/                # Pro features
│   │       ├── resources/          # Resources
│   │       ├── stats/              # Statistics
│   │       └── articles/           # Blog
│   │
│   ├── components/                 # React components
│   │   ├── admin/                  # Admin UI
│   │   ├── pro/                    # Professional UI
│   │   ├── user/                   # End-user UI
│   │   ├── patient/                # Client management
│   │   ├── agenda/                 # Calendar components
│   │   ├── messenger/              # Messaging
│   │   ├── notes/                  # Notes
│   │   ├── resources/              # Resources
│   │   ├── stats/                  # Statistics
│   │   ├── cabinet/                # Shared office
│   │   ├── spymcom/                # Community
│   │   └── repertoire/             # Directory
│   │
│   └── lib/                        # Shared libraries
│       ├── auth/                   # Authentication
│       │   ├── session.ts          # Session management
│       │   └── users.ts            # User lookup
│       ├── db/                     # Data layer
│       │   ├── types.ts            # Type definitions
│       │   ├── profiles.ts         # Profile management
│       │   ├── billing.ts          # Billing
│       │   ├── community.ts        # Community features
│       │   └── mock*.ts            # Mock data stores
│       ├── mockdb/                 # Mock databases
│       ├── validation/             # Validation schemas
│       ├── routes.ts               # Route definitions
│       ├── rbac.ts                 # Access control
│       └── csv.ts                  # CSV utilities
│
├── docs/                           # Documentation
│   └── specs/                      # Technical specs
│
└── public/                         # Static assets
```

## System Components

### 1. Routing Layer

**App Router (Next.js 14)**
- File-based routing with `/app` directory
- Server Components by default
- Client Components marked with 'use client'
- Dynamic routes with `[param]` syntax
- Route groups with `(groupName)`

**Route Patterns**
```
Public:    /praticiens, /commercants, /artisans, /centres-de-formation
Detail:    /praticien/:slug, /commercant/:slug
Auth:      /auth/login, /auth/signup
User:      /user/*
Pro:       /pro/:role/*
Admin:     /admin/*
API:       /api/*
```

### 2. Authentication & Authorization

**Session Management**
- Cookie-based sessions (`spy_session`)
- Server-side session validation
- No JWT tokens (simpler, more secure)

**Session Object**
```typescript
type Session = {
  id: string;      // User ID
  name: string;    // Display name
  email: string;   // Email address
  role: Role;      // User role
}
```

**Role-Based Access Control (RBAC)**
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

**Access Control Flow**
```
Request → Middleware → RBAC Check → Route Handler
                           ↓
                    canAccess(path, role)
                           ↓
                    Allow / Deny / Redirect
```

### 3. API Layer

**Architecture**
- RESTful design patterns
- Next.js Route Handlers
- Async request/response
- JSON serialization
- Error handling with HTTP status codes

**Request Flow**
```
Client → API Route → Auth Check → Business Logic → Data Layer → Response
```

**API Patterns**
```typescript
// Collection endpoints
GET    /api/resource          → List all
POST   /api/resource          → Create new

// Item endpoints
GET    /api/resource/:id      → Get one
PUT    /api/resource/:id      → Update
DELETE /api/resource/:id      → Delete

// Sub-resources
GET    /api/resource/:id/sub  → Related data
```

**Error Responses**
```typescript
{
  error: string;           // Error message
  details?: any;          // Optional error details
}

Status Codes:
200 - Success
201 - Created
400 - Bad Request (validation error)
401 - Unauthorized (not logged in)
403 - Forbidden (insufficient permissions)
404 - Not Found
500 - Server Error
```

### 4. Data Layer

**Current: In-Memory Mock Storage**
```typescript
// Global stores for development
globalThis.__CLIENTS__
globalThis.__AGENDA__
globalThis.__ACADEMY__
globalThis.__PRECOMPTA__
globalThis.__PASS__
```

**Design for Database Migration**
- Abstracted data access functions
- Type-safe interfaces
- Async operations ready
- Clear separation of concerns

**Data Access Pattern**
```typescript
// lib/db/mockClients.ts
export async function listClients(): Promise<Client[]> { }
export async function getClient(id: string): Promise<Client | null> { }
export async function createClient(data: Partial<Client>): Promise<Client> { }
export async function updateClient(id: string, data: Partial<Client>): Promise<Client> { }
export async function deleteClient(id: string): Promise<void> { }
```

### 5. UI Components

**Component Architecture**
- Atomic Design principles
- Reusable primitives
- Feature-specific components
- Server Components by default
- Client Components for interactivity

**Component Categories**
```
Primitives:     buttons, inputs, cards, modals
Layout:         headers, sidebars, topbars, footers
Features:       agenda, clients, stats, messages
Pages:          dashboard, settings, lists, details
```

**State Management**
- React Server Components (RSC) for data fetching
- Client Components with useState/useReducer
- URL state for filters and navigation
- Local storage for UI preferences

### 6. Styling System

**Tailwind CSS Configuration**
```typescript
// Utility-first approach
// Custom color palette (soft pastels)
// Responsive design tokens
// Custom components via @apply
```

**Design Tokens**
```css
Colors:     soft-{blue|purple|teal|amber|rose}
Spacing:    0-96 (4px increments)
Typography: text-{xs|sm|base|lg|xl|...}
Shadows:    shadow-{sm|md|lg}
Borders:    rounded-{sm|md|lg|xl}
```

## Data Flow Patterns

### Server Component Data Fetching
```typescript
// app/pro/praticien/clients/page.tsx
export default async function ClientsPage() {
  const session = await getSessionUser();
  if (!session) redirect('/auth/login');

  // Direct data fetching
  const clients = await listClients();

  return <ClientList clients={clients} />;
}
```

### Client Component Interaction
```typescript
'use client';
// components/ClientList.tsx
export function ClientList({ clients }) {
  const [filter, setFilter] = useState('');

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <SearchInput value={filter} onChange={setFilter} />
      {filtered.map(client => <ClientCard key={client.id} {...client} />)}
    </>
  );
}
```

### API Call from Client
```typescript
'use client';
async function handleSubmit(data: FormData) {
  const res = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  return res.json();
}
```

## Security Architecture

### Authentication Security
- HttpOnly cookies (XSS protection)
- SameSite=lax (CSRF mitigation)
- Server-side session validation
- No token exposure to client

### Authorization Security
- Middleware-based route protection
- Per-route role checks
- API-level authorization
- Resource-level permissions

### Data Security
- Type validation with Zod
- SQL injection prevention (prepared for DB)
- XSS prevention (React escaping)
- File upload validation

## Performance Optimization

### Rendering Strategy
```
Static:         Landing pages, blog posts
Dynamic:        User dashboards, data tables
Streaming:      Long lists, progressive rendering
Client:         Interactive forms, real-time updates
```

### Caching Strategy
```
Static Assets:  CDN caching
API Routes:     Per-route cache control
Server Comp:    Automatic deduplication
Client State:   Memory + localStorage
```

### Code Splitting
```
Route-based:    Automatic by Next.js
Component:      Dynamic imports where needed
Third-party:    Separate vendor chunks
```

## Deployment Architecture

### Development Environment
```
Node.js server → Hot reload → In-memory data → Local cookies
```

### Production Ready Design
```
Next.js App → API Routes → Database → CDN → Users
                              ↓
                          Redis Cache
                              ↓
                          File Storage
```

### Environment Configuration
```
NEXT_PUBLIC_*      - Client-side variables
DATABASE_URL       - Database connection
SESSION_SECRET     - Cookie encryption
STORAGE_BUCKET     - File storage
API_URL            - External API base
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API routes
- Cookie-based sessions (can use Redis)
- Database connection pooling ready
- CDN for static assets

### Vertical Scaling
- Efficient React rendering
- Minimal client-side JS
- Optimized images
- Lazy loading

### Database Migration Path
```
Current:  In-memory mock stores
Phase 1:  PostgreSQL with Prisma ORM
Phase 2:  Redis for sessions/cache
Phase 3:  S3 for file storage
Phase 4:  CDN for assets
```

## Monitoring & Observability

### Logging Strategy (Ready)
```
Request logs:   API route access
Error logs:     Exception tracking
Audit logs:     User actions
Performance:    Response times
```

### Metrics to Track
```
API latency
Error rates
User sessions
Feature usage
Database queries
Cache hit rates
```

## Development Workflow

### Local Development
```bash
npm install           # Install dependencies
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run start         # Production server
npm run lint          # Code linting
```

### Code Organization Standards
```
- TypeScript strict mode
- ESLint configuration
- Consistent naming conventions
- Component organization by feature
- Shared utilities in /lib
- Mock data in /lib/mockdb
```

### Testing Strategy (Recommended)
```
Unit:        lib/ utilities
Integration: API routes
E2E:         Critical user flows
Visual:      Component snapshots
```

## Migration Roadmap

### Phase 1: Database Integration
- Replace in-memory stores with PostgreSQL
- Implement Prisma ORM
- Add data migrations
- Session storage in database

### Phase 2: Production Hardening
- Redis for session management
- S3 for file uploads
- Email service integration
- Payment gateway integration

### Phase 3: Advanced Features
- Real-time updates (WebSocket)
- Push notifications
- Advanced analytics
- Search optimization

### Phase 4: Scale & Optimize
- CDN integration
- Image optimization service
- Background job processing
- Microservices extraction (if needed)

## Related Documents

- [Data Model](./data-model.md) - Complete type definitions
- [API Specifications](./api/) - OpenAPI documentation
- [Module Specifications](./modules/) - Feature documentation
- [RBAC Implementation](../../src/lib/rbac.ts) - Access control code
- [Routes Configuration](../../src/lib/routes.ts) - Route definitions

---

Last updated: 2025-10-06
