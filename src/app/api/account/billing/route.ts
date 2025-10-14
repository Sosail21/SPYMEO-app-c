// Cdw-Spm
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { updatePaymentMethod, getBillingForUser } from "@/lib/db/billing";

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const b = await getBillingForUser(me.id);
  return NextResponse.json(b);
}

export async function PUT(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { paymentMethodId } = await req.json();
  // simulate decoding paymentMethodId → card meta
  const last4 = paymentMethodId?.slice(-4) || "9999";
  const next = await updatePaymentMethod(me.id, { brand: "visa", last4, expMonth: 12, expYear: 29 });
  return NextResponse.json(next);
}
