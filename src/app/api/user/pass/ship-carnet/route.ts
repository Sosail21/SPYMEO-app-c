import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  MOCK_PASS_SNAPSHOT,
  withComputedCarnet,
  type PassSnapshot,
  type CarnetShipmentStatus,
} from "@/lib/mockdb/pass";

/**
 * Cookie de simulation (déjà utilisé par les autres endpoints mock).
 * On y stocke un "partial" du snapshot (plan, active, monthsPaid, etc.)
 * + des overrides spécifiques au carnet.
 */
const COOKIE_KEY = "spy_pass_state";

/** Lecture du state partiel depuis le cookie (si existe) */
function readStateFromCookie(): Partial<PassSnapshot> & {
  carnetStatusOverride?: CarnetShipmentStatus;
  carnetEta?: string;
  carnetNote?: string;
  carnetTracking?: string;
} | null {
  try {
    const raw = cookies().get(COOKIE_KEY)?.value;
    return raw ? (JSON.parse(raw) as any) : null;
  } catch {
    return null;
  }
}

/** Écriture du state partiel dans le cookie (démo) */
function writeStateToCookie(partial: Partial<PassSnapshot> & {
  carnetStatusOverride?: CarnetShipmentStatus;
  carnetEta?: string;
  carnetNote?: string;
  carnetTracking?: string;
}) {
  cookies().set(COOKIE_KEY, JSON.stringify(partial), {
    httpOnly: false, // démo mock — en prod: true + secure
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30j
  });
}

/** Applique withComputedCarnet puis écrase avec d’éventuels overrides de carnet */
function mergeAndCompute(
  base: PassSnapshot,
  partial?: Partial<PassSnapshot> & {
    carnetStatusOverride?: CarnetShipmentStatus;
    carnetEta?: string;
    carnetNote?: string;
    carnetTracking?: string;
  }
): PassSnapshot {
  const merged: PassSnapshot = withComputedCarnet({
    ...base,
    ...(partial ?? {}),
  });

  // Overrides du carnet (si présents dans le cookie)
  if (partial?.carnetStatusOverride) {
    merged.carnet.status = partial.carnetStatusOverride;
  }
  if (typeof partial?.carnetEta === "string") {
    merged.carnet.eta = partial.carnetEta;
  }
  if (typeof partial?.carnetNote === "string") {
    merged.carnet.note = partial.carnetNote;
  }
  if (typeof partial?.carnetTracking === "string") {
    // Le type PassSnapshot du mock ne définit pas forcément tracking :
    // On le range dans note, ou vous pouvez étendre le type si besoin.
    const existing = merged.carnet.note ? merged.carnet.note + " — " : "";
    merged.carnet.note = `${existing}Tracking: ${partial.carnetTracking}`;
  }
  return merged;
}

/** Renvoie la prochaine étape "naturelle" d’expédition */
function nextStatus(s: CarnetShipmentStatus): CarnetShipmentStatus {
  switch (s) {
    case "PENDING":
      return "PROCESSING";
    case "PROCESSING":
      return "SHIPPED";
    case "SHIPPED":
      return "DELIVERED";
    case "DELIVERED":
    case "NOT_ELIGIBLE":
    default:
      return s;
  }
}

type Body =
  | {
      /** force l’étape cible (au lieu de simplement avancer) */
      target?: CarnetShipmentStatus;
      /** champs optionnels — utiles si target = SHIPPED/DELIVERED */
      eta?: string; // ISO
      note?: string;
      tracking?: string;
    }
  | undefined;

/**
 * POST /api/user/pass/ship-carnet
 * - Sans body: avance d’une étape (PENDING → PROCESSING → SHIPPED → DELIVERED).
 * - Avec { target }: force une étape précise (utile pour tester / debug).
 * - Enregistre les overrides (status/eta/note/tracking) dans le cookie.
 */
export async function POST(req: Request) {
  // État courant (cookie ou mock par défaut)
  const current = readStateFromCookie() || {};
  const snapshot = mergeAndCompute(MOCK_PASS_SNAPSHOT, current);

  if (!snapshot.active) {
    return NextResponse.json(
      { error: "PASS inactif : envoi du carnet non applicable." },
      { status: 400 }
    );
  }

  // Éligibilité basique (ex: mensuel < 6 mois => NOT_ELIGIBLE/PENDING selon votre logique mock)
  if (snapshot.plan === "MONTHLY" && (snapshot.monthsPaid ?? 0) < 6) {
    // Si le compute ne le met pas déjà en NOT_ELIGIBLE/PENDING, on bloque par sécurité
    if (snapshot.carnet.status === "NOT_ELIGIBLE") {
      return NextResponse.json(
        { error: "Non éligible : PASS mensuel avant 6 mois de cotisation." },
        { status: 400 }
      );
    }
  }

  let body: Body = undefined;
  try {
    body = (await req.json().catch(() => ({}))) as Body;
  } catch {
    // ignore
  }

  const currentStatus: CarnetShipmentStatus = snapshot.carnet.status;

  // Si déjà DELIVERED, rien à faire
  if (currentStatus === "DELIVERED") {
    return NextResponse.json({ pass: snapshot, message: "Carnet déjà livré." });
  }

  // Détermination du nouveau statut
  const newStatus: CarnetShipmentStatus =
    body?.target && body.target !== "NOT_ELIGIBLE"
      ? body.target
      : nextStatus(
          currentStatus === "NOT_ELIGIBLE" ? "PENDING" : currentStatus
        );

  // Construire le "partial" à persister
  const nextPartial: Partial<PassSnapshot> & {
    carnetStatusOverride?: CarnetShipmentStatus;
    carnetEta?: string;
    carnetNote?: string;
    carnetTracking?: string;
  } = {
    // on conserve plan/active/monthsPaid/startedAt/nextBillingAt déjà présents dans le cookie
    ...current,
    carnetStatusOverride: newStatus,
  };

  // Optionnels: eta/note/tracking
  if (typeof body?.eta === "string") nextPartial.carnetEta = body.eta;
  if (typeof body?.note === "string") nextPartial.carnetNote = body.note;
  if (typeof body?.tracking === "string") nextPartial.carnetTracking = body.tracking;

  writeStateToCookie(nextPartial);

  // Recalcule un snapshot complet prêt à afficher
  const updated = mergeAndCompute(MOCK_PASS_SNAPSHOT, nextPartial);
  return NextResponse.json({ pass: updated });
}
