"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/**
 * NOTE: ce dashboard est autonome (mock data).
 * - Branche ensuite sur tes vraies APIs (agenda, météo, analytics, messagerie).
 * - Remplace FIRST_NAME par la valeur de session (ex: /api/auth/me).
 */
const FIRST_NAME = "Cindy";

// ---------- Types
type NextAppt = { at: string; inHuman: string; name: string; kind: "Cabinet" | "Visio" | "Domicile"; address?: string; avatar?: string };
type DayAppt = { at: string; name: string; status: "CONFIRMÉ" | "EN ATTENTE" | "ANNULÉ"; kind: "Cabinet" | "Visio" | "Domicile" };
type MessageLite = { from: string; at: string; snippet: string; avatar?: string };
type Kpis = { revenueYesterday: number; apptsYesterday: number; viewsYesterday: number; likesYesterday: number; commentsYesterday: number; messagesYesterday: number; bookingsYesterday: number };
type Weather = { tempC: number; city: string; icon: string; description: string };
type Quote = { text: string; author: string };

// ---------- UI primitives
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white/90 shadow-sm ${className}`}>{children}</div>
);
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold text-slate-900">{children}</h3>
);
const Small = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs text-slate-500">{children}</span>
);
const Kpi = ({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) => (
  <Link
    href={href || "#"}
    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition p-3 flex flex-col gap-1"
  >
    <Small>{label}</Small>
    <div className="text-xl font-semibold text-slate-900">{value}</div>
    {hint && <div className="text-xs text-slate-500">{hint}</div>}
  </Link>
);

// ---------- Mini charts (SVG sans lib)
function MiniLine({ points, max }: { points: number[]; max?: number }) {
  const m = max ?? Math.max(1, ...points);
  const w = 160;
  const h = 48;
  const step = w / Math.max(1, points.length - 1);
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (v / m) * (h - 4) - 2}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14">
      <path d={d} fill="none" stroke="currentColor" className="text-sky-600" strokeWidth={2} />
      <line x1="0" x2={w} y1={h - 1} y2={h - 1} className="stroke-slate-200" />
    </svg>
  );
}
function MiniBars({ values, max }: { values: number[]; max?: number }) {
  const m = max ?? Math.max(1, ...values);
  return (
    <div className="flex items-end gap-1 h-16">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 bg-sky-100 rounded-sm"
          style={{ height: `${Math.max(6, (v / m) * 100)}%` }}
          title={`${v}`}
        />
      ))}
    </div>
  );
}

// ---------- Mock data loaders (remplace par fetch API)
async function loadNextAppt(): Promise<NextAppt | null> {
  // ex: calcul "dans 2h15"
  return {
    at: new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    inHuman: "dans 2h 15",
    name: "Aline Dupont",
    kind: "Cabinet",
    address: "12 rue des Tilleuls, Dijon",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
  };
}
async function loadTodayAgenda(): Promise<DayAppt[]> {
  return [
    { at: "09:00", name: "Romain Gérard", status: "CONFIRMÉ", kind: "Cabinet" },
    { at: "11:30", name: "Mélissa Brard", status: "CONFIRMÉ", kind: "Visio" },
    { at: "14:00", name: "Anaïs L.", status: "EN ATTENTE", kind: "Cabinet" },
    { at: "16:30", name: "Julien Caron", status: "CONFIRMÉ", kind: "Visio" },
    { at: "18:30", name: "Thomas R.", status: "CONFIRMÉ", kind: "Cabinet" },
  ];
}
async function loadKpis(): Promise<Kpis> {
  return {
    revenueYesterday: 210,
    apptsYesterday: 4,
    viewsYesterday: 86,
    likesYesterday: 12,
    commentsYesterday: 3,
    messagesYesterday: 5,
    bookingsYesterday: 2,
  };
}
async function loadWeather(): Promise<Weather> {
  return { tempC: 18, city: "Dijon", icon: "⛅️", description: "Ciel voilé" };
}
async function loadQuote(): Promise<Quote> {
  const quotes: Quote[] = [
    { text: "La simplicité est la sophistication suprême.", author: "Léonard de Vinci" },
    { text: "Ce qui se mesure s’améliore.", author: "Peter Drucker" },
    { text: "On ne gère bien que ce qu’on voit clairement.", author: "Anonyme" },
    { text: "Progresser un peu, mais tous les jours.", author: "James Clear" },
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
async function loadMessages(): Promise<MessageLite[]> {
  return [
    {
      from: "Aline Dupont",
      at: "il y a 2 h",
      snippet: "Bonjour, pouvons-nous décaler notre rendez-vous de 17h ?",
      avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=80&auto=format&fit=crop",
    },
    {
      from: "Mélissa",
      at: "hier",
      snippet: "Merci pour la séance, j’ai déjà des effets positifs 🙏",
    },
    { from: "Romain", at: "hier", snippet: "Je confirme pour lundi 9h, à bientôt !" },
  ];
}

// ---------- Page
export default function DashboardPage() {
  const [nextAppt, setNextAppt] = useState<NextAppt | null>(null);
  const [agenda, setAgenda] = useState<DayAppt[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [messages, setMessages] = useState<MessageLite[]>([]);
  const [todos, setTodos] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: "1", text: "Envoyer facture à Romain", done: false },
    { id: "2", text: "Préparer le plan d’action de Mélissa", done: false },
  ]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    (async () => {
      const [n, a, k, w, q, m] = await Promise.all([
        loadNextAppt(),
        loadTodayAgenda(),
        loadKpis(),
        loadWeather(),
        loadQuote(),
        loadMessages(),
      ]);
      setNextAppt(n);
      setAgenda(a);
      setKpis(k);
      setWeather(w);
      setQuote(q);
      setMessages(m);
    })();
  }, []);

  const revenueSpark = useMemo(() => [120, 90, 140, 75, 160, 95, 180], []);
  const apptsSpark = useMemo(() => [2, 1, 3, 1, 4, 2, 3], []);

  const completedTodos = todos.filter((t) => t.done).length;

  function addTodo() {
    const t = newTodo.trim();
    if (!t) return;
    setTodos((arr) => [{ id: crypto.randomUUID(), text: t, done: false }, ...arr]);
    setNewTodo("");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        {/* Header accueil */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Bonjour {FIRST_NAME} <span className="align-middle">🌿</span>
            </h1>
            <p className="text-sm text-slate-600">
              Voici votre cockpit du jour. Tout ce qu’il faut pour commencer fort.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {weather && (
              <Card className="px-4 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{weather.icon}</span>
                  <div>
                    <div className="text-sm font-semibold">
                      {weather.tempC}°C — {weather.city}
                    </div>
                    <Small>{weather.description}</Small>
                  </div>
                </div>
              </Card>
            )}
            {quote && (
              <Card className="px-4 py-2 max-w-md">
                <div className="text-sm italic">“{quote.text}”</div>
                <Small>— {quote.author}</Small>
              </Card>
            )}
          </div>
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Colonne 1 */}
          <div className="space-y-4">
            <Card>
              <div className="p-4">
                <CardTitle>Prochain rendez-vous</CardTitle>
                {nextAppt ? (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
                      {nextAppt.avatar && (
                        <img className="h-full w-full object-cover" src={nextAppt.avatar} alt="" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">
                        {nextAppt.name} — {nextAppt.kind}
                      </div>
                      <Small>
                        {new Date(nextAppt.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                        {nextAppt.inHuman}
                        {nextAppt.address ? ` · ${nextAppt.address}` : ""}
                      </Small>
                    </div>
                    <Link
                      href="/pro/agenda"
                      className="rounded-xl bg-sky-600 text-white px-3 py-1.5 text-xs hover:bg-sky-700"
                    >
                      Ouvrir
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-500">Aucun rendez-vous à venir.</div>
                )}
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <CardTitle>To-do du jour</CardTitle>
                <div className="mt-3 flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Ajouter une tâche…"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  />
                  <button onClick={addTodo} className="rounded-xl bg-sky-600 text-white px-3 text-sm hover:bg-sky-700">
                    Ajouter
                  </button>
                </div>
                <ul className="mt-3 space-y-2">
                  {todos.map((t) => (
                    <li key={t.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() =>
                          setTodos((arr) => arr.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))
                        }
                      />
                      <span className={t.done ? "line-through text-slate-400" : "text-slate-800"}>{t.text}</span>
                      <button
                        className="ml-auto text-slate-400 hover:text-rose-600"
                        onClick={() => setTodos((arr) => arr.filter((x) => x.id !== t.id))}
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                  {todos.length === 0 && (
                    <li className="text-xs text-slate-500">Rien à faire pour l’instant. Profitez-en 🎉</li>
                  )}
                </ul>
                <div className="mt-3 text-xs text-slate-500">
                  {completedTodos}/{todos.length} complétées
                </div>
              </div>
            </Card>
          </div>

          {/* Colonne 2 */}
          <div className="space-y-4">
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Rendez-vous du jour</CardTitle>
                  <Link href="/pro/agenda" className="text-xs text-sky-700 hover:underline">
                    Voir l’agenda
                  </Link>
                </div>
                <ul className="mt-3 divide-y divide-slate-100">
                  {agenda.map((a, i) => (
                    <li key={i} className="py-2 flex items-center gap-3 text-sm">
                      <span className="w-14 font-medium text-slate-900">{a.at}</span>
                      <span className="flex-1">{a.name}</span>
                      <span
                        className={`text-xs rounded-full px-2 py-0.5 ${
                          a.status === "CONFIRMÉ"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : a.status === "EN ATTENTE"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        {a.status}
                      </span>
                      <Small className="ml-2">{a.kind}</Small>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <div className="p-4">
                  <CardTitle>CA — 7 derniers jours</CardTitle>
                  <MiniLine points={revenueSpark} />
                  <Small className="block">Tendance douce et régulière · objectif hebdo : 900 €</Small>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <CardTitle>Rendez-vous — semaine</CardTitle>
                  <MiniBars values={apptsSpark} />
                  <Small className="block">Pic attendu jeudi → pensez aux confirmations</Small>
                </div>
              </Card>
            </div>

            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Messages récents</CardTitle>
                  <Link href="/pro/messages" className="text-xs text-sky-700 hover:underline">
                    Ouvrir la messagerie
                  </Link>
                </div>
                <ul className="mt-3 space-y-3">
                  {messages.map((m, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden mt-0.5">
                        {m.avatar && <img src={m.avatar} className="h-full w-full object-cover" alt="" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-medium text-slate-900">{m.from}</span>{" "}
                          <Small>• {m.at}</Small>
                        </div>
                        <div className="text-sm text-slate-700 line-clamp-2">{m.snippet}</div>
                      </div>
                      <Link
                        href="/pro/messages"
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                      >
                        Répondre
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Colonne 3 */}
          <div className="space-y-4">
            <Card>
              <div className="p-4">
                <CardTitle>Chiffres de la veille</CardTitle>
                {kpis ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Kpi label="CA" value={`${kpis.revenueYesterday.toLocaleString("fr-FR")} €`} hint="Recettes TTC" href="/pro/precompta" />
                    <Kpi label="Consultations" value={`${kpis.apptsYesterday}`} href="/pro/agenda" />
                    <Kpi label="Vues fiche" value={`${kpis.viewsYesterday}`} href="/pro/analytics" />
                    <Kpi label="Likes" value={`${kpis.likesYesterday}`} href="/pro/analytics" />
                    <Kpi label="Commentaires" value={`${kpis.commentsYesterday}`} href="/pro/analytics" />
                    <Kpi label="Messages" value={`${kpis.messagesYesterday}`} href="/pro/messages" />
                    <Kpi label="Prises de RDV" value={`${kpis.bookingsYesterday}`} href="/pro/agenda" />
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-500">Chargement…</div>
                )}
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <CardTitle>Raccourcis</CardTitle>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link href="/pro/agenda" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                    Agenda
                  </Link>
                  <Link href="/pro/messages" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                    Messages
                  </Link>
                  <Link href="/pro/precompta" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                    Pré-compta
                  </Link>
                  <Link href="/pro/academie" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                    Académie
                  </Link>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <CardTitle>Communauté SPYMEO</CardTitle>
                <ul className="mt-3 text-sm space-y-2">
                  <li>✨ Nouvel article “Gérer sa première facture”</li>
                  <li>📌 3 pros près de chez vous sont en ligne</li>
                  <li>🎓 Nouveau cours Académie : “Marketing local en 2h”</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
