// Cdw-Spm
"use client";

import { useState } from "react";
import { Client } from "./types";

export default function ClientIdentity({ initialClient }: { initialClient: Client }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<Client>(initialClient);
  const [form, setForm] = useState<Client>(initialClient);

  const onChange = (k: keyof Client, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("PATCH failed");
      const updated = (await res.json()) as Client;
      setClient(updated);
      setForm(updated);
      setEditing(false);
    } catch (e) {
      alert("Erreur de sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="soft-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Identité du consultant</h2>
        {!editing ? (
          <button className="btn btn-outline" onClick={() => setEditing(true)}>
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={() => { setForm(client); setEditing(false); }}>
              Annuler
            </button>
            <button className="btn" onClick={onSave} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        )}
      </div>

      {/* Deux colonnes */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-3">
          <Labeled label="Prénom">
            {editing ? (
              <input
                className="input-pill"
                value={form.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
              />
            ) : (
              <span>{client.firstName}</span>
            )}
          </Labeled>
          <Labeled label="Email">
            {editing ? (
              <input
                className="input-pill"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            ) : (
              <span>{client.email || "—"}</span>
            )}
          </Labeled>
          <Labeled label="Date de naissance">
            {editing ? (
              <input
                type="date"
                className="input-pill"
                value={form.birthDate || ""}
                onChange={(e) => onChange("birthDate", e.target.value)}
              />
            ) : (
              <span>{client.birthDate || "—"}</span>
            )}
          </Labeled>
          <Labeled label="Adresse">
            {editing ? (
              <input
                className="input-pill"
                value={form.address || ""}
                onChange={(e) => onChange("address", e.target.value)}
              />
            ) : (
              <span>{client.address || "—"}</span>
            )}
          </Labeled>
        </div>

        <div className="grid gap-3">
          <Labeled label="Nom">
            {editing ? (
              <input
                className="input-pill"
                value={form.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
              />
            ) : (
              <span>{client.lastName}</span>
            )}
          </Labeled>
          <Labeled label="Téléphone">
            {editing ? (
              <input
                className="input-pill"
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            ) : (
              <span>{client.phone || "—"}</span>
            )}
          </Labeled>
          <Labeled label="Remarques (privées)">
            {editing ? (
              <textarea
                className="input-pill min-h-[96px]"
                value={form.notes || ""}
                onChange={(e) => onChange("notes", e.target.value)}
              />
            ) : (
              <span className="text-muted">{client.notes || "—"}</span>
            )}
          </Labeled>
        </div>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </div>
  );
}