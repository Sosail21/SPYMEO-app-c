// Cdw-Spm

export const dynamic = "force-dynamic";
// @ts-ignore
const __DB2 = (globalThis as any).__ACADEMY__ as any;
function ensurePC(){ __DB2.progressChapters ||= {}; }

export async function GET(req: Request) {
  ensurePC();
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId")!;
  const map = __DB2.progressChapters[lessonId] || {};
  return Response.json(map);
}

export async function POST(req: Request) {
  ensurePC();
  const body = await req.json();
  const { lessonId, chapterId, completed } = body || {};
  if (!lessonId || !chapterId) return new Response("Bad request", { status: 400 });
  __DB2.progressChapters[lessonId] ||= {};
  __DB2.progressChapters[lessonId][chapterId] = Boolean(completed);
  return Response.json(__DB2.progressChapters[lessonId]);
}
