import { getSessionUser } from "@/lib/auth/session";
import { getProfileByUserId } from "@/lib/db/profiles";
import { getBillingForUser } from "@/lib/db/billing";
import AccountSettings from "./ui/AccountSettings";

export const dynamic = "force-dynamic";

export default async function ProAccountPage() {
  const me = await getSessionUser();
  if (!me) {
    return (
      <main className="section">
        <div className="container-spy">
          <div className="soft-card p-6">
            <h1 className="text-xl font-semibold">Accès refusé</h1>
            <p className="text-muted">Vous devez être connecté(e) pour accéder à votre compte.</p>
          </div>
        </div>
      </main>
    );
  }

  const [profile, billing] = await Promise.all([
    getProfileByUserId(me.id),
    getBillingForUser(me.id),
  ]);

  return (
    <main className="section">
      <div className="container-spy space-y-6">
        <header className="grid gap-1">
          <h1 className="text-2xl md:text-3xl font-bold">Mon compte</h1>
          <p className="text-muted">Gérez votre forfait, vos paiements et vos informations.</p>
        </header>

        <AccountSettings me={me} initialProfile={profile} initialBilling={billing} />
      </div>
    </main>
  );
}

