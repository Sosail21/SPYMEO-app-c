"use client";

import { useState } from "react";

export default function Tabs({
  plan,
  deliverables,
  faq,
}: {
  plan: { step: string; detail: string }[];
  deliverables: string[];
  faq: { q: string; a: string }[];
}) {
  const [tab, setTab] = useState<"plan" | "livrables" | "faq">("plan");

  return (
    <div className="card">
      <div className="segmented mb-3">
        <button className={tab === "plan" ? "is-active" : ""} onClick={() => setTab("plan")}>
          Plan d’atelier
        </button>
        <button className={tab === "livrables" ? "is-active" : ""} onClick={() => setTab("livrables")}>
          Livrables
        </button>
        <button className={tab === "faq" ? "is-active" : ""} onClick={() => setTab("faq")}>
          FAQ
        </button>
      </div>

      {tab === "plan" && (
        <ol className="grid gap-2">
          {plan.map((p) => (
            <li key={p.step} className="soft-card p-3">
              <strong>{p.step}</strong>
              <p className="m-0 text-sm text-muted">{p.detail}</p>
            </li>
          ))}
        </ol>
      )}

      {tab === "livrables" && (
        <ul className="grid gap-2 list-disc ml-5">
          {deliverables.map((d) => <li key={d}>{d}</li>)}
        </ul>
      )}

      {tab === "faq" && (
        <ul className="grid gap-2">
          {faq.map((f) => (
            <li key={f.q} className="soft-card p-3">
              <strong>{f.q}</strong>
              <p className="m-0 text-sm text-muted mt-1">{f.a}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
