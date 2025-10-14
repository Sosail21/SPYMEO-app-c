// Cdw-Spm

export const dynamic = "force-dynamic";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  category?: string;
  coverUrl?: string;
  status: "draft" | "published";
  authorId: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// @ts-ignore – dev-only in-memory store
(globalThis as any).__ARTICLES__ = (globalThis as any).__ARTICLES__ || seed();
const store = (globalThis as any).__ARTICLES__ as Article[];

export async function GET() {
  return Response.json(store);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Article>;
  if (!body.title || !body.content) {
    return new Response("Missing fields", { status: 400 });
  }
  const now = new Date().toISOString();
  const created: Article = {
    id: crypto.randomUUID(),
    title: body.title!,
    slug: (body.slug || slugify(body.title!))!,
    excerpt: body.excerpt || "",
    content: body.content!,
    tags: Array.isArray(body.tags) ? body.tags : [],
    category: body.category,
    coverUrl: body.coverUrl,
    status: (body.status as any) || "draft",
    authorId: "current-user",
    createdAt: now,
    updatedAt: now,
    likes: 0,
    comments: 0,
  };
  store.unshift(created);
  return new Response(JSON.stringify(created), { headers: { "Content-Type": "application/json" }, status: 201 });
}

function seed(): Article[] {
  const now = new Date();
  return [
    {
      id: crypto.randomUUID(),
      title: "La sieste active : 5 minutes qui changent votre journée",
      slug: "sieste-active-5-min",
      excerpt: "Micro-récupération, respiration, et reset du système nerveux.",
      content: "Contenu…",
      tags: ["sommeil", "stress", "respiration"],
      category: "Bien-être",
      coverUrl: "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=1200&auto=format&fit=crop",
      status: "published",
      authorId: "cindy",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      likes: 23,
      comments: 7,
    },
    {
      id: crypto.randomUUID(),
      title: "Décoder les étiquettes : additifs à éviter",
      slug: "decoder-etiquettes-additifs",
      excerpt: "3 réflexes concrets pour faire de meilleurs choix.",
      content: "Contenu…",
      tags: ["consommation", "alimentation"],
      category: "Consommation",
      coverUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31b?q=80&w=1200&auto=format&fit=crop",
      status: "published",
      authorId: "cindy",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      likes: 54,
      comments: 18,
    },
    {
      id: crypto.randomUUID(),
      title: "Carnet de Vie : pourquoi ça marche ?",
      slug: "carnet-de-vie-pourquoi",
      excerpt: "Cohérence, suivi et autonomie : le combo gagnant.",
      content: "Contenu…",
      tags: ["carnetdevie", "habitudes"],
      category: "Outils",
      coverUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop",
      status: "draft",
      authorId: "cindy",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
      likes: 0,
      comments: 0,
    },
  ];
}
