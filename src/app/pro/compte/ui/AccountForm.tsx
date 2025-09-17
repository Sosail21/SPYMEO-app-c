// src/app/pro/compte/ui/AccountForm.tsx
"use client";

import * as React from "react";
import type { Session } from "@/lib/auth/session";
import type { Profile } from "@/lib/db/profiles";
import { z } from "zod";
import { profileSchema } from "@/lib/validation/profile";

type Props = {
  user: Session;
  initialProfile: Profile;
};

export default function AccountForm({ user, initialProfile }: Props) {
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(initialProfile.avatarUrl || null);

  const [form, setForm] = React.useState<Profile>({
    ...initialProfile,
    role: user.role as any,
    email: user.email,
  });

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSelectAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/account/avatar", { method: "POST", body });
      if (!res.ok) throw new Error("upload failed");
      const { url } = await res.json();
      update("avatarUrl", url);
      setAvatarPreview(url);
    } catch {
      setMsg("Échec de l’upload de la photo.");
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      profileSchema.parse(form);
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("save failed");
      setMsg("Modifications enregistrées ✅");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setMsg(err.issues[0]?.message || "Veuillez vérifier les champs.");
      } else {
        setMsg("Impossible d’enregistrer. Réessayez.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 p-6 md:p-8">
      <section className="grid gap-4 md:grid-cols-[120px,1fr] items-start">
        <div className="flex flex-col items-center gap-2">
          <div className="h-[96px] w-[96px] rounded-full overflow-hidden border bg-slate-100">
            <img src={avatarPreview || "/images/avatar-placeholder.png"} alt="Avatar" className="h-full w-full object-cover" />
          </div>
          <label className="btn-ghost text-sm cursor-pointer">
            <input type="file" className="hidden" accept="image/*" onChange={onSelectAvatar} />
            Changer
          </label>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nom">
              <input className="inp" value={form.lastName || ""} onChange={(e) => update("lastName", e.target.value)} />
            </Field>
            <Field label="Prénom">
              <input className="inp" value={form.firstName || ""} onChange={(e) => update("firstName", e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Email (connexion)">
              <input className="inp" value={form.email || ""} disabled />
            </Field>
            <Field label="Téléphone">
              <input className="inp" value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} />
            </Field>
            <Field label="Site web">
              <input className="inp" value={form.website || ""} onChange={(e) => update("website", e.target.value)} />
            </Field>
          </div>
        </div>
      </section>

      <hr className="border-slate-200" />

      <section className="grid gap-4">
        <h3 className="text-sm font-semibold">Entreprise</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="SIRET">
            <input className="inp" value={form.siret || ""} onChange={(e) => update("siret", e.target.value)} />
          </Field>
          <Field label="Raison sociale / Cabinet">
            <input className="inp" value={form.companyName || ""} onChange={(e) => update("companyName", e.target.value)} />
          </Field>
          <Field label="Rôle">
            <input className="inp" disabled value={form.role || ""} />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Adresse ligne 1">
            <input className="inp" value={form.addressLine1 || ""} onChange={(e) => update("addressLine1", e.target.value)} />
          </Field>
          <Field label="Adresse ligne 2">
            <input className="inp" value={form.addressLine2 || ""} onChange={(e) => update("addressLine2", e.target.value)} />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Field label="Code postal">
            <input className="inp" value={form.zip || ""} onChange={(e) => update("zip", e.target.value)} />
          </Field>
          <Field label="Ville">
            <input className="inp" value={form.city || ""} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <Field label="Pays">
            <input className="inp" value={form.country || ""} onChange={(e) => update("country", e.target.value)} />
          </Field>
          <Field label="IBAN (facultatif)">
            <input className="inp" value={form.iban || ""} onChange={(e) => update("iban", e.target.value)} />
          </Field>
        </div>
      </section>

      <hr className="border-slate-200" />

      <section className="grid gap-4">
        <h3 className="text-sm font-semibold">Forfait SPYMEO</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Forfait">
            <select className="inp" value={form.plan || "FREE"} onChange={(e) => update("plan", e.target.value as any)}>
              <option value="FREE">Free</option>
              <option value="PASS">PASS</option>
              <option value="PRO">Pro</option>
            </select>
          </Field>
          <Field label="Renouvellement">
            <select className="inp" value={form.renewal || "ANNUAL"} onChange={(e) => update("renewal", e.target.value as any)}>
              <option value="MONTHLY">Mensuel</option>
              <option value="ANNUAL">Annuel</option>
            </select>
          </Field>
          <Field label="Réduction / Code (facultatif)">
            <input className="inp" value={form.coupon || ""} onChange={(e) => update("coupon", e.target.value)} />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-between gap-4 border-t border-slate-200 p-4 bg-slate-50">
        <div className="text-sm text-slate-600">
          {msg ? <span>{msg}</span> : <span>Astuce : enregistrez pour appliquer vos changements.</span>}
        </div>
        <button disabled={saving} className="rounded-xl bg-sky-600 text-white text-sm px-4 py-2 hover:bg-sky-700 disabled:opacity-50">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
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
