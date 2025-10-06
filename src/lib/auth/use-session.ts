// src/lib/auth/use-session.ts
// Client-side hooks for NextAuth session management
// Provides easy access to session data in React components

"use client";

import { useSession as useNextAuthSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";

/**
 * Custom hook for accessing session data
 * Wrapper around NextAuth's useSession with additional utilities
 *
 * Usage:
 *   const { session, user, isAuthenticated, isLoading } = useSession();
 */
export function useSession() {
  const { data: session, status } = useNextAuthSession();

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    status,
  };
}

/**
 * Check if user has specific role(s)
 *
 * Usage:
 *   const { hasRole, isAdmin, isPro } = useRole();
 *   if (hasRole(['ADMIN', 'PRACTITIONER'])) { ... }
 */
export function useRole() {
  const { user } = useSession();

  const hasRole = (
    roles: Array<
      | "FREE_USER"
      | "PASS_USER"
      | "PRACTITIONER"
      | "ARTISAN"
      | "COMMERÇANT"
      | "COMMERCANT"
      | "CENTER"
      | "ADMIN"
    >
  ): boolean => {
    if (!user) return false;

    const normalizedRole = user.role.toUpperCase().replace("Ç", "C");
    const normalizedRoles = roles.map((r) =>
      r.toUpperCase().replace("Ç", "C")
    );

    return normalizedRoles.includes(normalizedRole as any);
  };

  const isAdmin = user?.role === "ADMIN";
  const isPro =
    user &&
    [
      "PRACTITIONER",
      "ARTISAN",
      "COMMERCANT",
      "COMMERÇANT",
      "CENTER",
      "ADMIN",
    ].includes(user.role);
  const isPassUser = user?.role === "PASS_USER";
  const isFreeUser = user?.role === "FREE_USER";

  return {
    hasRole,
    isAdmin,
    isPro,
    isPassUser,
    isFreeUser,
    role: user?.role ?? null,
  };
}

/**
 * Authentication actions
 *
 * Usage:
 *   const { login, logout } = useAuth();
 *   await login({ email, password });
 *   await logout();
 */
export function useAuth() {
  const login = async (credentials: { email: string; password: string }) => {
    const result = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    return result;
  };

  const logout = async (callbackUrl?: string) => {
    await signOut({ callbackUrl: callbackUrl ?? "/auth/login" });
  };

  return {
    login,
    logout,
  };
}

/**
 * Require authentication hook
 * Redirects to login if not authenticated
 *
 * Usage in client components:
 *   useRequireAuth(); // redirects if not authenticated
 */
export function useRequireAuth(redirectTo?: string) {
  const { isAuthenticated, isLoading } = useSession();

  if (!isLoading && !isAuthenticated) {
    const loginUrl = redirectTo
      ? `/auth/login?next=${encodeURIComponent(redirectTo)}`
      : "/auth/login";

    if (typeof window !== "undefined") {
      window.location.href = loginUrl;
    }
  }

  return { isAuthenticated, isLoading };
}

/**
 * Require specific role(s) hook
 * Redirects to login or unauthorized if not authorized
 *
 * Usage in client components:
 *   useRequireRole(['ADMIN']); // redirects if not admin
 */
export function useRequireRole(
  roles: Array<
    | "FREE_USER"
    | "PASS_USER"
    | "PRACTITIONER"
    | "ARTISAN"
    | "COMMERÇANT"
    | "COMMERCANT"
    | "CENTER"
    | "ADMIN"
  >
) {
  const { hasRole } = useRole();
  const { isAuthenticated, isLoading } = useSession();

  if (!isLoading && !isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }

  if (!isLoading && isAuthenticated && !hasRole(roles)) {
    if (typeof window !== "undefined") {
      window.location.href = "/unauthorized";
    }
  }

  return { isLoading };
}
