# NextAuth.js Authentication Migration Guide

This guide will help you migrate from the legacy cookie-based authentication to NextAuth.js in the SPYMEO platform.

## Table of Contents

1. [Overview](#overview)
2. [What Changed](#what-changed)
3. [Environment Setup](#environment-setup)
4. [Server-Side Migration](#server-side-migration)
5. [Client-Side Migration](#client-side-migration)
6. [API Routes Migration](#api-routes-migration)
7. [Testing](#testing)
8. [Rollback Plan](#rollback-plan)

## Overview

The SPYMEO platform has been upgraded from a simple cookie-based authentication system to **NextAuth.js v4**, providing:

- **Improved Security**: JWT-based sessions with automatic token rotation
- **Better Session Management**: Automatic refresh and expiration handling
- **Standardized API**: Industry-standard authentication patterns
- **Enhanced Developer Experience**: Built-in hooks and utilities
- **Backward Compatibility**: Legacy routes still work during migration

## What Changed

### Before (Legacy System)

```typescript
// Server Component
import { getSessionUser } from "@/lib/auth/session";

export default async function Page() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  return <div>Hello {user.name}</div>;
}
```

### After (NextAuth)

```typescript
// Server Component
import { requireAuth } from "@/lib/auth/auth-helpers";

export default async function Page() {
  const user = await requireAuth();
  return <div>Hello {user.name}</div>;
}
```

## Environment Setup

### 1. Install Dependencies

Dependencies are already installed:
- `next-auth@4.24.11`
- `bcrypt@6.0.0`
- `@types/bcrypt@6.0.0`

### 2. Environment Variables

Add to your `.env.local`:

```env
# NextAuth Secret (required in production)
NEXTAUTH_SECRET=your-secret-key-here

# NextAuth URL (optional, auto-detected in most cases)
NEXTAUTH_URL=http://localhost:3000

# Optional: Enable debug in development
NEXTAUTH_DEBUG=true
```

**Generate a secret:**
```bash
openssl rand -base64 32
```

### 3. Update Root Layout

Wrap your app with the SessionProvider:

```tsx
// src/app/layout.tsx
import { SessionProvider } from "@/lib/auth/SessionProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

## Server-Side Migration

### Getting the Current Session

**Before:**
```typescript
import { getSessionUser } from "@/lib/auth/session";

const user = await getSessionUser();
```

**After:**
```typescript
import { getSession, getCurrentUser } from "@/lib/auth/auth-helpers";

// Get full session
const session = await getSession();

// Or just get the user
const user = await getCurrentUser();
```

### Requiring Authentication

**Before:**
```typescript
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

const user = await getSessionUser();
if (!user) redirect("/auth/login");
```

**After:**
```typescript
import { requireAuth } from "@/lib/auth/auth-helpers";

// Automatically redirects if not authenticated
const user = await requireAuth();
```

### Role-Based Access Control

**Before:**
```typescript
const user = await getSessionUser();
if (!user || user.role !== "ADMIN") {
  redirect("/unauthorized");
}
```

**After:**
```typescript
import { requireRole } from "@/lib/auth/auth-helpers";

// Automatically redirects if not authorized
const user = await requireRole(["ADMIN"]);

// Or check multiple roles
const user = await requireRole(["ADMIN", "PRACTITIONER"]);
```

### Checking Roles Without Redirect

**Before:**
```typescript
const user = await getSessionUser();
const isAdmin = user?.role === "ADMIN";
```

**After:**
```typescript
import { hasRole, isAdmin, isPro } from "@/lib/auth/auth-helpers";

const userIsAdmin = await isAdmin();
const userIsPro = await isPro();
const hasAccess = await hasRole(["ADMIN", "PRACTITIONER"]);
```

## Client-Side Migration

### Using Session in Client Components

**Before:**
```typescript
// Not available - had to fetch manually
```

**After:**
```typescript
"use client";

import { useSession } from "@/lib/auth/use-session";

export function MyComponent() {
  const { session, user, isAuthenticated, isLoading } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Hello {user.name}</div>;
}
```

### Role Checking in Client Components

```typescript
"use client";

import { useRole } from "@/lib/auth/use-session";

export function AdminPanel() {
  const { isAdmin, hasRole } = useRole();

  if (!isAdmin) return <div>Access denied</div>;

  return <div>Admin panel content</div>;
}
```

### Login/Logout Actions

**Before:**
```typescript
// Manual fetch to /api/auth/login
const response = await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
```

**After:**
```typescript
"use client";

import { useAuth } from "@/lib/auth/use-session";

export function LoginForm() {
  const { login, logout } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    const result = await login({ email, password });

    if (result?.ok) {
      // Login successful
      router.push("/dashboard");
    } else {
      // Login failed
      setError("Invalid credentials");
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Protecting Client Components

```typescript
"use client";

import { useRequireAuth, useRequireRole } from "@/lib/auth/use-session";

export function ProtectedComponent() {
  // Redirects to login if not authenticated
  const { isLoading } = useRequireAuth();

  if (isLoading) return <div>Loading...</div>;

  return <div>Protected content</div>;
}

export function AdminOnlyComponent() {
  // Redirects if not admin
  const { isLoading } = useRequireRole(["ADMIN"]);

  if (isLoading) return <div>Loading...</div>;

  return <div>Admin content</div>;
}
```

## API Routes Migration

### Protecting API Routes

**Before:**
```typescript
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your logic here
}
```

**After:**
```typescript
import { getCurrentUser } from "@/lib/auth/auth-helpers";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your logic here
}
```

### Login Endpoint

**Before:**
```typescript
// POST /api/auth/login
```

**After:**
You can still use the legacy endpoint for backward compatibility, but for new code:

```typescript
// Use NextAuth built-in endpoint
// POST /api/auth/signin/credentials

// Or use the signIn() function in client code
import { signIn } from "next-auth/react";

const result = await signIn("credentials", {
  email,
  password,
  redirect: false,
});
```

### Logout Endpoint

**Before:**
```typescript
// GET/POST /api/auth/logout
```

**After:**
```typescript
// Use NextAuth built-in endpoint
// POST /api/auth/signout

// Or use the signOut() function in client code
import { signOut } from "next-auth/react";

await signOut({ callbackUrl: "/auth/login" });
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run auth-specific tests
npm test auth

# Run with coverage
npm run test:coverage
```

### Test Files

- `tests/unit/lib/auth/auth-helpers.test.ts` - Helper functions
- `tests/integration/api/auth/nextauth.test.ts` - NextAuth integration
- `tests/integration/api/auth/signup.test.ts` - Signup flow

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Access protected pages (should redirect if not authenticated)
- [ ] Access role-protected pages (should redirect if wrong role)
- [ ] Session persists after page reload
- [ ] Session expires after 7 days
- [ ] Client-side hooks work correctly

## Rollback Plan

If you need to rollback to the legacy system:

### 1. Restore Legacy Middleware

```typescript
// src/middleware.ts
import { COOKIE_NAME } from "@/lib/auth/session";

function getSession(req: NextRequest) {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = getSession(req);
  const role = session?.role?.toUpperCase();

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (pathname.startsWith("/pro")) {
    const proRoles = ["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER", "ADMIN"];
    if (!role || !proRoles.includes(role)) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}
```

### 2. Use Legacy Functions

```typescript
import { getSessionUser } from "@/lib/auth/session";

// Instead of
import { getCurrentUser } from "@/lib/auth/auth-helpers";
```

### 3. Remove SessionProvider

Remove the `<SessionProvider>` wrapper from your layout.

## Best Practices

### 1. Use Server-Side Authentication When Possible

Server components are more secure and don't expose session data to the client.

```typescript
// ✅ Good - Server Component
export default async function Page() {
  const user = await requireAuth();
  return <div>Hello {user.name}</div>;
}

// ❌ Avoid - Client Component (unless necessary)
"use client";
export default function Page() {
  const { user } = useSession();
  return <div>Hello {user?.name}</div>;
}
```

### 2. Handle Loading States

Always handle loading states in client components:

```typescript
const { user, isLoading } = useSession();

if (isLoading) return <Spinner />;
if (!user) return <LoginPrompt />;
```

### 3. Use Typed Session Data

TypeScript types are automatically inferred:

```typescript
const user = await getCurrentUser(); // Type: User | null
if (user) {
  user.role; // Type: "ADMIN" | "PRACTITIONER" | ...
}
```

### 4. Centralize Role Checks

Use the provided helpers instead of manual role checking:

```typescript
// ✅ Good
const userIsPro = await isPro();

// ❌ Avoid
const user = await getCurrentUser();
const userIsPro = ["PRACTITIONER", "ARTISAN", "COMMERCANT"].includes(user?.role);
```

## Common Issues

### Issue: "NEXTAUTH_SECRET" missing

**Solution:** Add `NEXTAUTH_SECRET` to your `.env.local`:
```env
NEXTAUTH_SECRET=your-secret-here
```

### Issue: Session not persisting

**Solution:** Check that SessionProvider is wrapping your app and cookies are enabled.

### Issue: Role not matching

**Solution:** Use `normalizeRole()` to handle accent variations (COMMERÇANT vs COMMERCANT).

### Issue: Redirect loop

**Solution:** Make sure protected routes aren't redirecting to themselves. Check middleware matcher config.

## Support

For questions or issues:

1. Check this migration guide
2. Review test files for examples
3. Check NextAuth.js documentation: https://next-auth.js.org
4. Contact the development team

## Migration Timeline

- **Phase 1** (Current): Dual system - both legacy and NextAuth work
- **Phase 2** (1 month): Deprecation warnings for legacy endpoints
- **Phase 3** (2 months): Remove legacy authentication system

Start migrating your code now to ensure a smooth transition!
