// src/lib/auth/auth-config.ts
// NextAuth.js configuration for SPYMEO platform
// Supports credentials-based authentication with JWT strategy

import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, type UserRecord } from "./users";
import { verifyPassword } from "./auth-helpers";

// Extend NextAuth types to include our custom role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role:
        | "FREE_USER"
        | "PASS_USER"
        | "PRACTITIONER"
        | "ARTISAN"
        | "COMMERÇANT"
        | "COMMERCANT"
        | "CENTER"
        | "ADMIN";
      avatar?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role:
      | "FREE_USER"
      | "PASS_USER"
      | "PRACTITIONER"
      | "ARTISAN"
      | "COMMERÇANT"
      | "COMMERCANT"
      | "CENTER"
      | "ADMIN";
    avatar?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role:
      | "FREE_USER"
      | "PASS_USER"
      | "PRACTITIONER"
      | "ARTISAN"
      | "COMMERÇANT"
      | "COMMERCANT"
      | "CENTER"
      | "ADMIN";
    avatar?: string;
  }
}

/**
 * NextAuth configuration object
 * Uses JWT strategy for session management
 * Supports credentials-based authentication
 */
export const authOptions: NextAuthOptions = {
  // Use JWT strategy (no database required for sessions)
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (matching old cookie)
  },

  // Authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "votre@email.com",
        },
        password: {
          label: "Mot de passe",
          type: "password",
        },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = findUserByEmail(credentials.email);
        if (!user) {
          return null;
        }

        // Verify password
        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );
        if (!isValid) {
          return null;
        }

        // Return user object (without password)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],

  // Custom pages
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login", // Error code passed in query string as ?error=
    newUser: "/auth/signup", // New users will be directed here on first sign in
  },

  // Callbacks
  callbacks: {
    /**
     * JWT callback - called whenever a JWT is created or updated
     * Add custom fields to the token
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }

      // Update session (e.g., when calling update() from client)
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.avatar) token.avatar = session.avatar;
        if (session.role) token.role = session.role;
      }

      return token;
    },

    /**
     * Session callback - called whenever a session is checked
     * Add custom fields to the session
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
      }
      return session;
    },

    /**
     * Sign in callback - control if a user is allowed to sign in
     */
    async signIn({ user, account, profile }) {
      // You can add additional checks here
      // For example, check if user is banned, email is verified, etc.
      return true;
    },

    /**
     * Redirect callback - control where to redirect after sign in/out
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",

  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET || "spymeo-dev-secret-change-in-production",

  // Events (useful for logging)
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`[NextAuth] User signed in: ${user.email}`);
    },
    async signOut({ token, session }) {
      console.log(`[NextAuth] User signed out`);
    },
  },
};
