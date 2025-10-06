// src/app/api/user/pass/route.ts
// Updated to integrate with Stripe for subscription management

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { getSubscription } from "@/lib/services/stripe-service";
import {
  MOCK_PASS_SNAPSHOT,
  withComputedCarnet,
  type PassSnapshot,
  type CarnetShipmentStatus,
} from "@/lib/mockdb/pass";

const prisma = new PrismaClient();
const COOKIE_KEY = "spy_pass_state";

function mergeSnapshot(
  base: PassSnapshot,
  override: Partial<PassSnapshot> & {
    carnetStatusOverride?: CarnetShipmentStatus;
    carnetEta?: string;
    carnetNote?: string;
    carnetTracking?: string;
  }
): PassSnapshot {
  // 1) merge standard (plan, actif, dates…)
  let snap = withComputedCarnet({
    ...base,
    active: override.active ?? base.active,
    plan: override.plan ?? base.plan,
    startedAt: override.startedAt ?? base.startedAt,
    nextBillingAt: override.nextBillingAt ?? base.nextBillingAt,
    monthsPaid:
      typeof override.monthsPaid === "number"
        ? override.monthsPaid
        : base.monthsPaid,
  });

  // 2) appliquer les overrides carnet (mock progression)
  if (override.carnetStatusOverride) {
    snap.carnet.status = override.carnetStatusOverride;
  }
  if (typeof override.carnetEta === "string") {
    snap.carnet.eta = override.carnetEta;
  }
  if (typeof override.carnetNote === "string") {
    snap.carnet.note = override.carnetNote;
  }
  if (typeof override.carnetTracking === "string") {
    const existing = snap.carnet.note ? snap.carnet.note + " — " : "";
    snap.carnet.note = `${existing}Tracking: ${override.carnetTracking}`;
  }

  return snap;
}

export async function GET(req: Request) {
  try {
    // Get user ID from session/auth (simplified for demo)
    // In production, use proper authentication middleware
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      // Fallback to cookie-based mock for demo
      const raw = cookies().get(COOKIE_KEY)?.value;
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PassSnapshot> & {
          carnetStatusOverride?: CarnetShipmentStatus;
          carnetEta?: string;
          carnetNote?: string;
          carnetTracking?: string;
        };
        return NextResponse.json({
          pass: mergeSnapshot(MOCK_PASS_SNAPSHOT, parsed),
        });
      }
      return NextResponse.json({ pass: withComputedCarnet(MOCK_PASS_SNAPSHOT) });
    }

    // Get subscription from database
    const subscription = await prisma.passSubscription.findUnique({
      where: { userId },
      include: {
        resources: true,
        discounts: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No PASS subscription found" },
        { status: 404 }
      );
    }

    // If we have a Stripe subscription ID, sync with Stripe
    if (subscription.stripeSubscriptionId) {
      try {
        const stripeData = await getSubscription(
          subscription.stripeSubscriptionId
        );

        if (stripeData) {
          // Update subscription with latest Stripe data
          await prisma.passSubscription.update({
            where: { id: subscription.id },
            data: {
              active: stripeData.status === "active",
              plan: stripeData.plan,
              stripePriceId: stripeData.priceId,
              stripeCurrentPeriodEnd: stripeData.currentPeriodEnd,
              nextBillingAt: stripeData.cancelAtPeriodEnd
                ? null
                : stripeData.currentPeriodEnd,
            },
          });

          // Refresh subscription data
          const updatedSubscription = await prisma.passSubscription.findUnique({
            where: { userId },
            include: {
              resources: true,
              discounts: true,
            },
          });

          if (updatedSubscription) {
            return NextResponse.json({
              pass: mapSubscriptionToSnapshot(updatedSubscription),
            });
          }
        }
      } catch (error) {
        console.error("Error syncing with Stripe:", error);
        // Continue with database data if Stripe sync fails
      }
    }

    // Return subscription data
    return NextResponse.json({
      pass: mapSubscriptionToSnapshot(subscription),
    });
  } catch (error) {
    console.error("Error in GET /api/user/pass:", error);
    return NextResponse.json(
      { error: "Failed to fetch PASS subscription" },
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
    resources:
      subscription.resources?.map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        month: r.month,
        description: r.description,
        url: r.url,
        availableFrom: r.availableFrom.toISOString(),
      })) || [],
    discounts:
      subscription.discounts?.map((d: any) => ({
        id: d.id,
        kind: d.kind,
        name: d.name,
        city: d.city,
        rate: d.rate,
        href: d.href,
      })) || [],
    carnet: {
      status: subscription.carnetStatus,
      note: subscription.carnetNote,
      eta: subscription.carnetEta?.toISOString(),
    },
  };
}
