
export const dynamic = "force-dynamic";
export type Lesson = any; export type Progress = any; export type Note = any;
export type Comment = { id: string; lessonId: string; authorId: string; body: string; createdAt: string; };

// @ts-ignore
const db4 = globalThis.__ACADEMY__ as { lessons: Lesson[]; progress: Record<string, Progress>; notes: Note[]; comments: Comment[]; };

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.lessonId || !body.body?.trim()) return new Response("Bad request", { status: 400 });
  const c: Comment = { id: crypto.randomUUID(), lessonId: body.lessonId, authorId: "current-user", body: String(body.body), createdAt: new Date().toISOString() };
  db4.comments.push(c);
  const lesson = db4.lessons.find((l)=> l.id === body.lessonId);
  if (lesson) lesson.comments += 1;
  return Response.json(c, { status: 201 });
}
