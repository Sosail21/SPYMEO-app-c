// src/app/api/auth/[...nextauth]/route.ts
// NextAuth.js API route handler
// Handles all authentication requests: /api/auth/signin, /api/auth/signout, etc.

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
