// Cdw-Spm
import { getSessionUser } from "@/lib/auth/session";
import PractitionerDashboard from "./_components/PractitionerDashboard";
import MerchantDashboard from "./_components/MerchantDashboard";
import CenterDashboard from "./_components/CenterDashboard";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function normalizeRole(r?: string) {
  const up = (r || "").toUpperCase();
  // harmonise COMMERÇANT → COMMERCANT
  return up.replace("Ç", "C");
}

export default async function ProDashboardPage() {
  // 👉 session réelle (cookie spymeo_session). Ne pas utiliser un mock ici.
  const me = await getSessionUser();

  if (!me) {
    return (
      <main className="section">
        <div className="container-spy">
          <div className="soft-card p-6">
            <h1 className="text-xl font-semibold">Accès refusé</h1>
            <p className="text-muted">Vous devez être connecté(e) pour accéder au tableau de bord.</p>
          </div>
        </div>
      </main>
    );
  }

  const role = normalizeRole(me.role);

  return (
    <main className="section">
      <div className="container-spy space-y-5">
        <header className="grid gap-1">
          <h1 className="text-2xl md:text-3xl font-bold">
            Bonjour {me.name?.split(" ")[0] || "Pro"} <span className="inline-block">🌿</span>
          </h1>
          <p className="text-muted">Voici votre cockpit du jour. Tout ce qu’il faut pour commencer fort.</p>
        </header>

        <Suspense fallback={<div className="soft-card p-6">Chargement du tableau de bord…</div>}>
          {role === "PRACTITIONER" && <PractitionerDashboard name={me.name || "Pro"} />}
          {(role === "ARTISAN" || role === "COMMERCANT") && <MerchantDashboard name={me.name || "Pro"} />}
          {role === "CENTER" && <CenterDashboard name={me.name || "Pro"} />}
          {!(role === "PRACTITIONER" || role === "ARTISAN" || role === "COMMERCANT" || role === "CENTER") && (
            <MerchantDashboard name={me.name || "Pro"} />
          )}
        </Suspense>
      </div>
    </main>
  );
}