"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Appointment, getAppointmentById } from "@/lib/mockdb/appointments";
import { useParams } from "next/navigation";

export default function AppointmentDetailPage() {
  const { id } = useParams() as { id: string };
  const [data, setData] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let cancel=false;
    (async ()=>{
      try{
        const r = await fetch(`/api/user/appointments/${id}`, { cache: "no-store" });
        if(!r.ok) throw new Error("fallback");
        const j = await r.json();
        if(!cancel) setData(j?.appointment ?? null);
      }catch{
        if(!cancel) setData(getAppointmentById(id));
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
          <Link href="/user/rendez-vous/a-venir" className="hover:underline">Rendez-vous</Link> <span>/</span> <span>Détail</span>
        </nav>
      </section>

      <section className="section">
        {loading ? <Skeleton/> : !data ? <NotFound/> : (
          <div className="soft-card p-5 grid gap-3">
            <header className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold">{data.title}</h1>
                <p className="text-muted">
                  Avec <Link href={`/praticien/${data.practitionerSlug}`} className="link-muted">{data.practitionerName}</Link>
                  {" • "}{fmtDateTime(data.date)} • {data.durationMin} min
                </p>
              </div>
              <div className="flex gap-2">
                <Link className="pill pill-ghost" href={`/praticien/${data.practitionerSlug}`}>Voir la fiche</Link>
                <Link className="pill pill-muted" href={`/prendre-rdv?praticien=${data.practitionerSlug}`}>Reprendre RDV</Link>
              </div>
            </header>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="soft-card p-4">
                <h3 className="font-semibold">Informations</h3>
                <ul className="text-sm text-muted mt-2 grid gap-1">
                  <li><strong>Lieu :</strong> {data.place}{data.address ? ` — ${data.address}` : ""}</li>
                  {data.canCancelUntil && <li><strong>Annulation jusqu’au :</strong> {fmtDateTime(data.canCancelUntil)}</li>}
                  <li><strong>Statut :</strong> {prettyStatus(data.status)}</li>
                </ul>
                <div className="mt-3 flex gap-2">
                  <button className="pill pill-muted" onClick={()=>alert("Annuler (à implémenter)")}>Annuler</button>
                  <button className="pill pill-ghost" onClick={()=>alert("Ajouter au calendrier (à implémenter)")}>Ajouter au calendrier</button>
                </div>
              </div>

              <div className="soft-card p-4">
                <h3 className="font-semibold">Notes</h3>
                <p className="text-sm text-muted mt-2">{data.notesForUser || "—"}</p>
              </div>
            </div>

            <div className="soft-card p-4">
              <h3 className="font-semibold">Documents liés</h3>
              {data.documents?.length ? (
                <ul className="grid gap-2 mt-2">
                  {data.documents.map(d => (
                    <li key={d.id} className="flex items-center justify-between gap-3">
                      <span className="text-sm">{d.title}</span>
                      <Link href={`/user/documents/${d.id}`} className="pill pill-ghost">Ouvrir</Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted mt-2">Aucun document.</p>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Skeleton(){ return <div className="soft-card p-5 animate-pulse h-40"/>; }
function NotFound(){ return <div className="soft-card p-5">Rendez-vous introuvable.</div>; }
function fmtDateTime(iso: string){ try{const d=new Date(iso); return d.toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"})+" "+d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});}catch{return iso;} }
function prettyStatus(s: string){ return s==="CONFIRMED"?"Confirmé":s==="DONE"?"Terminé":s==="CANCELLED"?"Annulé":s; }
