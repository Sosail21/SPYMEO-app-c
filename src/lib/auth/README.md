# NextAuth.js Authentication System

Complete authentication system for the SPYMEO platform using NextAuth.js v4.

## Quick Start

### 1. Environment Setup

Create or update your `.env.local`:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Wrap Your App

```typescript
// src/app/layout.tsx
import { SessionProvider } from "@/lib/auth/SessionProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

### 3. Use in Your Components

**Server Component:**
```typescript
import { requireAuth } from "@/lib/auth/auth-helpers";

export default async function Page() {
  const user = await requireAuth();
  return <div>Hello {user.name}</div>;
}
```

**Client Component:**
```typescript
"use client";
import { useSession } from "@/lib/auth/use-session";

export function Component() {
  const { user, isAuthenticated } = useSession();
  return <div>{isAuthenticated ? user.name : "Guest"}</div>;
}
```

## File Structure

```
src/lib/auth/
├── README.md                 # This file
├── auth-config.ts           # NextAuth configuration
├── auth-helpers.ts          # Server-side utilities
├── use-session.ts           # Client-side hooks
├── SessionProvider.tsx      # Provider wrapper
├── session.ts               # Legacy session (kept for compatibility)
└── users.ts                 # User database (mock)

src/app/api/auth/
├── [...nextauth]/route.ts   # NextAuth API handler
├── login/route.ts           # Legacy login endpoint
├── logout/route.ts          # Legacy logout endpoint
└── signup/route.ts          # User registration

src/middleware.ts            # Authentication middleware

docs/
├── auth-migration.md        # Migration guide
└── auth-examples.md         # Code examples
```

## Core Concepts

### Session Management

NextAuth uses JWT (JSON Web Tokens) for session management:

- **Stateless**: No database required for sessions
- **Secure**: HTTPOnly cookies, automatic token rotation
- **Performant**: Fast session validation
- **Scalable**: Works across multiple servers

### User Roles

The system supports the following roles:

- `FREE_USER` - Free user account
- `PASS_USER` - Premium subscription user
- `PRACTITIONER` - Healthcare practitioner
- `ARTISAN` - Artisan/craftsperson
- `COMMERCANT` - Merchant
- `CENTER` - Training center
- `ADMIN` - Platform administrator

### Role Normalization

The system automatically handles accent variations:
- `COMMERÇANT` → `COMMERCANT`
- Case-insensitive comparisons

## Server-Side API

### Getting the Session

```typescript
import { getSession, getCurrentUser } from "@/lib/auth/auth-helpers";

// Get full session
const session = await getSession();
// { user: { id, name, email, role, avatar } }

// Get just the user
const user = await getCurrentUser();
// { id, name, email, role, avatar } | null
```

### Requiring Authentication

```typescript
import { requireAuth } from "@/lib/auth/auth-helpers";

// Redirects to login if not authenticated
const user = await requireAuth();

// With custom redirect
const user = await requireAuth("/custom-login");
```

### Role-Based Access

```typescript
import { requireRole, hasRole } from "@/lib/auth/auth-helpers";

// Require specific role(s) - redirects if unauthorized
const user = await requireRole(["ADMIN"]);
const user = await requireRole(["PRACTITIONER", "ARTISAN"]);

// Check role without redirect
const isAdmin = await hasRole(["ADMIN"]);
```

### Helper Functions

```typescript
import {
  isPro,
  isAdmin,
  getUserId,
  normalizeRole,
} from "@/lib/auth/auth-helpers";

// Check if user is a professional
const userIsPro = await isPro();

// Check if user is admin
const userIsAdmin = await isAdmin();

// Get just the user ID
const userId = await getUserId();

// Normalize role name
const role = normalizeRole("COMMERÇANT"); // "COMMERCANT"
```

### Password Utilities

```typescript
import { hashPassword, verifyPassword } from "@/lib/auth/auth-helpers";

// Hash a password (for signup)
const hashed = await hashPassword("myPassword123");

// Verify a password (for login)
const isValid = await verifyPassword("myPassword123", hashedPassword);
```

## Client-Side API

### Session Hook

```typescript
"use client";
import { useSession } from "@/lib/auth/use-session";

function Component() {
  const { session, user, isAuthenticated, isLoading, status } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Hello {user.name}</div>;
}
```

### Role Hook

```typescript
"use client";
import { useRole } from "@/lib/auth/use-session";

function Component() {
  const { hasRole, isAdmin, isPro, isPassUser, isFreeUser, role } = useRole();

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isPro && <ProFeatures />}
      {hasRole(["PRACTITIONER", "CENTER"]) && <AdvancedFeatures />}
    </div>
  );
}
```

### Auth Actions

```typescript
"use client";
import { useAuth } from "@/lib/auth/use-session";

function LoginForm() {
  const { login, logout } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const result = await login({ email, password });

    if (result?.ok) {
      // Success
    } else {
      // Error
    }
  };

  const handleLogout = async () => {
    await logout("/auth/login");
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
    </form>
  );
}
```

### Protected Components

```typescript
"use client";
import { useRequireAuth, useRequireRole } from "@/lib/auth/use-session";

function ProtectedComponent() {
  const { isLoading } = useRequireAuth();
  // Automatically redirects if not authenticated

  if (isLoading) return <div>Loading...</div>;
  return <div>Protected content</div>;
}

function AdminComponent() {
  const { isLoading } = useRequireRole(["ADMIN"]);
  // Automatically redirects if not admin

  if (isLoading) return <div>Loading...</div>;
  return <div>Admin content</div>;
}
```

## API Routes

### Protected API Route

```typescript
import { getCurrentUser } from "@/lib/auth/auth-helpers";

export async function GET(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Your logic here
  return Response.json({ data: "..." });
}
```

### Role-Protected API Route

```typescript
import { getCurrentUser } from "@/lib/auth/auth-helpers";

export async function DELETE(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  // Admin-only logic
  return Response.json({ success: true });
}
```

## Middleware

The middleware automatically protects routes based on path:

```typescript
// Automatically protected routes:
// /admin/*       - ADMIN only
// /pro/*         - PRO roles only
// /user/*        - Any authenticated user
// /pass/*        - Any authenticated user
```

Custom middleware configuration in `src/middleware.ts`.

## Session Data Structure

```typescript
{
  user: {
    id: string;           // User ID
    name: string;         // Full name
    email: string;        // Email address
    role: Role;           // User role
    avatar?: string;      // Avatar URL (optional)
  }
}
```

## Environment Variables

### Required

- `NEXTAUTH_SECRET` - Secret key for JWT encryption (required in production)

### Optional

- `NEXTAUTH_URL` - Base URL of the app (auto-detected in most cases)
- `NEXTAUTH_DEBUG` - Enable debug logging (development only)

Generate a secret:
```bash
openssl rand -base64 32
```

## Testing

### Run Tests

```bash
npm test                    # All tests
npm test auth              # Auth tests only
npm run test:coverage      # With coverage
```

### Test Files

- `tests/unit/lib/auth/auth-helpers.test.ts`
- `tests/integration/api/auth/nextauth.test.ts`
- `tests/integration/api/auth/signup.test.ts`

### Test Users

Available in development (see `src/lib/auth/users.ts`):

| Email | Password | Role |
|-------|----------|------|
| alice.free@spymeo.test | azerty123 | FREE_USER |
| paul.pass@spymeo.test | azerty123 | PASS_USER |
| leo.pro@spymeo.test | azerty123 | PRACTITIONER |
| emma.artisan@spymeo.test | azerty123 | ARTISAN |
| marc.commercant@spymeo.test | azerty123 | COMMERCANT |
| clara.centre@spymeo.test | azerty123 | CENTER |
| admin@spymeo.test | admin123 | ADMIN |

## Migration from Legacy System

See [docs/auth-migration.md](../../../docs/auth-migration.md) for a complete migration guide.

### Quick Migration

**Before:**
```typescript
import { getSessionUser } from "@/lib/auth/session";
const user = await getSessionUser();
```

**After:**
```typescript
import { getCurrentUser } from "@/lib/auth/auth-helpers";
const user = await getCurrentUser();
```

## Best Practices

### 1. Use Server-Side When Possible

Server components are more secure and don't expose session data to the client.

### 2. Handle Loading States

Always handle loading states in client components:

```typescript
const { user, isLoading } = useSession();
if (isLoading) return <Spinner />;
```

### 3. Use Type-Safe Helpers

Use the provided helpers instead of manual role checking:

```typescript
// ✅ Good
const userIsPro = await isPro();

// ❌ Avoid
const userIsPro = user?.role === "PRACTITIONER";
```

### 4. Protect API Routes

Always check authentication in API routes:

```typescript
const user = await getCurrentUser();
if (!user) return new Response("Unauthorized", { status: 401 });
```

## Troubleshooting

### Session Not Persisting

- Check that `SessionProvider` wraps your app
- Verify cookies are enabled in browser
- Check `NEXTAUTH_SECRET` is set

### Role Not Matching

- Use `normalizeRole()` for comparisons
- Check for accent variations (Ç vs C)

### Redirect Loop

- Check middleware matcher configuration
- Ensure protected routes don't redirect to themselves

## Documentation

- [Migration Guide](../../../docs/auth-migration.md)
- [Code Examples](../../../docs/auth-examples.md)
- [NextAuth.js Docs](https://next-auth.js.org)

## Support

For issues or questions:

1. Check this README
2. Review the migration guide
3. Check code examples
4. Consult NextAuth.js documentation

## License

Proprietary - SPYMEO Platform
