# NextAuth.js Code Examples

Practical examples for common authentication scenarios in the SPYMEO platform.

## Table of Contents

1. [Server Components](#server-components)
2. [Client Components](#client-components)
3. [API Routes](#api-routes)
4. [Forms and Actions](#forms-and-actions)
5. [Advanced Patterns](#advanced-patterns)

## Server Components

### Basic Protected Page

```typescript
// src/app/pro/dashboard/page.tsx
import { requireAuth } from "@/lib/auth/auth-helpers";

export default async function DashboardPage() {
  // Automatically redirects if not authenticated
  const user = await requireAuth();

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### Role-Protected Page

```typescript
// src/app/admin/page.tsx
import { requireRole } from "@/lib/auth/auth-helpers";

export default async function AdminPage() {
  // Automatically redirects if not ADMIN
  const user = await requireRole(["ADMIN"]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}</p>
    </div>
  );
}
```

### Multi-Role Protection

```typescript
// src/app/pro/commun/messages/page.tsx
import { requireRole } from "@/lib/auth/auth-helpers";

export default async function MessagesPage() {
  // Allow multiple professional roles
  const user = await requireRole([
    "PRACTITIONER",
    "ARTISAN",
    "COMMERCANT",
    "CENTER",
    "ADMIN",
  ]);

  return <MessagesComponent currentUser={user} />;
}
```

### Conditional Content Based on Role

```typescript
// src/app/pro/dashboard/page.tsx
import { getCurrentUser, hasRole } from "@/lib/auth/auth-helpers";

export default async function ProDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const canAccessStats = await hasRole(["PRACTITIONER", "ADMIN"]);
  const canAccessProducts = await hasRole(["ARTISAN", "COMMERCANT"]);

  return (
    <div>
      <h1>Professional Dashboard</h1>

      {canAccessStats && <StatsWidget />}
      {canAccessProducts && <ProductsWidget />}

      {user.role === "PRACTITIONER" && <ClientsWidget />}
      {user.role === "CENTER" && <FormationsWidget />}
    </div>
  );
}
```

### Optional Authentication

```typescript
// src/app/blog/page.tsx
import { getCurrentUser } from "@/lib/auth/auth-helpers";

export default async function BlogPage() {
  // User might or might not be logged in
  const user = await getCurrentUser();

  return (
    <div>
      <h1>Blog</h1>
      {user ? (
        <p>Welcome back, {user.name}!</p>
      ) : (
        <p>
          <a href="/auth/login">Log in</a> to bookmark articles
        </p>
      )}
      <ArticleList />
    </div>
  );
}
```

## Client Components

### Basic Client Authentication

```typescript
// src/components/UserProfile.tsx
"use client";

import { useSession } from "@/lib/auth/use-session";

export function UserProfile() {
  const { user, isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your profile</div>;
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      {user.avatar && <img src={user.avatar} alt={user.name} />}
    </div>
  );
}
```

### Role-Based UI

```typescript
// src/components/Navigation.tsx
"use client";

import { useRole } from "@/lib/auth/use-session";

export function Navigation() {
  const { isAdmin, isPro, hasRole } = useRole();

  return (
    <nav>
      <a href="/">Home</a>

      {isPro && <a href="/pro/dashboard">Pro Dashboard</a>}

      {hasRole(["PRACTITIONER"]) && (
        <>
          <a href="/pro/praticien/agenda">Agenda</a>
          <a href="/pro/praticien/fiches-clients">Clients</a>
        </>
      )}

      {hasRole(["ARTISAN", "COMMERCANT"]) && (
        <a href="/pro/catalogue">Catalogue</a>
      )}

      {isAdmin && <a href="/admin">Admin Panel</a>}
    </nav>
  );
}
```

### Login Form

```typescript
// src/components/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-session";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ email, password });

      if (result?.ok) {
        router.push("/pro/dashboard");
        router.refresh();
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
```

### Logout Button

```typescript
// src/components/LogoutButton.tsx
"use client";

import { useAuth } from "@/lib/auth/use-session";

export function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout("/");
  };

  return <button onClick={handleLogout}>Log Out</button>;
}
```

### Protected Client Component

```typescript
// src/components/AdminPanel.tsx
"use client";

import { useRequireRole } from "@/lib/auth/use-session";

export function AdminPanel() {
  const { isLoading } = useRequireRole(["ADMIN"]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Admin Panel</h2>
      <p>Only visible to admins</p>
      {/* Admin-only content */}
    </div>
  );
}
```

## API Routes

### Protected API Route

```typescript
// src/app/api/clients/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-helpers";

export async function GET(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Fetch user's clients
  const clients = await fetchClients(user.id);

  return NextResponse.json({ clients });
}
```

### Role-Protected API Route

```typescript
// src/app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-helpers";

export async function GET(req: Request) {
  const user = await getCurrentUser();

  // Check authentication
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check role
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  // Admin-only logic
  const users = await fetchAllUsers();

  return NextResponse.json({ users });
}
```

### Creating Resources with User Context

```typescript
// src/app/api/articles/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-helpers";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Only practitioners can submit articles
  if (user.role !== "PRACTITIONER") {
    return NextResponse.json(
      { error: "Only practitioners can submit articles" },
      { status: 403 }
    );
  }

  const body = await req.json();

  // Create article with user context
  const article = await createArticle({
    ...body,
    authorId: user.id,
    source: "PRACTITIONER",
    status: "SUBMITTED",
  });

  return NextResponse.json({ article }, { status: 201 });
}
```

## Forms and Actions

### Server Action with Authentication

```typescript
// src/app/actions/updateProfile.ts
"use server";

import { requireAuth } from "@/lib/auth/auth-helpers";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const user = await requireAuth();

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;

  // Update user profile
  await updateUserProfile(user.id, { name, bio });

  revalidatePath("/pro/compte");

  return { success: true };
}
```

### Form with Server Action

```typescript
// src/components/ProfileForm.tsx
import { updateProfile } from "@/app/actions/updateProfile";

export function ProfileForm({ user }) {
  return (
    <form action={updateProfile}>
      <div>
        <label>Name</label>
        <input
          type="text"
          name="name"
          defaultValue={user.name}
          required
        />
      </div>

      <div>
        <label>Bio</label>
        <textarea
          name="bio"
          defaultValue={user.profile?.bio}
        />
      </div>

      <button type="submit">Update Profile</button>
    </form>
  );
}
```

## Advanced Patterns

### Conditional Rendering with Multiple Checks

```typescript
// src/app/pro/dashboard/page.tsx
import { getCurrentUser, hasRole, isAdmin } from "@/lib/auth/auth-helpers";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/auth/login");

  const canManageClients = await hasRole(["PRACTITIONER"]);
  const canManageProducts = await hasRole(["ARTISAN", "COMMERCANT"]);
  const canManageFormations = await hasRole(["CENTER"]);
  const isAdminUser = await isAdmin();

  return (
    <div>
      <h1>Dashboard</h1>

      {canManageClients && <ClientsSection />}
      {canManageProducts && <ProductsSection />}
      {canManageFormations && <FormationsSection />}
      {isAdminUser && <AdminSection />}

      <GeneralSection user={user} />
    </div>
  );
}
```

### Session Refresh

```typescript
// src/components/ProfileEditor.tsx
"use client";

import { useSession } from "next-auth/react";
import { useSession as useCustomSession } from "@/lib/auth/use-session";

export function ProfileEditor() {
  const { data: session, update } = useSession();
  const { user } = useCustomSession();

  const handleUpdateProfile = async (newData: any) => {
    // Update profile in database
    await updateProfile(newData);

    // Refresh the session to get updated data
    await update({
      ...session,
      user: {
        ...session?.user,
        name: newData.name,
        avatar: newData.avatar,
      },
    });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleUpdateProfile({
        name: formData.get("name"),
        avatar: formData.get("avatar"),
      });
    }}>
      {/* Form fields */}
    </form>
  );
}
```

### Custom Session Hook with SWR

```typescript
// src/hooks/useAuthenticatedSWR.ts
"use client";

import useSWR from "swr";
import { useSession } from "@/lib/auth/use-session";

export function useAuthenticatedSWR<T>(url: string | null) {
  const { isAuthenticated } = useSession();

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  };

  return useSWR<T>(
    isAuthenticated ? url : null,
    fetcher
  );
}

// Usage
export function MyComponent() {
  const { data, error, isLoading } = useAuthenticatedSWR<{ clients: Client[] }>(
    "/api/clients"
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading clients</div>;
  if (!data) return null;

  return <ClientsList clients={data.clients} />;
}
```

### Redirect After Login

```typescript
// src/app/auth/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth/use-session";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useSession();
  const next = searchParams.get("next") || "/pro/dashboard";

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push(next);
    }
  }, [isAuthenticated, router, next]);

  if (isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div>
      <h1>Log In</h1>
      <LoginForm redirectTo={next} />
    </div>
  );
}
```

These examples cover most common authentication scenarios. Refer to the migration guide for more details and best practices.
