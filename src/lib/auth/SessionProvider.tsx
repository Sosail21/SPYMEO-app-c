// src/lib/auth/SessionProvider.tsx
// Client-side session provider wrapper for NextAuth
// Must be used in client components to access session

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Session Provider wrapper for NextAuth
 * Wrap your app with this component to enable session access
 *
 * Usage in layout.tsx:
 *   import { SessionProvider } from "@/lib/auth/SessionProvider";
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html>
 *         <body>
 *           <SessionProvider>
 *             {children}
 *           </SessionProvider>
 *         </body>
 *       </html>
 *     );
 *   }
 */
export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session} refetchInterval={5 * 60}>
      {children}
    </NextAuthSessionProvider>
  );
}
