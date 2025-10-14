// Cdw-Spm
"use client";

import * as React from "react";

type Partner = { enabled: boolean; rate: number };

export default function PassBadge({ userId }: { userId: string }) {
  const [partner, setPartner] = React.useState<Partner | null>(null);

  React.useEffect(() => {
    (async () => {
      const r = await fetch(`/api/public/pass/${userId}`, { cache: "no-store" });
      if (r.ok) setPartner(await r.json());
    })();
  }, [userId]);

  if (!partner?.enabled) return null;

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-sky-700 text-sm font-medium"
      title={`Partenaire PASS : -${partner.rate}% pour les membres PASS`}
    >
      <span>🔖 Partenaire PASS</span>
      <span>-{partner.rate}%</span>
    </div>
  );
}