// Cdw-Spm

// src/components/cabinet/ModalAnnonce.tsx
"use client";
import Link from "next/link";
import type { Annonce } from "./types";

export default function ModalAnnonce({ ann, onClose, onContact }: { ann: Annonce; onClose: () => void; onContact: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl w-[90%] max-w-2xl p-4">
        <div className="flex justify-between"><h2 className="text-xl font-semibold">{ann.title}</h2><button onClick={onClose}>✕</button></div>
        <div className="grid gap-3 sm:grid-cols-3">{ann.images.slice(0,3).map((src,i)=>(<img key={i} src={src} alt={ann.title} className="rounded-xl"/>))}</div>
        <p>{ann.description}</p>
        <div className="flex justify-between">
          <Link href={`/pro/commun/repertoire/spymeo?u=${ann.author.id}`}>{ann.author.name}</Link>
          <Link href={`/pro/commun/messages?to=${ann.author.id}`} onClick={e=>e.stopPropagation()} className="btn">Contacter</Link>
        </div>
      </div>
    </div>
  );
}
