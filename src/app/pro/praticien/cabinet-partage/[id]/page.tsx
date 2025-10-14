// Cdw-Spm

// src/app/pro/cabinet-partage/[id]/page.tsx
import Link from "next/link";
import { getCabinet } from "@/components/cabinet/mock";

export const metadata = { title: "Annonce — SPYMEO" };

export default async function CabinetDetailPage({ params }: { params: { id: string } }) {
  const ann = getCabinet(params.id);
  if (!ann) return <main className="section"><div className="container-spy">Annonce introuvable.</div></main>;

  return (
    <main className="section">
      <div className="container-spy grid gap-4">
        <Link className="page inline-block w-fit" href="/pro/cabinet-partage">← Retour</Link>
        <article className="soft-card p-4 grid gap-4">
          <header className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">{ann.title}</h1>
              <div className="text-muted">{ann.city} • {ann.surface} m² {ann.equiped ? "• équipé" : ""}</div>
            </div>
            <Link className="btn" href={`/pro/messages?to=${ann.author.id}`}>Contacter</Link>
          </header>
          <div className="grid gap-3 sm:grid-cols-3">
            {ann.images.slice(0,3).map((src,i)=>(<img key={i} src={src} alt={ann.title} className="w-full h-48 object-cover rounded-xl"/>))}
          </div>
          <p className="leading-relaxed">{ann.description}</p>
          <footer className="text-sm text-muted">Publié par <Link href={`/pro/repertoire/spymeo?u=${ann.author.id}`} className="text-accent">{ann.author.name}</Link></footer>
        </article>
      </div>
    </main>
  );
}
