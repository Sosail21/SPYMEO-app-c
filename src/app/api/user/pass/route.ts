// src/app/api/user/pass/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  MOCK_PASS_SNAPSHOT,
  withComputedCarnet,
  type PassSnapshot,
  type PassPlan,
  type CarnetShipmentStatus,
} from "@/lib/mockdb/pass";

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
    plan: (override.plan as PassPlan) ?? base.plan,
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

export async function GET() {
  try {
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
  } catch {
    // ignore parse error → fallback
  }

  return NextResponse.json({ pass: withComputedCarnet(MOCK_PASS_SNAPSHOT) });
}
