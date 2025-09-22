"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserDocumentById, type UserDocument } from "@/lib/mockdb/documents";
import { useParams } from "next/navigation";

export default function DocumentDetailPage(){
  const { id } = useParams() as { id: string };
  const [data, setData] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let cancel=false;
    (async ()=>{
      try{
        const r = await fetch(`/api/user/documents/${id}`, { cache: "no-store" });
        if(!r.ok) throw new Error("fallback");
        const j = await r.json();
        if(!cancel) setData(j?.document ?? null);
      }catch{
        if(!cancel) setData(getUserDocumentById(id));
      }finally{
        if(!cancel) setLoading(false);
      }
    })();
    return ()=>{ cancel = true; };
  },[id]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <nav className="text-sm text-muted">
          <Link href="/user/documents" className="hover:underline">Documents</Link> <span>/</span> <span>Détail</span>
        </nav>
      </section>

      <section className="section">
        {loading ? <div className="soft-card p-5 animate-pulse h-28"/> : !data ? (
          <div className="soft-card p-5">Document introuvable.</div>
        ) : (
          <div className="soft-card p-5 grid gap-3">
            <header>
              <h1 className="text-2xl font-semibold">{data.title}</h1>
              <p className="text-sm text-muted">
                {data.type} • {fmtDate(data.createdAt)} • Par{" "}
                <Link href={`/praticien/${data.practitionerSlug}`} className="link-muted">{data.practitionerName}</Link>
              </p>
            </header>

            <div className="soft-card p-4">
              <div className="h-48 rounded-lg bg-[#eef3f6] grid place-content-center text-muted">
                Aperçu du document (PDF/image) — à implémenter
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn" onClick={()=>alert("Télécharger (à implémenter)")}>Télécharger</button>
              {data.relatedAppointmentId && (
                <Link href={`/user/rendez-vous/${data.relatedAppointmentId}`} className="pill pill-ghost">Voir le RDV lié</Link>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function fmtDate(iso:string){ try{ return new Date(iso).toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"});}catch{return iso;} }
