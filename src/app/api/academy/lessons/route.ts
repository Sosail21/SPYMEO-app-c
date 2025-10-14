// Cdw-Spm

export const dynamic = "force-dynamic";

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
export type Note = { id: string; lessonId: string; body: string; createdAt: string; updatedAt: string; };
export type Comment = { id: string; lessonId: string; authorId: string; body: string; createdAt: string; };

// @ts-ignore — dev-only in-memory store
(globalThis as any).__ACADEMY__ = (globalThis as any).__ACADEMY__ || seed();
const db = (globalThis as any).__ACADEMY__ as { lessons: Lesson[]; progress: Record<string, Progress>; notes: Note[]; comments: Comment[]; chapters?: any; progressChapters?: any; };

export async function GET() { return Response.json(db.lessons); }

export async function POST(req: Request) {
  const body = await req.json();
  if (body?.action === "like" && body.lessonId) {
    const lesson = db.lessons.find((l) => l.id === body.lessonId);
    if (!lesson) return new Response("Not found", { status: 404 });
    lesson.likes += 1;
    return Response.json(lesson);
  }
  return new Response("Bad request", { status: 400 });
}

function seed() {
  const lessons: Lesson[] = [
    { id: crypto.randomUUID(), title: "Choisir son statut juridique (micro, EI, EURL, SASU)", durationMin: 35, kind: "cours", tags: ["juridique","business"], difficulty: "débutant", coverUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop", description: "Comprendre les statuts adaptés aux praticiens bien-être et leurs impacts fiscaux/social.", content: "Intro, comparatif, cas pratiques, check-list d'ouverture…", likes: 14, comments: 6 },
    { id: crypto.randomUUID(), title: "Bâtir une identité visuelle cohérente et accessible", durationMin: 28, kind: "guide", tags: ["branding","design"], difficulty: "débutant", coverUrl: "https://images.unsplash.com/photo-1529336953121-a0f44e9a6bfa?q=80&w=1200&auto=format&fit=crop", description: "Palette, typographies, logo minimal, cohérence multi-supports.", content: "Méthode pas-à-pas + modèles", likes: 22, comments: 11 },
    { id: crypto.randomUUID(), title: "Site web éco-conçu et SEO local", durationMin: 42, kind: "atelier", tags: ["web","seo"], difficulty: "intermédiaire", coverUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop", description: "Architecture, performance, accessibilité, pages qui convertissent.", content: "Checklist technique + templates.", likes: 31, comments: 15 },
    { id: crypto.randomUUID(), title: "Se positionner en tant que praticien et construire son offre", durationMin: 33, kind: "cours", tags: ["positionnement","offre"], difficulty: "intermédiaire", coverUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop", description: "Différenciation, niche utile, message clair, preuve sociale.", content: "Canvas + exemples.", likes: 18, comments: 9 },
  ];
  const progress: Record<string, Progress> = Object.fromEntries(lessons.map((l)=> [l.id, { lessonId: l.id, status: "non_commencé", percent: 0, favorite: false }]));
  return { lessons, progress, notes: [], comments: [] };
}
