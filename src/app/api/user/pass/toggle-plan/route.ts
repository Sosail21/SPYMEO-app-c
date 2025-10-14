// Cdw-Spm
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  MOCK_PASS_SNAPSHOT,
  withComputedCarnet,
  type PassSnapshot,
  type PassPlan,
} from "@/lib/mockdb/pass";

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
  // Body optionnel : { plan?: "ANNUAL" | "MONTHLY" }
  // si absent → on toggle
  let desired: PassPlan | undefined;

  try {
    const body = await req.json().catch(() => ({}));
    if (body && (body.plan === "ANNUAL" || body.plan === "MONTHLY")) {
      desired = body.plan;
    }
  } catch {
    /* ignore */
  }

  // État courant (cookie → sinon mock)
  const current = readStateFromCookie() || {};
  const base = {
    ...MOCK_PASS_SNAPSHOT,
    ...current,
  } as PassSnapshot;

  if (!base.active) {
    // PASS inactif : on refuse (ou on pourrait l’activer via un autre endpoint)
    return NextResponse.json(
      { error: "PASS inactif : impossible de changer la formule." },
      { status: 400 }
    );
  }

  // Détermination de la cible
  const nextPlan: PassPlan =
    desired ?? (base.plan === "ANNUAL" ? "MONTHLY" : "ANNUAL");

  // Petite logique de dates pour la démo :
  // - si on passe en ANNUAL : on supprime nextBillingAt (annuel payé d'avance),
  //   monthsPaid >= monthsPaid actuel
  // - si on passe en MONTHLY : on (re)définit nextBillingAt à J+30
  let nextNextBillingAt: string | undefined = base.nextBillingAt;
  let nextMonthsPaid = base.monthsPaid;

  if (nextPlan === "ANNUAL") {
    nextNextBillingAt = undefined;
    // on garde l'historique monthsPaid, éventuellement on peut le min/maxer
  } else {
    // plan mensuel : prochain prélèvement ~ +30 jours
    const ref = base.nextBillingAt ? new Date(base.nextBillingAt) : new Date();
    const plus30 = new Date(ref);
    plus30.setDate(plus30.getDate() + 30);
    nextNextBillingAt = iso(plus30);
  }

  const partial: Partial<PassSnapshot> = {
    active: true,
    plan: nextPlan,
    monthsPaid: nextMonthsPaid,
    startedAt: base.startedAt, // inchangé
    nextBillingAt: nextNextBillingAt,
  };

  writeStateToCookie(partial);

  const updated = withComputedCarnet({
    ...MOCK_PASS_SNAPSHOT,
    ...partial,
  });

  return NextResponse.json({ pass: updated });
}
