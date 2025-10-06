// API Route: Create Stripe Checkout Session
// POST /api/stripe/create-checkout

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession } from "@/lib/services/stripe-service";

// Request validation schema
const CreateCheckoutSchema = z.object({
  plan: z.enum(["MONTHLY", "ANNUAL"]),
  userId: z.string().min(1),
  userEmail: z.string().email(),
  userName: z.string().min(1),
  stripeCustomerId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validated = CreateCheckoutSchema.parse(body);

    // Create checkout session
    const session = await createCheckoutSession({
      plan: validated.plan,
      userId: validated.userId,
      userEmail: validated.userEmail,
      userName: validated.userName,
      stripeCustomerId: validated.stripeCustomerId,
    });

    // Return session URL for redirect
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error in create-checkout route:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
