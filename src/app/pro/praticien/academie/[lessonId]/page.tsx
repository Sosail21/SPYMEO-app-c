
"use client";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";

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

export type Chapter = {
  id: string;
  lessonId: string;
  title: string;
  order: number;
  durationMin: number;
  content: string;
};

export type Progress = {
  lessonId: string;
  status: "non_commencé" | "en_cours" | "terminé";
  percent: number;
  favorite: boolean;
  lastViewedAt?: string;
};

export type Note = {
  id: string;
  lessonId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "soft" }) {
  const { variant = "primary", className, ...rest } = props;
  return (
    <button
      {...rest}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium",
        variant === "primary" && "bg-sky-600 text-white hover:bg-sky-700",
        variant === "ghost" && "bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-200",
        variant === "soft" && "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100",
        className || ""
      ].filter(Boolean).join(" ")}
    />
  );
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={[
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-sky-500",
        "min-h-[120px]",
        className || ""
      ].join(" ")}
    />
  );
}
function ProgressBar({ percent }:{percent:number}) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div style={{width:`${Math.min(100, Math.max(0, percent))}%`}} className="h-2 rounded-full bg-sky-500" />
    </div>
  );
}
function Card({ children, className=""}:{children:React.ReactNode; className?:string}) {
  return <div className={["rounded-2xl border border-slate-200 bg-white shadow-sm", className].join(" ")}>{children}</div>;
}
function Skeleton({ className="h-4 w-full" }:{className?:string}) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}
async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache:"no-store", ...init });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function LessonDetailPage() {
  const params = useParams<{ lessonId: string }>();
  const router = useRouter();
  const lessonId = params?.lessonId;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    if (!lessonId) return;
    let alive = true;
    Promise.all([
      fetchJSON<Lesson[]>("/api/academy/lessons"),
      fetchJSON<Chapter[]>(`/api/academy/chapters?lessonId=${lessonId}`),
      fetchJSON<Progress>(`/api/academy/progress/by-lesson?lessonId=${lessonId}`),
      fetchJSON<Record<string, boolean>>(`/api/academy/chapters/completed?lessonId=${lessonId}`),
      fetchJSON<Note[]>("/api/academy/notes"),
    ]).then(([allLessons, chs, prog, comp, allNotes]) => {
      if (!alive) return;
      const found = allLessons.find((l)=> l.id === lessonId);
      if (!found) throw new Error("Cours introuvable");
      setLesson(found);
      const sorted = [...chs].sort((a,b)=> a.order - b.order);
      setChapters(sorted);
      setActiveChapterId(sorted[0]?.id || null);
      setProgress(prog);
      setCompletedMap(comp || {});
      setNotes(allNotes.filter(n => n.lessonId === lessonId));
    }).catch((e)=> setError(e.message));
    return ()=>{alive=false;};
  }, [lessonId]);

  const activeChapter = useMemo(()=> chapters?.find((c)=> c.id === activeChapterId) || null, [chapters, activeChapterId]);
  const total = chapters?.length || 0;
  const completedCount = useMemo(()=> Object.values(completedMap).filter(Boolean).length, [completedMap]);
  const computedPercent = useMemo(()=> (total ? Math.round((completedCount/total)*100) : 0), [total, completedCount]);

  useEffect(()=>{
    if (!lessonId) return;
    if (progress && progress.percent !== computedPercent) {
      startTransition(()=>{
        fetchJSON<Progress>("/api/academy/progress", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ lessonId, percent: computedPercent, status: computedPercent===100? "terminé" : "en_cours" })
        }).then(setProgress).catch(()=>{});
      });
    }
  }, [computedPercent]);

  function markChapterDone(chapterId: string) {
    if (!lessonId) return;
    startTransition(()=>{
      fetchJSON<Record<string, boolean>>("/api/academy/chapters/complete", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ lessonId, chapterId, completed: true })
      }).then((m)=>{
        setCompletedMap(m);
        const idx = chapters?.findIndex((c)=> c.id === chapterId) ?? -1;
        const next = chapters && idx>=0 && idx+1 < chapters.length ? chapters[idx+1].id : null;
        if (next) setActiveChapterId(next);
      }).catch((e)=> setError(e.message));
    });
  }

  function finalizeCourse() {
    if (!lessonId) return;
    startTransition(()=>{
      fetchJSON<Progress>("/api/academy/progress", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ lessonId, percent: 100, status: "terminé" })
      }).then(setProgress).catch((e)=> setError(e.message));
    });
  }

  function saveNote() {
    if (!lessonId || !noteDraft.trim()) return;
    startTransition(()=>{
      fetchJSON<Note>("/api/academy/notes", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ lessonId, body: noteDraft })
      }).then((n)=>{
        if (n.lessonId === lessonId) setNotes((arr)=> [...arr, n]);
        setNoteDraft("");
      }).catch((e)=> setError(e.message));
    });
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      {!lesson ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{lesson.title}</h1>
              <p className="text-xs text-slate-500 mt-1">{lesson.durationMin} min · {lesson.difficulty}</p>
            </div>
            <div className="min-w-[220px]">
              <ProgressBar percent={progress?.percent ?? computedPercent} />
              <p className="text-right text-xs text-slate-600 mt-1">{progress?.percent ?? computedPercent}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <aside className="md:col-span-1">
              <Card>
                <div className="p-3 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-800">Chapitres</p>
                </div>
                <ul className="divide-y divide-slate-100">
                  {chapters?.map((c)=>(
                    <li key={c.id}>
                      <button
                        onClick={()=> setActiveChapterId(c.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${activeChapterId===c.id ? "bg-sky-50" : ""}`}
                      >
                        <span className="line-clamp-1">{c.order}. {c.title}</span>
                        <span className="text-xs text-slate-500 ml-2">{c.durationMin} min {completedMap[c.id] ? "· ✔" : ""}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            </aside>

            <main className="md:col-span-3">
              <Card>
                <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    {!activeChapter ? (
                      <p className="text-sm text-slate-500">Sélectionnez un chapitre pour commencer.</p>
                    ) : (
                      <article className="prose prose-sm max-w-none">
                        <h2 className="text-lg font-semibold text-slate-900">{activeChapter.title}</h2>
                        <p className="text-xs text-slate-500">~ {activeChapter.durationMin} min</p>
                        <div className="mt-3 whitespace-pre-wrap text-slate-800">{activeChapter.content}</div>

                        <div className="mt-6 flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              onClick={()=>{
                                if (!chapters) return;
                                const idx = chapters.findIndex(ch=> ch.id===activeChapter.id);
                                if (idx>0) setActiveChapterId(chapters[idx-1].id);
                              }}
                            >
                              Chapitre précédent
                            </Button>
                            <Button
                              variant="soft"
                              onClick={()=>{
                                if (!chapters) return;
                                const idx = chapters.findIndex(ch=> ch.id===activeChapter.id);
                                if (idx+1 < chapters.length) setActiveChapterId(chapters[idx+1].id);
                              }}
                            >
                              Chapitre suivant
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            {completedMap[activeChapter.id] ? (
                              <span className="text-xs text-green-700">✔ Terminé</span>
                            ) : (
                              <Button onClick={()=> markChapterDone(activeChapter.id)}>Marquer ce chapitre terminé</Button>
                            )}
                          </div>
                        </div>
                      </article>
                    )}
                  </div>

                  <div className="lg:col-span-1">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm font-medium text-slate-800">Vos notes</p>
                      <Textarea
                        value={noteDraft}
                        onChange={(e)=> setNoteDraft(e.target.value)}
                        placeholder="Prendre une note liée à ce cours…"
                        className="mt-2 min-h-[100px]"
                      />
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <Button variant="ghost" onClick={()=> setNoteDraft("")}>Effacer</Button>
                        <Button onClick={saveNote}>Enregistrer</Button>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-slate-500">Historique</p>
                        <ul className="mt-2 space-y-2 max-h-48 overflow-auto">
                          {notes.map((n)=>(
                            <li key={n.id} className="rounded-lg border border-slate-200 p-2 text-xs text-slate-700 whitespace-pre-wrap">
                              {n.body}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={()=> router.push("/pro/academie")}>Retour à l’Académie</Button>
                <Button onClick={finalizeCourse}>Marquer le cours terminé</Button>
              </div>
            </main>
          </div>

          {error && <p className="mt-4 text-sm text-rose-700">{String(error)}</p>}
        </>
      )}
    </div>
  );
}
