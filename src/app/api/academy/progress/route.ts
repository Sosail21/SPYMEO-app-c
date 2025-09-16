
export const dynamic = "force-dynamic";
export type Lesson = any;
export type Progress = { lessonId: string; status: "non_commencé" | "en_cours" | "terminé"; percent: number; favorite: boolean; lastViewedAt?: string; };
export type Note = any; export type Comment = any;

// @ts-ignore
const db2 = globalThis.__ACADEMY__ as { lessons: Lesson[]; progress: Record<string, Progress>; notes: Note[]; comments: Comment[]; };

export async function GET() { return Response.json(Object.values(db2.progress)); }

export async function POST(req: Request) {
  const body = await req.json();
  const { lessonId } = body || {};
  if (!lessonId || !db2.progress[lessonId]) return new Response("Not found", { status: 404 });
  const p = db2.progress[lessonId];
  if (typeof body.favorite === "boolean") p.favorite = body.favorite;
  if (body.status) p.status = body.status;
  if (body.percent != null) p.percent = Math.max(0, Math.min(100, Number(body.percent)));
  p.lastViewedAt = new Date().toISOString();
  return Response.json(p);
}
