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

export default function PractitionerDashboard({ name }: { name: string }) {
  const nextAppt = { at: "18:20", who: "Aline Dupont", place: "Cabinet", href: "/pro/agenda" };
  const today = [
    { t: "09:00", who: "Romain Gérard", mode: "Cabinet", status: "CONFIRMÉ" },
    { t: "11:30", who: "Mélissa Brard", mode: "Visio", status: "CONFIRMÉ" },
    { t: "14:00", who: "Anaïs L.", mode: "Cabinet", status: "EN ATTENTE" },
    { t: "16:30", who: "Julien Caron", mode: "Visio", status: "CONFIRMÉ" },
  ];
  const kpis = { ca: 210, consults: 4, views: 86, likes: 12, comments: 3, messages: 5, rdv: 2 };
  const todos = ["Envoyer facture à Romain", "Préparer le plan d’action de Mélissa"];
  const quote = { txt: "Ce qui se mesure s’améliore.", author: "Peter Drucker" };

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Col 1 */}
      <div className="space-y-5">
        <Card className="p-4">
          <SectionTitle>Prochain rendez-vous</SectionTitle>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-slate-700">
              <div className="font-medium">
                {nextAppt.who} — <span className="text-slate-500">{nextAppt.place}</span>
              </div>
              <div className="text-xs text-slate-500">à {nextAppt.at}</div>
            </div>
            <a href={nextAppt.href} className="rounded-xl bg-sky-600 text-white text-xs px-3 py-1.5 hover:bg-sky-700">
              Ouvrir
            </a>
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle>To-do du jour</SectionTitle>
          <ul className="mt-2 space-y-2">
            {todos.map((t, i) => (
              <li key={i} className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                <span className="text-sm">{t}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <SectionTitle>Messages récents</SectionTitle>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <b>Aline Dupont</b> — “Peut-on décaler notre RDV ?”
              </div>
              <a href="/pro/messages" className="text-sky-700 text-xs">
                Répondre
              </a>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <b>Mélissa</b> — “Merci pour la séance 🙏”
              </div>
              <a href="/pro/messages" className="text-sky-700 text-xs">
                Répondre
              </a>
            </div>
          </div>
        </Card>
      </div>

      {/* Col 2 */}
      <div className="space-y-5">
        <Card className="p-4">
          <SectionTitle>Rendez-vous du jour</SectionTitle>
          <div className="mt-2 space-y-2">
            {today.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  {r.t} — {r.who} <span className="text-slate-500">({r.mode})</span>
                </div>
                <Badge tone={r.status === "CONFIRMÉ" ? "ok" : r.status === "EN ATTENTE" ? "warn" : "default"}>
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle>CA — 7 derniers jours</SectionTitle>
          <div className="mt-3 h-24 rounded-lg bg-slate-50 border border-slate-200 grid place-items-center text-xs text-slate-500">
            (mini-chart placeholder)
          </div>
          <div className="mt-3 text-xs text-right text-slate-600">Objectif hebdo : 900 €</div>
        </Card>

        <Card className="p-4">
          <SectionTitle>Rendez-vous — semaine</SectionTitle>
          <div className="mt-3 h-24 rounded-lg bg-slate-50 border border-slate-200 grid place-items-center text-xs text-slate-500">
            (mini-chart placeholder)
          </div>
        </Card>
      </div>

      {/* Col 3 */}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="CA (veille)" value={`${kpis.ca} €`} />
          <Stat label="Consultations" value={kpis.consults} />
          <Stat label="Vues fiche" value={kpis.views} />
          <Stat label="Likes" value={kpis.likes} />
          <Stat label="Commentaires" value={kpis.comments} />
          <Stat label="Messages" value={kpis.messages} />
        </div>

        <Card className="p-4">
          <SectionTitle>Raccourcis</SectionTitle>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <a className="btn-ghost" href="/pro/agenda">
              Agenda
            </a>
            <a className="btn-ghost" href="/pro/messages">
              Messages
            </a>
            <a className="btn-ghost" href="/pro/precompta">
              Pré-compta
            </a>
            <a className="btn-ghost" href="/pro/academie">
              Académie
            </a>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm italic text-slate-700">“{quote.txt}”</div>
          <div className="text-xs text-slate-500 mt-1">— {quote.author}</div>
        </Card>

        <Card className="p-4">
          <SectionTitle>Communauté SPYMEO</SectionTitle>
          <ul className="mt-2 text-sm list-disc list-inside text-slate-700 space-y-1">
            <li>Nouveau cours Académie : “Marketing local en 2h”</li>
            <li>3 pros près de chez vous sont en ligne</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}