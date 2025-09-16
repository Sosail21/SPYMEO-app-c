
export const dynamic = "force-dynamic";
export type Lesson = any; export type Progress = any; export type Note = any; export type Comment = any;
export type Chapter = { id: string; lessonId: string; title: string; order: number; durationMin: number; content: string; };

// @ts-ignore
const __DB = (globalThis as any).__ACADEMY__ as { lessons: Lesson[]; progress: Record<string, any>; notes: any[]; comments: any[]; chapters?: Chapter[]; progressChapters?: Record<string, Record<string, boolean>>; };

function ensureSeed() {
  if (!__DB.chapters) {
    const L = __DB.lessons;
    const l1 = L[0]?.id, l2 = L[1]?.id, l3 = L[2]?.id, l4 = L[3]?.id;
    __DB.chapters = [
      { id: crypto.randomUUID(), lessonId: l1, order: 1, title: "Panorama des statuts", durationMin: 8, content: "Micro, EI, EURL, SASU : définitions et usages." },
      { id: crypto.randomUUID(), lessonId: l1, order: 2, title: "Fiscal & social", durationMin: 10, content: "Cotisations, TVA, plafonds, charges." },
      { id: crypto.randomUUID(), lessonId: l1, order: 3, title: "Cas pratiques", durationMin: 12, content: "3 profils et le statut conseillé." },
      { id: crypto.randomUUID(), lessonId: l1, order: 4, title: "Checklist d’ouverture", durationMin: 5, content: "INPI, URSSAF, assurance pro." },
      { id: crypto.randomUUID(), lessonId: l2, order: 1, title: "Fondations de marque", durationMin: 7, content: "Vision, mission, promesse." },
      { id: crypto.randomUUID(), lessonId: l2, order: 2, title: "Palette & typos", durationMin: 6, content: "Accessibilité, contraste, lisibilité." },
      { id: crypto.randomUUID(), lessonId: l2, order: 3, title: "Logo minimal", durationMin: 7, content: "Formats, déclinaisons." },
      { id: crypto.randomUUID(), lessonId: l3, order: 1, title: "Eco-conception", durationMin: 10, content: "Poids pages, images, cache, sobriété." },
      { id: crypto.randomUUID(), lessonId: l3, order: 2, title: "SEO local", durationMin: 12, content: "GBP, mots-clés locaux, avis." },
      { id: crypto.randomUUID(), lessonId: l3, order: 3, title: "Pages qui convertissent", durationMin: 15, content: "Hero clair, preuve sociale, CTA." },
      { id: crypto.randomUUID(), lessonId: l4, order: 1, title: "Positionnement utile", durationMin: 8, content: "Segment, problème, bénéfice." },
      { id: crypto.randomUUID(), lessonId: l4, order: 2, title: "Offre & prix", durationMin: 12, content: "Packaging, options, ancrage." },
      { id: crypto.randomUUID(), lessonId: l4, order: 3, title: "Preuve sociale", durationMin: 8, content: "Avis, cas clients, contenus." },
    ];
  }
  __DB.progressChapters ||= {};
}

export async function GET(req: Request) {
  ensureSeed();
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");
  const data = __DB.chapters!.filter((c)=> !lessonId || c.lessonId === lessonId);
  return Response.json(data);
}

export async function POST(req: Request) {
  ensureSeed();
  const body = await req.json();
  if (body?.action === "add" && body.lessonId) {
    const maxOrder = Math.max(0, ...__DB.chapters!.filter(c => c.lessonId === body.lessonId).map(c => c.order));
    const newC: Chapter = { id: crypto.randomUUID(), lessonId: body.lessonId, order: maxOrder + 1, title: String(body.title||"Nouveau chapitre"), durationMin: Number(body.durationMin||5), content: String(body.content||"") };
    __DB.chapters!.push(newC);
    return Response.json(newC, { status: 201 });
  }
  return new Response("Bad request", { status: 400 });
}
