// src/app/api/auth/signup/route.ts
// User registration endpoint
// Creates new user account and returns success status

import { NextResponse } from "next/server";
import { USERS, findUserByEmail } from "@/lib/auth/users";
import { hashPassword } from "@/lib/auth/auth-helpers";
import { z } from "zod";

// Validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z
    .enum([
      "FREE_USER",
      "PASS_USER",
      "PRACTITIONER",
      "ARTISAN",
      "COMMERÇANT",
      "COMMERCANT",
      "CENTER",
    ])
    .optional()
    .default("FREE_USER"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          ok: false,
          error: "Un utilisateur avec cet email existe déjà",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    // Note: In a real application, this would be saved to a database
    // For now, we'll add it to the in-memory USERS array
    const newUser = {
      id: `u${USERS.length + 1}`,
      name,
      email,
      password: hashedPassword,
      role: role as any,
    };

    USERS.push(newUser);

    // Return success (without password)
    return NextResponse.json({
      ok: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("[Signup Error]", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Une erreur est survenue lors de l'inscription",
      },
      { status: 500 }
    );
  }
}
