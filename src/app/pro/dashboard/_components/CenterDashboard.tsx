"use client";

function Card({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`soft-card border border-slate-200 bg-white rounded-2xl shadow-sm ${className}`}>{children}</div>;
}
function SectionTitle({ children }: React.PropsWithChildren) {
  return <h3 className="text-sm font-semibold text-slate-900">{children}</h3>;
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
function Badge({ tone = "default", children }: { tone?: "ok" | "warn" | "default"; children: React.ReactNode }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-slate-100 text-slate-700 border-slate-200";
  return <span className={`px-2 py-0.5 text-xs rounded-full border ${cls}`}>{children}</span>;
}

export default function CenterDashboard({ name }: { name: string }) {
  const sessionsToday = [
    { t: "09:00", title: "Anat. palpatoire — groupe A", room: "Salle 2", status: "OUVERTE" },
    { t: "14:00", title: "Réflexologie — initiation", room: "Visio", status: "COMPLÈTE" },
  ];
  const stats = { learners: 184, sessionsThisWeek: 8, paymentsPending: 5, messages: 4 };

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Col 1 */}
      <div className="space-y-5">
        <Card className="p-4">
          <SectionTitle>Sessions du jour</SectionTitle>
          <div className="mt-2 space-y-2 text-sm">
            {sessionsToday.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  {s.t} — {s.title} <span className="text-xs text-slate-500">({s.room})</span>
                </div>
                <Badge tone={s.status === "COMPLÈTE" ? "warn" : "ok"}>{s.status}</Badge>
              </div>
            ))}
          </div>
          <a href="/pro/formations/sessions" className="text-sky-700 text-xs mt-3 inline-block">
            Voir l’agenda
          </a>
        </Card>

        <Card className="p-4">
          <SectionTitle>À faire aujourd’hui</SectionTitle>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" /> Valider 3 inscriptions
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" /> Envoyer la convocation “Réflexologie”
            </li>
          </ul>
        </Card>
      </div>

      {/* Col 2 */}
      <div className="space-y-5">
        <Card className="p-4">
          <SectionTitle>Chiffres rapides</SectionTitle>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Apprenants" value={stats.learners} />
            <Stat label="Sessions (semaine)" value={stats.sessionsThisWeek} />
            <Stat label="Paiements en attente" value={stats.paymentsPending} />
            <Stat label="Messages" value={stats.messages} />
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle>Raccourcis</SectionTitle>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <a className="btn-ghost" href="/pro/formations">
              Formations
            </a>
            <a className="btn-ghost" href="/pro/formations/nouvelle">
              Nouvelle formation
            </a>
            <a className="btn-ghost" href="/pro/formations/sessions">
              Sessions & inscriptions
            </a>
            <a className="btn-ghost" href="/pro/apprenants">
              Apprenants
            </a>
          </div>
        </Card>
      </div>

      {/* Col 3 */}
      <div className="space-y-5">
        <Card className="p-4">
          <SectionTitle>Messages récents</SectionTitle>
          <div className="mt-2 text-sm space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <b>Camille</b> — “Besoin du programme PDF”
              </div>
              <a href="/pro/messages" className="text-sky-700 text-xs">
                Répondre
              </a>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <b>Yanis</b> — “Justificatif d’absence”
              </div>
              <a href="/pro/messages" className="text-sky-700 text-xs">
                Répondre
              </a>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm italic text-slate-700">“On n’enseigne bien que ce que l’on pratique.”</div>
          <div className="text-xs text-slate-500 mt-1">— Inspiré</div>
        </Card>
      </div>
    </div>
  );
}
