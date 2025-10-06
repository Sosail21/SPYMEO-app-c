// src/app/api/user/pass/toggle-plan/route.ts
// Updated to use Stripe API for plan changes

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { updateSubscriptionPlan } from "@/lib/services/stripe-service";
import {
  MOCK_PASS_SNAPSHOT,
  withComputedCarnet,
  type PassSnapshot,
  type PassPlan,
} from "@/lib/mockdb/pass";

const prisma = new PrismaClient();
const COOKIE_KEY = "spy_pass_state";

// util: normalise une date ISO (simple helper)
function iso(d: Date) {
  return d.toISOString();
}

function readStateFromCookie(): Partial<PassSnapshot> | null {
  try {
    const raw = cookies().get(COOKIE_KEY)?.value;
    return raw ? (JSON.parse(raw) as Partial<PassSnapshot>) : null;
  } catch {
    return null;
  }
}

function writeStateToCookie(partial: Partial<PassSnapshot>) {
  cookies().set(COOKIE_KEY, JSON.stringify(partial), {
    httpOnly: false, // pour la démo; en prod: true + secure
    secure: false,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
}

export async function POST(req: Request) {
  try {
    // Parse request body
    let desired: "MONTHLY" | "ANNUAL" | undefined;
    try {
      const body = await req.json().catch(() => ({}));
      if (body && (body.plan === "ANNUAL" || body.plan === "MONTHLY")) {
        desired = body.plan;
      }
    } catch {
      /* ignore */
    }

    // Get user ID from session/auth (simplified for demo)
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      // Fallback to cookie-based mock for demo
      const current = readStateFromCookie() || {};
      const base = {
        ...MOCK_PASS_SNAPSHOT,
        ...current,
      } as PassSnapshot;

      if (!base.active) {
        return NextResponse.json(
          { error: "PASS inactif : impossible de changer la formule." },
          { status: 400 }
        );
      }

      const nextPlan: PassPlan =
        desired ?? (base.plan === "ANNUAL" ? "MONTHLY" : "ANNUAL");

      let nextNextBillingAt: string | undefined = base.nextBillingAt;
      let nextMonthsPaid = base.monthsPaid;

      if (nextPlan === "ANNUAL") {
        nextNextBillingAt = undefined;
      } else {
        const ref = base.nextBillingAt ? new Date(base.nextBillingAt) : new Date();
        const plus30 = new Date(ref);
        plus30.setDate(plus30.getDate() + 30);
        nextNextBillingAt = iso(plus30);
      }

      const partial: Partial<PassSnapshot> = {
        active: true,
        plan: nextPlan,
        monthsPaid: nextMonthsPaid,
        startedAt: base.startedAt,
        nextBillingAt: nextNextBillingAt,
      };

      writeStateToCookie(partial);

      const updated = withComputedCarnet({
        ...MOCK_PASS_SNAPSHOT,
        ...partial,
      });

      return NextResponse.json({ pass: updated });
    }

    // Get subscription from database
    const subscription = await prisma.passSubscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No PASS subscription found" },
        { status: 404 }
      );
    }

    if (!subscription.active) {
      return NextResponse.json(
        { error: "PASS inactif : impossible de changer la formule." },
        { status: 400 }
      );
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No Stripe subscription found" },
        { status: 400 }
      );
    }

    // Determine target plan
    const targetPlan: "MONTHLY" | "ANNUAL" =
      desired ?? (subscription.plan === "ANNUAL" ? "MONTHLY" : "ANNUAL");

    // If already on target plan, return current state
    if (subscription.plan === targetPlan) {
      return NextResponse.json({
        pass: mapSubscriptionToSnapshot(subscription),
        message: "Already on this plan",
      });
    }

    // Update subscription in Stripe
    try {
      const stripeSubscription = await updateSubscriptionPlan(
        subscription.stripeSubscriptionId,
        targetPlan
      );

      // Update in database
      const updatedSubscription = await prisma.passSubscription.update({
        where: { id: subscription.id },
        data: {
          plan: targetPlan,
          stripePriceId: stripeSubscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            stripeSubscription.current_period_end * 1000
          ),
          nextBillingAt: stripeSubscription.cancel_at_period_end
            ? null
            : new Date(stripeSubscription.current_period_end * 1000),
          // Update carnet status if switching to annual
          carnetStatus:
            targetPlan === "ANNUAL" && subscription.carnetStatus === "NOT_ELIGIBLE"
              ? "PENDING"
              : subscription.carnetStatus,
        },
      });

      return NextResponse.json({
        pass: mapSubscriptionToSnapshot(updatedSubscription),
        message: `Plan successfully changed to ${targetPlan}`,
      });
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      return NextResponse.json(
        { error: "Failed to update subscription plan" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/user/pass/toggle-plan:", error);
    return NextResponse.json(
      { error: "Failed to change plan" },
      { status: 500 }
    );
  }
}

// Helper to map database subscription to PassSnapshot format
function mapSubscriptionToSnapshot(subscription: any): PassSnapshot {
  return {
    active: subscription.active,
    plan: subscription.plan,
    startedAt: subscription.startedAt.toISOString(),
    nextBillingAt: subscription.nextBillingAt?.toISOString(),
    monthsPaid: subscription.monthsPaid,
    resources: [],
    discounts: [],
    carnet: {
      status: subscription.carnetStatus,
      note: subscription.carnetNote,
      eta: subscription.carnetEta?.toISOString(),
    },
  };
}
