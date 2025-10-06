// src/lib/auth/auth-helpers.ts
// Authentication helper functions for NextAuth.js
// Provides server-side utilities for session management and password hashing

import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

// Re-export the Session type for convenience
export type { Session } from "next-auth";

/**
 * Get the current session on the server side
 * Usage in Server Components:
 *   const session = await getSession();
 *   if (!session) redirect('/auth/login');
 *
 * @returns The current session or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

/**
 * Get the current user from the session
 * Returns null if not authenticated
 *
 * @returns The current user or null
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Require authentication - redirect to login if not authenticated
 * Usage in Server Components:
 *   const user = await requireAuth();
 *
 * @param redirectTo - Optional redirect URL after login
 * @returns The authenticated user (never returns if not authenticated)
 */
export async function requireAuth(redirectTo?: string) {
  const session = await getSession();

  if (!session) {
    const loginUrl = redirectTo
      ? `/auth/login?next=${encodeURIComponent(redirectTo)}`
      : "/auth/login";
    redirect(loginUrl);
  }

  return session.user;
}

/**
 * Require specific role(s) - redirect to login or error page if not authorized
 * Usage in Server Components:
 *   await requireRole(['ADMIN', 'PRACTITIONER']);
 *
 * @param roles - Array of allowed roles
 * @param redirectTo - Optional redirect URL after login
 * @returns The authenticated user with required role
 */
export async function requireRole(
  roles: Array<
    | "FREE_USER"
    | "PASS_USER"
    | "PRACTITIONER"
    | "ARTISAN"
    | "COMMERÇANT"
    | "COMMERCANT"
    | "CENTER"
    | "ADMIN"
  >,
  redirectTo?: string
) {
  const user = await requireAuth(redirectTo);

  // Normalize role (handle COMMERÇANT vs COMMERCANT)
  const normalizedRole = user.role.toUpperCase().replace("Ç", "C");
  const normalizedRoles = roles.map(r => r.toUpperCase().replace("Ç", "C"));

  if (!normalizedRoles.includes(normalizedRole as any)) {
    // User is authenticated but doesn't have required role
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Check if user has specific role(s)
 * Usage in Server Components:
 *   const isPro = await hasRole(['PRACTITIONER', 'ARTISAN']);
 *
 * @param roles - Array of roles to check
 * @returns true if user has one of the roles, false otherwise
 */
export async function hasRole(
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
): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  const normalizedRole = session.user.role.toUpperCase().replace("Ç", "C");
  const normalizedRoles = roles.map(r => r.toUpperCase().replace("Ç", "C"));

  return normalizedRoles.includes(normalizedRole as any);
}

/**
 * Hash a password using bcrypt
 * Usage:
 *   const hashed = await hashPassword('mypassword');
 *
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * Usage:
 *   const isValid = await verifyPassword('mypassword', hashedPassword);
 *
 * @param password - Plain text password
 * @param hashedPassword - Hashed password to compare against
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  // Handle plain text passwords from mock data (for development only)
  // In production, all passwords should be hashed
  if (!hashedPassword.startsWith("$2")) {
    console.warn("[Auth] Comparing plain text password - should be hashed in production");
    return password === hashedPassword;
  }

  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Normalize role name (handle accent variations)
 * COMMERÇANT -> COMMERCANT
 *
 * @param role - Role to normalize
 * @returns Normalized role
 */
export function normalizeRole(role: string): string {
  return role.toUpperCase().replace("Ç", "C");
}

/**
 * Check if user is a PRO (any professional role)
 *
 * @param session - Session to check (optional, will fetch if not provided)
 * @returns true if user is a PRO
 */
export async function isPro(session?: Session | null): Promise<boolean> {
  const s = session ?? await getSession();
  if (!s) return false;

  const proRoles = ["PRACTITIONER", "ARTISAN", "COMMERCANT", "CENTER", "ADMIN"];
  return proRoles.includes(normalizeRole(s.user.role));
}

/**
 * Check if user is an ADMIN
 *
 * @param session - Session to check (optional, will fetch if not provided)
 * @returns true if user is an ADMIN
 */
export async function isAdmin(session?: Session | null): Promise<boolean> {
  const s = session ?? await getSession();
  if (!s) return false;

  return normalizeRole(s.user.role) === "ADMIN";
}

/**
 * Get session user ID
 * Convenience function to get just the user ID
 *
 * @returns User ID or null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id ?? null;
}
