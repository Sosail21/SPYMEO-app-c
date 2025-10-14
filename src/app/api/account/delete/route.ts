// Cdw-Spm
import { NextResponse } from "next/server";
import { getSessionUser, clearSessionUser } from "@/lib/auth/session";
import { deleteAllForUser } from "@/lib/db/billing";
import { upsertProfile } from "@/lib/db/profiles";

export async function DELETE() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  // Ici tu supprimeras TOUT en base (profils, contenus, etc.).
  await deleteAllForUser(me.id);
  await upsertProfile(me.id, { userId: me.id, firstName: "", lastName: "", companyName: "" });

  await clearSessionUser();
  return NextResponse.json({ ok: true });
}
