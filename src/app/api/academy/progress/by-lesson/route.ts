
export const dynamic = "force-dynamic";
export type Progress = { lessonId: string; status: "non_commencé" | "en_cours" | "terminé"; percent: number; favorite: boolean; lastViewedAt?: string; };
// @ts-ignore
const __DB3 = (globalThis as any).__ACADEMY__ as { progress: Record<string, Progress> };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId")!;
  const p = __DB3.progress[lessonId];
  return Response.json(p || { lessonId, status: "non_commencé", percent: 0, favorite: false });
}
