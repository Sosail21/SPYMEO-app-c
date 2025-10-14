// Cdw-Spm
'use client';
import { useState } from "react";

export default function EditableField({ label, value, onChange, textarea }: { label: string, value: string, onChange: (v: string) => void, textarea?: boolean }) {
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <label className="block font-semibold mb-1">{label}</label>
      {editing ? (
        <div className="flex gap-2">
          {textarea ? (
            <textarea
              value={value}
              onChange={e => onChange(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
          ) : (
            <input
              value={value}
              onChange={e => onChange(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
          )}
          <button onClick={() => setEditing(false)} className="btn">OK</button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <span>{value || <span className="text-gray-400">Non renseigné</span>}</span>
          <button onClick={() => setEditing(true)} className="btn-outline">Modifier</button>
        </div>
      )}
    </div>
  );
}
