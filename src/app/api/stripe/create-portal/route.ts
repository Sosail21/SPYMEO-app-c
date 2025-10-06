// API Route: Create Stripe Customer Portal Session
// POST /api/stripe/create-portal

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPortalSession } from "@/lib/services/stripe-service";

// Request validation schema
const CreatePortalSchema = z.object({
  stripeCustomerId: z.string().min(1),
  returnUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validated = CreatePortalSchema.parse(body);

    // Create portal session
    const session = await createPortalSession({
      stripeCustomerId: validated.stripeCustomerId,
      returnUrl: validated.returnUrl,
    });

    // Return session URL for redirect
    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Error in create-portal route:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
