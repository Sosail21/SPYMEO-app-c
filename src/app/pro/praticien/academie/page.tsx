// Cdw-Spm

"use client";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";

export type Lesson = {
  id: string;
  title: string;
  durationMin: number;
  kind: "cours" | "guide" | "atelier";
  tags: string[];
  difficulty: "débutant" | "intermédiaire" | "avancé";
  coverUrl?: string;
  description: string;
  content: string;
  likes: number;
  comments: number;
};

export type Progress = {
  lessonId: string;
  status: "non_commencé" | "en_cours" | "terminé";
  percent: number;
  favorite: boolean;
  lastViewedAt?: string;
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={["w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm","focus:outline-none focus:ring-2 focus:ring-sky-500", className || ""].join(" ")} />;
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return <select {...rest} className={["w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm","focus:outline-none focus:ring-2 focus:ring-sky-500", className || ""].join(" ")} />;
}
function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "soft" }) {
  const { variant = "primary", className, ...rest } = props;
  return <button {...rest} className={["inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium", variant==="primary"&&"bg-sky-600 text-white hover:bg-sky-700", variant==="ghost"&&"bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-200", variant==="soft"&&"bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100", className || ""].filter(Boolean).join(" ")} />;
}
function Toggle({checked, onChange}:{checked:boolean; onChange:(v:boolean)=>void}){
  return (
    <button
      onClick={()=> onChange(!checked)}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${checked? "bg-sky-600 text-white border-sky-700":"bg-white text-slate-700 border-slate-300"}`}
      aria-pressed={checked}
    >
      {checked ? "★ Favoris" : "☆ Favoris"}
    </button>
  );
}
function Card({ children, className=""}:{children:React.ReactNode; className?:string}) { return <div className={["rounded-2xl border border-slate-200 bg-white shadow-sm", className].join(" ")}>{children}</div>; }
function CardHeader({ title, subtitle, right }:{title:string; subtitle?:string; right?:React.ReactNode}) {
  return (<div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4"><div><h1 className="text-lg font-semibold text-slate-900">{title}</h1>{subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}</div>{right}</div>);
}
function CardContent({children}:{children:React.ReactNode}) { return <div className="p-4">{children}</div>; }
function ProgressBar({ percent }:{percent:number}) { return (<div className="h-2 w-full rounded-full bg-slate-100"><div style={{width:`${Math.min(100, Math.max(0, percent))}%`}} className="h-2 rounded-full bg-sky-500" /></div>); }

export default function AcademiePage() {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "duration">("recent");
  const [onlyFavs, setOnlyFavs] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchJSON<Lesson[]>("/api/academy/lessons"),
      fetchJSON<Progress[]>("/api/academy/progress"),
    ]).then(([ls, pg]) => {
      if (!alive) return;
      setLessons(ls);
      setProgress(Object.fromEntries(pg.map((p) => [p.lessonId, p])));
    }).catch((e)=>setError(e.message));
    return ()=>{alive=false;};
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    lessons?.forEach((l) => l.tags.forEach((t) => set.add(t)));
    return ["all", ...Array.from(set).sort()];
  }, [lessons]);

  const filtered = useMemo(() => {
    if (!lessons) return [] as Lesson[];
    let list = lessons;
    if (onlyFavs) list = list.filter((l)=> progress[l.id]?.favorite);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((l)=> l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.tags.join(",").toLowerCase().includes(q));
    }
    if (tag !== "all") list = list.filter((l)=> l.tags.includes(tag));
    if (difficulty !== "all") list = list.filter((l)=> l.difficulty === difficulty);
    if (sortBy === "popular") list = [...list].sort((a,b)=> b.likes + b.comments - (a.likes + a.comments));
    else if (sortBy === "duration") list = [...list].sort((a,b)=> a.durationMin - b.durationMin);
    else list = [...list].sort((a,b)=> a.title.localeCompare(b.title));
    return list;
  }, [lessons, progress, onlyFavs, query, tag, difficulty, sortBy]);

  function setFav(lessonId: string, fav: boolean) {
    startTransition(()=>{
      fetchJSON<Progress>("/api/academy/progress", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ lessonId, favorite: fav })})
      .then((p)=> setProgress((s)=> ({...s, [lessonId]: p})))
      .catch((e)=> setError(e.message));
    });
  }
  function updateStatus(lessonId: string, status: Progress["status"]) {
    startTransition(()=>{
      fetchJSON<Progress>("/api/academy/progress", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ lessonId, status })})
      .then((p)=> setProgress((s)=> ({...s, [lessonId]: p})))
      .catch((e)=> setError(e.message));
    });
  }
  function like(lessonId: string) {
    startTransition(()=>{
      fetchJSON<Lesson>("/api/academy/lessons", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ action: "like", lessonId })})
      .then((lesson)=> setLessons((ls)=> ls?.map((l)=> l.id===lesson.id? lesson : l) || null))
      .catch((e)=> setError(e.message));
    });
  }

  const overallPercent = useMemo(()=>{
    const arr = Object.values(progress);
    if (arr.length===0) return 0;
    return Math.round(arr.reduce((acc,p)=> acc+(p.percent||0), 0) / arr.length);
  }, [progress]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Académie</h1>
        <p className="text-sm text-slate-600 mt-1">Des parcours concrets pour se lancer et performer en tant que praticien.</p>
      </div>

      <Card className="mb-6">
        <CardHeader title="Votre progression" subtitle="Suivi global de vos cours" right={<span className="text-xs text-slate-500">{isPending? "Mise à jour…" : ""}</span>} />
        <CardContent>
          <div className="flex items-center gap-4">
            <ProgressBar percent={overallPercent} />
            <span className="text-sm text-slate-700 w-14 text-right">{overallPercent}%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader title="Catalogue de cours" subtitle="Filtrez par thème, niveau ou popularité" right={
          <div className="flex flex-wrap items-center gap-2">
            <Input placeholder="Rechercher…" value={query} onChange={(e)=> setQuery(e.target.value)} className="w-48" />
            <Select value={tag} onChange={(e)=> setTag(e.target.value)}>
              {allTags.map((t)=> <option key={t} value={t}>{t==="all"?"Tous les thèmes":`#${t}`}</option>)}
            </Select>
            <Select value={difficulty} onChange={(e)=> setDifficulty(e.target.value)}>
              <option value="all">Tous niveaux</option>
              <option value="débutant">Débutant</option>
              <option value="intermédiaire">Intermédiaire</option>
              <option value="avancé">Avancé</option>
            </Select>
            <Select value={sortBy} onChange={(e)=> setSortBy(e.target.value as any)}>
              <option value="recent">A→Z</option>
              <option value="popular">Popularité</option>
              <option value="duration">Durée (croissante)</option>
            </Select>
            <Toggle checked={onlyFavs} onChange={setOnlyFavs} />
          </div>
        } />
        <CardContent>
          {!lessons && !error && <p className="text-sm text-slate-500">Chargement…</p>}
          {lessons && filtered.length === 0 && <p className="text-sm text-slate-500">Aucun cours ne correspond aux filtres.</p>}

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((l)=>{
              const p = progress[l.id];
              return (
                <li key={l.id}>
                  <article className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                    {l.coverUrl && (<img src={l.coverUrl} alt="cover" className="h-40 w-full object-cover" />)}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-slate-900 line-clamp-2">{l.title}</h3>
                        <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-1 text-[10px]">{l.difficulty}</span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{l.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                        <span>{p?.percent || 0}%</span>
                        <span>{l.durationMin} min · ❤️ {l.likes} · 💬 {l.comments}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Link href={`/pro/academie/${l.id}`} className="inline-flex items-center rounded-xl bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700">Ouvrir</Link>
                          <Button onClick={()=> setFav(l.id, !(p?.favorite))} aria-pressed={p?.favorite} title="Basculer favori">
                            {p?.favorite ? "★ Favori" : "☆ Favori"}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={p?.status || "non_commencé"} onChange={(e)=> updateStatus(l.id, e.target.value as Progress["status"])}>
                            <option value="non_commencé">Non commencé</option>
                            <option value="en_cours">En cours</option>
                            <option value="terminé">Terminé</option>
                          </Select>
                          <Button variant="ghost" onClick={()=> like(l.id)}>Like</Button>
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {error && <p className="mt-4 text-sm text-rose-700">{String(error)}</p>}
    </div>
  );
}
