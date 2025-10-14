// Cdw-Spm
'use client';
import Link from "next/link";

export default function AnnonceCard({ annonce, onClick }) {
  return (
    <article
      className="soft-card overflow-hidden hover:shadow-lg transition cursor-pointer"
      onClick={onClick}
    >
      <div className="h-32 bg-gray-200 grid grid-cols-3 gap-1">
        {annonce.photos.slice(0,3).map((p, i) => (
          <div key={i} className="bg-cover bg-center" style={{backgroundImage:`url(${p})`}} />
        ))}
      </div>
      <div className="p-3 grid gap-2">
        <h3 className="font-semibold">{annonce.titre}</h3>
        <p className="text-sm text-muted">{annonce.localisation} · {annonce.surface}m²</p>
        <div className="flex gap-2">
          <button className="pill pill-muted">☆ Favori</button>
          <button className="pill pill-muted">↗ Partager</button>
          <Link href={`/pro/commun/messages?to=${ann.author.id}`} onClick={e=>e.stopPropagation()} className="btn">Contacter</Link>
        </div>
      </div>
    </article>
  );
}
