import { getCabinet } from "@/lib/db/mockCabinets";
import Link from "next/link";

export default function Page({ params }: { params: { id: string } }) {
  const ad = getCabinet(params.id);
  if (!ad) return <div className="container-spy section">Annonce introuvable.</div>;

  return (
    <main className="section">
      <div className="container-spy grid lg:grid-cols-[1fr_340px] gap-6">
        <article className="soft-card p-0 overflow-hidden">
          <div className="h-56 bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)]" />
          <div className="p-5 grid gap-2">
            <h1 className="text-2xl font-bold">{ad.title}</h1>
            <div className="text-muted">
              {ad.city} • {ad.size} m² • {ad.type}
            </div>
            <div className="font-extrabold text-lg">{ad.price} € / mois</div>
            <p className="mt-2">{ad.description}</p>
          </div>
        </article>

        <aside className="soft-card p-4 h-fit">
          <div className="grid gap-2">
            <div className="text-sm text-muted">Publié par</div>
            <div className="font-semibold">{ad.postedBy}</div>
            <div className="text-sm text-muted">Dispo. à partir du</div>
            <div className="font-medium">
              {new Date(ad.availabilityDate).toLocaleDateString("fr-FR")}
            </div>
            <Link
              className="pill pill-solid mt-2"
              href={`/pro/messages?to=${encodeURIComponent(ad.postedBy)}`}
            >
              Contacter
            </Link>
            <Link className="pill pill-ghost" href="/pro/cabinet-partage">
              ← Retour aux annonces
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
