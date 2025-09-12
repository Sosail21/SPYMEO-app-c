"use client";
import Link from "next/link";
import { CabinetAd } from "@/lib/db/mockCabinets";

export default function CabinetCard({ ad }: { ad: CabinetAd }) {
  return (
    <article className="soft-card p-0 overflow-hidden hover:-translate-y-0.5 transition-transform">
      <div className="h-40 bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)]" />
      <div className="p-4 grid gap-2">
        <div className="flex justify-between items-baseline">
          <h3 className="font-semibold">{ad.title}</h3>
          <span className="pill pill-muted">{ad.type}</span>
        </div>
        <div className="text-sm text-muted">
          {ad.city} • {ad.size} m²
        </div>
        <div className="font-bold">{ad.price} € / mois</div>
        <div className="flex gap-2">
          <Link className="pill pill-ghost" href={`/pro/cabinet-partage/${ad.id}`}>
            Voir
          </Link>
          <Link className="pill pill-solid" href={`/pro/messages?to=${encodeURIComponent(ad.postedBy)}`}>
            Contacter
          </Link>
        </div>
      </div>
    </article>
  );
}
