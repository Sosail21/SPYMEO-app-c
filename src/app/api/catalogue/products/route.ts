import { NextResponse } from "next/server";

type ProductStatus = "DRAFT" | "PUBLISHED";
type Product = {
  id: string;
  title: string;
  slug: string;
  sku?: string;
  price: number;
  stock: number;
  status: ProductStatus;
  shortDesc?: string;
  description?: string;
  categories: string[];
  tags: string[];
  images: string[];
  updatedAt: string;
  views?: number;
  likes?: number;
  orders?: number;
};

// In-memory (reset à chaque reboot dev)
const g = globalThis as any;
if (!g.__CATALOG__) g.__CATALOG__ = [] as Product[];

export async function GET() {
  try {
    return NextResponse.json(g.__CATALOG__ as Product[], { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Product>;
    if (!body?.title || !body?.slug || typeof body.price !== "number" || typeof body.stock !== "number") {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const prod: Product = {
      id: crypto.randomUUID(),
      title: body.title!,
      slug: body.slug!,
      sku: body.sku,
      price: Number(body.price),
      stock: Number(body.stock),
      status: (body.status as ProductStatus) || "DRAFT",
      shortDesc: body.shortDesc || "",
      description: body.description || "",
      categories: Array.isArray(body.categories) ? body.categories : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      images: Array.isArray(body.images) ? body.images.slice(0, 6) : [],
      updatedAt: now,
      views: 0,
      likes: 0,
      orders: 0,
    };
    g.__CATALOG__.unshift(prod);
    return NextResponse.json(prod, { status: 201 });
  } catch (e) {
    console.error("POST /api/catalogue/products", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}