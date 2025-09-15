
// src/components/cabinet/CardAnnonce.tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import type { Annonce } from "./types";

export default function CardAnnonce({ ann, onOpen }: { ann: Annonce; onOpen: () => void }) {
  const [fav,setFav]=useState(false);
  return (
    <article className="soft-card overflow-hidden group hover:shadow-elev transition cursor-pointer" onClick={onOpen}>
      <div className="relative">
        <img src={ann.images[0]} alt={ann.title} className="w-full h-44 object-cover"/>
        <button className="absolute top-2 right-2 bg-white rounded-full px-2" onClick={(e)=>{e.stopPropagation();setFav(v=>!v);}}>{fav?"★":"☆"}</button>
      </div>
      <div className="p-3 grid gap-2">
        <div className="flex justify-between"><h3 className="font-semibold">{ann.title}</h3><span>{ann.kind==="offer"?"Offre":"Demande"}</span></div>
        <div className="text-sm text-muted">{ann.city} • {ann.surface} m² {ann.equiped?"• équipé":""}</div>
        <div className="flex justify-between">
          <Link href={`/pro/repertoire/spymeo?u=${ann.author.id}`} onClick={e=>e.stopPropagation()}>{ann.author.name}</Link>
          <Link href={`/pro/messages?to=${ann.author.id}`} onClick={e=>e.stopPropagation()} className="btn">Contacter</Link>
        </div>
      </div>
    </article>
  );
}
