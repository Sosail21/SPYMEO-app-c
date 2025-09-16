
export const dynamic = "force-dynamic";
export type Lesson = any; export type Progress = any;
export type Note = { id: string; lessonId: string; body: string; createdAt: string; updatedAt: string; };
export type Comment = any;

// @ts-ignore
const db3 = globalThis.__ACADEMY__ as { lessons: Lesson[]; progress: Record<string, Progress>; notes: Note[]; comments: Comment[]; };

export async function GET() { return Response.json(db3.notes); }
export async function POST(req: Request) {
  const body = await req.json();
  if (!body.lessonId || !body.body?.trim()) return new Response("Bad request", { status: 400 });
  const note: Note = { id: crypto.randomUUID(), lessonId: body.lessonId, body: String(body.body), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  db3.notes.push(note);
  return Response.json(note, { status: 201 });
}
