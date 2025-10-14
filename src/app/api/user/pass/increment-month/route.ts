// Cdw-Spm
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  MOCK_PASS_SNAPSHOT,
  withComputedCarnet,
  type PassSnapshot,
} from "@/lib/mockdb/pass";

const COOKIE_KEY = "spy_pass_state";

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
    httpOnly: false, // démo : en prod => true + secure
    secure: false,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
}

function addDays(isoStr: string | undefined, days: number): string | undefined {
  if (!isoStr) return undefined;
  const d = new Date(isoStr);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export async function POST() {
  // État courant (cookie -> sinon mock par défaut)
  const current = readStateFromCookie() || {};
  const base: PassSnapshot = {
    ...MOCK_PASS_SNAPSHOT,
    ...current,
  } as PassSnapshot;

  if (!base.active) {
    return NextResponse.json(
      { error: "PASS inactif : simulation non applicable." },
      { status: 400 }
    );
  }

  const nextMonthsPaid = (base.monthsPaid ?? 0) + 1;

  // Logique simple de cycle pour nextBillingAt (utile surtout en mensuel)
  const nextNextBillingAt =
    base.nextBillingAt ? addDays(base.nextBillingAt, 30) : undefined;

  const partial: Partial<PassSnapshot> = {
    active: true,
    plan: base.plan,
    startedAt: base.startedAt,
    monthsPaid: nextMonthsPaid,
    nextBillingAt: nextNextBillingAt,
  };

  writeStateToCookie(partial);

  const updated = withComputedCarnet({
    ...MOCK_PASS_SNAPSHOT,
    ...partial,
  });

  return NextResponse.json({ pass: updated });
}
