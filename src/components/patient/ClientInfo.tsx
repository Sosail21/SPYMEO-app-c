// Cdw-Spm
'use client';
import { useState } from "react";
import EditableField from "./EditableField";

export default function ClientInfo({ client, onUpdate }: { client: any, onUpdate: () => void }) {
  const [form, setForm] = useState(client);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdate();
  }

  return (
    <div className="grid gap-3">
      <EditableField label="Nom" value={form.name} onChange={v => setForm({ ...form, name: v })} />
      <EditableField label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
      <EditableField label="Téléphone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
      <EditableField label="Infos" value={form.info || ""} onChange={v => setForm({ ...form, info: v })} textarea />

      <button onClick={save} disabled={saving} className="btn">
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
      {saved && <span className="text-green-600">✓ Enregistré</span>}
    </div>
  );
}
