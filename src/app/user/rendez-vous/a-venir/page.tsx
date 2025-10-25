// Cdw-Spm
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Appointment } from "@/types/appointments";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useConfirm } from "@/hooks/useConfirm";

export default function UpcomingAppointmentsPage() {
  const [data, setData] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const confirmDialog = useConfirm();

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const r = await fetch("/api/user/appointments?scope=upcoming", { cache: "no-store" });
      if (!r.ok) throw new Error("fallback");
      const j = await r.json();
      setData(j?.appointments ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelAppointment(appointmentId: string) {
    const confirmed = await confirmDialog.confirm({
      title: "Annuler le rendez-vous",
      message: "Êtes-vous sûr de vouloir annuler ce rendez-vous ?",
      confirmText: "Confirmer",
      cancelText: "Annuler",
      variant: "danger"
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/user/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        const data = await res.json();
        await confirmDialog.confirm({
          title: "Erreur",
          message: data.error || "Erreur lors de l'annulation du rendez-vous",
          confirmText: "OK",
          cancelText: "",
          variant: "danger"
        });
        return;
      }

      // Refresh the list
      fetchAppointments();
      await confirmDialog.confirm({
        title: "Succès",
        message: "Rendez-vous annulé avec succès",
        confirmText: "OK",
        cancelText: ""
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      await confirmDialog.confirm({
        title: "Erreur",
        message: "Erreur lors de l'annulation du rendez-vous",
        confirmText: "OK",
        cancelText: "",
        variant: "danger"
      });
    }
  }

  const list = useMemo(() => {
    const base = (data ?? []).filter(a => {
      if (!q.trim()) return true;
      const hay = `${a.title} ${a.practitionerName} ${a.place}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
    return base.sort((a,b)=> a.date.localeCompare(b.date));
  }, [data, q]);

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <div className="toolbar">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b1239]">Rendez-vous à venir</h1>
            <p className="text-muted text-sm">Rappel automatique 24h avant l’horaire ✨</p>
          </div>
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Rechercher un RDV…"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-64"
            />
            <Link href="/user/rendez-vous/passes" className="btn btn-outline">Voir l’historique</Link>
          </div>
        </div>
      </section>

      <section className="section">
        {loading ? <SkeletonList/> : list.length === 0 ? <Empty/> : (
          <ul className="grid gap-3">
            {list.map(a => (
              <li key={a.id} className="soft-card p-4 flex items-center gap-4">
                {/* Photo du praticien */}
                <div className="flex-shrink-0">
                  {a.practitionerPhoto ? (
                    <img
                      src={a.practitionerPhoto}
                      alt={a.practitionerName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-2xl text-accent">
                        {a.practitionerName?.charAt(0) || "P"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Informations du RDV */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <strong className="text-lg">{a.title}</strong>
                    <span className="pill pill-muted flex-shrink-0">{a.place}</span>
                  </div>
                  <div className="text-sm text-muted">
                    Avec <Link className="link-muted font-medium" href={`/praticien/${a.practitionerSlug}`}>{a.practitionerName}</Link>
                  </div>
                  <div className="text-sm text-muted mt-1">
                    📅 {fmtDateTime(a.date)}
                    {" • "}<span className="text-emerald-700">✓ Rappel 24h activé</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/user/rendez-vous/${a.id}`} className="pill pill-ghost">📋 Détails</Link>
                    {a.canCancel ? (
                      <button
                        className="pill pill-muted"
                        onClick={() => handleCancelAppointment(a.id)}
                      >
                        ✕ Annuler
                      </button>
                    ) : (
                      <span className="text-xs text-muted italic">Annulation possible jusqu'à 24h avant</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmModal
        open={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
      />
    </main>
  );
}

function SkeletonList(){
  return (
    <ul className="list">
      {Array.from({length:3}).map((_,i)=>(
        <li key={i} className="list-row animate-pulse">
          <div className="list-media"/>
          <div className="list-body">
            <div className="h-4 w-1/3 bg-slate-200 rounded"/>
            <div className="mt-2 h-3 w-2/3 bg-slate-100 rounded"/>
          </div>
        </li>
      ))}
    </ul>
  );
}
function Empty(){
  return (
    <div className="soft-card p-8 text-center">
      <h3 className="font-semibold text-lg">Aucun RDV à venir</h3>
      <p className="text-muted mt-1">Trouver un praticien et prendre rendez-vous.</p>
      <div className="mt-4"><Link href="/recherche" className="btn">Rechercher un pro</Link></div>
    </div>
  );
}
function fmtDateTime(iso: string){
  try{
    const d=new Date(iso);
    return d.toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"})+" "+d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  }catch{return iso;}
}
