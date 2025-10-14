// Cdw-Spm
'use client';
import AnnonceCard from "./AnnonceCard";

export default function ListingCabinet({ annonces, onSelect }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {annonces.map((a) => (
        <AnnonceCard key={a.id} annonce={a} onClick={() => onSelect(a)} />
      ))}
    </div>
  );
}
