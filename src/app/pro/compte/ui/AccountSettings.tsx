"use client";

import * as React from "react";
import type { Session } from "@/lib/auth/session";
import type { Profile } from "@/lib/db/profiles";
import type { BillingState, Invoice } from "@/lib/db/billing";
import { z } from "zod";
import { profileSchema } from "@/lib/validation/profile";

type Props = {
  me: Session;
  initialProfile: Profile;
  initialBilling: BillingState;
};

export default function AccountSettings({ me, initialProfile, initialBilling }: Props) {
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  const [profile, setProfile] = React.useState<Profile>(initialProfile);
  const [billing, setBilling] = React.useState<BillingState>(initialBilling);

  // Helpers
  const updateProfile = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setToast(null);
    try {
      profileSchema.parse(profile);
      const res = await fetch("/api/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      if (!res.ok) throw new Error();
      setToast("Profil mis à jour ✅");
    } catch {
      setToast("Impossible d’enregistrer le profil.");
    } finally { setSaving(false); }
  }

  // --- Billing actions ---
  async function replaceCard() {
    // Dans la vraie vie: Stripe Elements / Payment Element → récup un paymentMethodId
    const fakePm = "pm_fake_" + Date.now();
    setToast(null);
    const res = await fetch("/api/account/billing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethodId: fakePm }),
    });
    if (res.ok) {
      const next = await res.json();
      setBilling(next);
      setToast("Carte remplacée ✅");
    } else setToast("Remplacement carte impossible.");
  }

  async function changePlan(plan: "FREE" | "PASS" | "PRO", renewal: "MONTHLY" | "ANNUAL") {
    setToast(null);
    const res = await fetch("/api/account/plan", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, renewal }),
    });
    if (res.ok) {
      const next = await res.json();
      setBilling(next);
      setToast("Forfait mis à jour ✅");
    } else setToast("Changement de forfait impossible.");
  }

  async function pausePlan() {
    if (billing.pause?.used) { setToast("Vous avez déjà utilisé la pause."); return; }
    const ok = confirm("Mettre en pause votre forfait ? (Vous ne pouvez le faire qu’une seule fois)");
    if (!ok) return;
    const res = await fetch("/api/account/plan/pause", { method: "POST" });
    if (res.ok) {
      const next = await res.json();
      setBilling(next);
      setToast("Forfait en pause ✅");
    } else setToast("Impossible de mettre en pause.");
  }

  async function cancelPlan() {
    const ok = confirm("Résilier votre forfait à la fin de la période en cours ?");
    if (!ok) return;
    const res = await fetch("/api/account/plan", { method: "DELETE" });
    if (res.ok) {
      const next = await res.json();
      setBilling(next);
      setToast("Forfait résilié pour fin de période ✅");
    } else setToast("Impossible de résilier.");
  }

  async function deleteAccount() {
    const step1 = prompt('Pour confirmer, tapez "SUPPRIMER". Action irréversible.');
    if (step1 !== "SUPPRIMER") return;
    const ok = confirm("Dernière confirmation : suppression TOTALE du compte et des données. Continuer ?");
    if (!ok) return;
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/"; // back to home
    } else setToast("Suppression impossible.");
  }

  return (

    <div className="grid gap-6">
      {/* Bandeau plan + résumé */}
      <section className="soft-card p-5 grid gap-4 md:grid-cols-3">
        <div className="grid gap-1">
          <div className="text-xs text-slate-500">Forfait actif</div>
          <div className="text-lg font-semibold">
            {billing.plan} · {billing.renewal === "MONTHLY" ? "Mensuel" : "Annuel"}
          </div>
          <div className="text-xs text-slate-500">
            Membre depuis {new Date(billing.memberSince).toLocaleDateString("fr-FR")}
          </div>
          {billing.cancelAtPeriodEnd && (
            <div className="mt-2 text-xs text-amber-600">Résiliation programmée à la fin de la période.</div>
          )}
          {billing.pause?.active && (
            <div className="mt-2 text-xs text-sky-700">
              En pause jusqu’au {new Date(billing.pause.until!).toLocaleDateString("fr-FR")} (utilisée {billing.pause.used ? "oui" : "non"}).
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-slate-500">Moyen de paiement</div>
          <div className="rounded-xl border p-3">
            <div className="flex items-center justify-between text-sm">
              <div>
                {billing.paymentMethod
                  ? `Carte •••• ${billing.paymentMethod.last4} (exp ${billing.paymentMethod.expMonth}/${billing.paymentMethod.expYear})`
                  : "Aucune carte enregistrée"}
              </div>
              <button onClick={replaceCard} className="text-sky-700 hover:underline">Remplacer</button>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-slate-500">Actions</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => changePlan("PRO", "ANNUAL")} className="pill">Passer en PRO</button>
            <button onClick={() => changePlan("PASS", "MONTHLY")} className="pill pill-ghost">Basculer en PASS</button>
            <button onClick={pausePlan} className="pill pill-ghost" disabled={billing.pause?.used}>Mettre en pause</button>
            <button onClick={cancelPlan} className="pill text-red-700 border-red-200 hover:bg-red-50">Résilier</button>
          </div>
        </div>
      </section>

      {/* Factures */}
      <section className="soft-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Factures</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Date</th>
                <th className="py-2">Libellé</th>
                <th className="py-2">Montant</th>
                <th className="py-2">Statut</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {billing.invoices.length === 0 && (
                <tr><td className="py-3 text-slate-500" colSpan={5}>Aucune facture pour l’instant.</td></tr>
              )}
              {billing.invoices.map((inv: Invoice) => (
                <tr key={inv.id} className="border-t">
                  <td className="py-3">{new Date(inv.date).toLocaleDateString("fr-FR")}</td>
                  <td className="py-3">{inv.description}</td>
                  <td className="py-3">{(inv.amount / 100).toFixed(2)} €</td>
                  <td className="py-3">{inv.status}</td>
                  <td className="py-3 text-right">
                    <a href={inv.pdfUrl} target="_blank" className="text-sky-700 hover:underline">Télécharger</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Coordonnées & entreprise (profil) */}
      <section className="soft-card p-0 overflow-hidden">
        <form onSubmit={saveProfile} className="grid gap-6 p-6 md:p-8">
          <h3 className="font-medium">Informations professionnelles</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nom"><input className="inp" value={profile.lastName || ""} onChange={(e)=>updateProfile("lastName", e.target.value)}/></Field>
            <Field label="Prénom"><input className="inp" value={profile.firstName || ""} onChange={(e)=>updateProfile("firstName", e.target.value)}/></Field>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Email (connexion)"><input className="inp" disabled value={me.email}/></Field>
            <Field label="Téléphone"><input className="inp" value={profile.phone || ""} onChange={(e)=>updateProfile("phone", e.target.value)}/></Field>
            <Field label="Site web"><input className="inp" value={profile.website || ""} onChange={(e)=>updateProfile("website", e.target.value)}/></Field>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Field label="SIRET"><input className="inp" value={profile.siret || ""} onChange={(e)=>updateProfile("siret", e.target.value)}/></Field>
            <Field label="Raison sociale / Cabinet"><input className="inp" value={profile.companyName || ""} onChange={(e)=>updateProfile("companyName", e.target.value)}/></Field>
            <Field label="IBAN (facultatif)"><input className="inp" value={profile.iban || ""} onChange={(e)=>updateProfile("iban", e.target.value)}/></Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Adresse ligne 1"><input className="inp" value={profile.addressLine1 || ""} onChange={(e)=>updateProfile("addressLine1", e.target.value)}/></Field>
            <Field label="Adresse ligne 2"><input className="inp" value={profile.addressLine2 || ""} onChange={(e)=>updateProfile("addressLine2", e.target.value)}/></Field>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Code postal"><input className="inp" value={profile.zip || ""} onChange={(e)=>updateProfile("zip", e.target.value)}/></Field>
            <Field label="Ville"><input className="inp" value={profile.city || ""} onChange={(e)=>updateProfile("city", e.target.value)}/></Field>
            <Field label="Pays"><input className="inp" value={profile.country || ""} onChange={(e)=>updateProfile("country", e.target.value)}/></Field>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-200 p-4 bg-slate-50">
            <div className="text-sm text-slate-600">{toast ? toast : "Enregistrez pour appliquer vos changements."}</div>
            <button disabled={saving} className="rounded-xl bg-sky-600 text-white text-sm px-4 py-2 hover:bg-sky-700 disabled:opacity-50">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>

      {/* Danger zone */}
      <section className="soft-card p-5 border border-red-200">
        <h3 className="font-medium text-red-700">Zone dangereuse</h3>
        <p className="text-sm text-slate-600">Supprimez définitivement votre compte et toutes vos données. Cette action est irréversible.</p>
        <div className="mt-3">
          <button onClick={deleteAccount} className="rounded-xl border border-red-300 text-red-700 px-4 py-2 hover:bg-red-50">
            Supprimer mon compte
          </button>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-slate-600">{label}</span>
      {children}
    </label>
  );
}
