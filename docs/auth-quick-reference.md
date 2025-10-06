# NextAuth Quick Reference

One-page reference for common authentication tasks.

## Server Components (Recommended)

### Basic Authentication
```typescript
import { requireAuth } from "@/lib/auth/auth-helpers";

export default async function Page() {
  const user = await requireAuth(); // Auto-redirects if not authenticated
  return <div>Hello {user.name}</div>;
}
```

### Role Protection
```typescript
import { requireRole } from "@/lib/auth/auth-helpers";

export default async function AdminPage() {
  const user = await requireRole(["ADMIN"]); // Auto-redirects if not admin
  return <div>Admin content</div>;
}
```

### Optional Authentication
```typescript
import { getCurrentUser } from "@/lib/auth/auth-helpers";

export default async function Page() {
  const user = await getCurrentUser(); // null if not authenticated
  return user ? <div>Hello {user.name}</div> : <div>Welcome guest</div>;
}
```

### Multiple Roles
```typescript
import { requireRole } from "@/lib/auth/auth-helpers";

export default async function ProPage() {
  const user = await requireRole(["PRACTITIONER", "ARTISAN", "COMMERCANT"]);
  return <div>Professional content</div>;
}
```

### Conditional Content
```typescript
import { hasRole } from "@/lib/auth/auth-helpers";

export default async function Page() {
  const canEdit = await hasRole(["ADMIN", "PRACTITIONER"]);
  return canEdit ? <EditButton /> : <ViewOnlyContent />;
}
```

## Client Components

### Basic Hook
```typescript
"use client";
import { useSession } from "@/lib/auth/use-session";

export function Component() {
  const { user, isAuthenticated, isLoading } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Hello {user.name}</div>;
}
```

### Role Check
```typescript
"use client";
import { useRole } from "@/lib/auth/use-session";

export function Component() {
  const { isAdmin, isPro, hasRole } = useRole();

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isPro && <ProFeatures />}
      {hasRole(["PRACTITIONER"]) && <ClientManagement />}
    </div>
  );
}
```

### Login Form
```typescript
"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth/use-session";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await login({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (result?.ok) {
      router.push("/pro/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {error && <div>{error}</div>}
      <button type="submit">Log In</button>
    </form>
  );
}
```

### Logout Button
```typescript
"use client";
import { useAuth } from "@/lib/auth/use-session";

export function LogoutButton() {
  const { logout } = useAuth();
  return <button onClick={() => logout()}>Log Out</button>;
}
```

### Protected Component
```typescript
"use client";
import { useRequireAuth } from "@/lib/auth/use-session";

export function ProtectedComponent() {
  const { isLoading } = useRequireAuth(); // Auto-redirects if not authenticated

  if (isLoading) return <div>Loading...</div>;
  return <div>Protected content</div>;
}
```

## API Routes

### Basic Protection
```typescript
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: "..." });
}
```

### Role Protection
```typescript
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Admin logic here
  return NextResponse.json({ success: true });
}
```

### User Context
```typescript
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Create resource with user context
  const resource = await createResource({
    ...body,
    ownerId: user.id,
  });

  return NextResponse.json({ resource });
}
```

## Environment Setup

### .env.local
```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Generate Secret
```bash
openssl rand -base64 32
```

### Root Layout
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

## User Roles

| Role | Description |
|------|-------------|
| FREE_USER | Free user account |
| PASS_USER | Premium subscription |
| PRACTITIONER | Healthcare practitioner |
| ARTISAN | Artisan/craftsperson |
| COMMERCANT | Merchant |
| CENTER | Training center |
| ADMIN | Platform admin |

## Common Patterns

### Dashboard with Role-Specific Content
```typescript
import { requireAuth, hasRole } from "@/lib/auth/auth-helpers";

export default async function Dashboard() {
  const user = await requireAuth();

  const canManageClients = await hasRole(["PRACTITIONER"]);
  const canManageProducts = await hasRole(["ARTISAN", "COMMERCANT"]);

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      {canManageClients && <ClientsSection />}
      {canManageProducts && <ProductsSection />}
    </div>
  );
}
```

### Navigation with Role-Based Links
```typescript
"use client";
import { useRole } from "@/lib/auth/use-session";

export function Navigation() {
  const { isAdmin, isPro, hasRole } = useRole();

  return (
    <nav>
      <a href="/">Home</a>
      {isPro && <a href="/pro/dashboard">Dashboard</a>}
      {hasRole(["PRACTITIONER"]) && <a href="/pro/praticien/agenda">Agenda</a>}
      {isAdmin && <a href="/admin">Admin</a>}
    </nav>
  );
}
```

### Form with Server Action
```typescript
// Server Action
"use server";
import { requireAuth } from "@/lib/auth/auth-helpers";

export async function updateProfile(formData: FormData) {
  const user = await requireAuth();
  await updateUser(user.id, {
    name: formData.get("name") as string,
  });
}

// Component
export function ProfileForm() {
  return (
    <form action={updateProfile}>
      <input name="name" required />
      <button type="submit">Update</button>
    </form>
  );
}
```

## Test Users (Development)

| Email | Password | Role |
|-------|----------|------|
| admin@spymeo.test | admin123 | ADMIN |
| leo.pro@spymeo.test | azerty123 | PRACTITIONER |
| emma.artisan@spymeo.test | azerty123 | ARTISAN |
| marc.commercant@spymeo.test | azerty123 | COMMERCANT |
| clara.centre@spymeo.test | azerty123 | CENTER |
| paul.pass@spymeo.test | azerty123 | PASS_USER |
| alice.free@spymeo.test | azerty123 | FREE_USER |

## Troubleshooting

### Session not working?
1. Check SessionProvider wraps your app
2. Verify NEXTAUTH_SECRET is set
3. Check cookies are enabled

### Role not matching?
```typescript
import { normalizeRole } from "@/lib/auth/auth-helpers";
const role = normalizeRole("COMMERÇANT"); // "COMMERCANT"
```

### Redirect loop?
- Check middleware matcher configuration
- Ensure protected routes don't redirect to themselves

## Documentation Links

- [Migration Guide](./auth-migration.md)
- [Code Examples](./auth-examples.md)
- [API Reference](../src/lib/auth/README.md)
- [NextAuth Docs](https://next-auth.js.org)
