
"use client";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";

export type Article = {
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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={[
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-sky-500",
        className || ""
      ].join(" ")}
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

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return (
    <select
      {...rest}
      className={[
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-sky-500",
        className || ""
      ].join(" ")}
    />
  );
}

function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }
) {
  const { variant = "primary", className, ...rest } = props;
  return (
    <button
      {...rest}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium",
        variant === "primary"
          ? "bg-sky-600 text-white hover:bg-sky-700"
          : "bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-200",
        className || ""
      ].join(" ")}
    />
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={["rounded-2xl border border-slate-200 bg-white shadow-sm", className].join(" ")}>{children}</div>;
}

function CardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function listArticles(): Promise<Article[]> {
  const res = await fetch("/api/articles", { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de charger les articles");
  return res.json();
}

async function createArticle(payload: Partial<Article>): Promise<Article> {
  const res = await fetch("/api/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Création impossible");
  return res.json();
}

export default function BlogProposerPage() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    category: "",
    coverUrl: "",
    status: "draft" as const,
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"new" | "top">("new");

  useEffect(() => {
    let alive = true;
    listArticles()
      .then((data) => {
        if (alive) setArticles(data);
      })
      .catch((e) => setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!articles) return [] as Article[];
    let list = articles;
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.join(",").toLowerCase().includes(q)
      );
    }
    if (sortBy === "new") {
      list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    } else {
      list = [...list].sort((a, b) => b.likes + b.comments - (a.likes + a.comments));
    }
    return list;
  }, [articles, query, statusFilter, sortBy]);

  function onChange<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const slug = slugify(form.title);
    const payload: Partial<Article> = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      category: form.category || undefined,
      coverUrl: form.coverUrl || undefined,
      status: form.status,
    };
    startTransition(() => {
      createArticle(payload)
        .then((created) => {
          setArticles((a) => (a ? [created, ...a] : [created]));
          setForm({ title: "", excerpt: "", content: "", tags: "", category: "", coverUrl: "", status: "draft" });
        })
        .catch((e) => setError(e.message));
    });
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Proposer un article</h1>
        <p className="text-sm text-slate-600 mt-1">
          Soumettez un brouillon ou publiez directement. Retrouvez en dessous la liste des articles déjà publiés avec likes, commentaires et lien public.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader title="Nouveau contenu" subtitle="Formulaire de soumission" right={<span className="text-xs text-slate-500">{isPending ? "Envoi…" : ""}</span>} />
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
          )}
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-700">Titre</label>
              <Input required value={form.title} onChange={(e) => onChange("title", e.target.value)} placeholder="Titre de l’article" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-700">Accroche (excerpt)</label>
              <Input value={form.excerpt} onChange={(e) => onChange("excerpt", e.target.value)} placeholder="Une phrase résumant l’article" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-700">Contenu</label>
              <Textarea required value={form.content} onChange={(e) => onChange("content", e.target.value)} placeholder="Votre contenu (Markdown autorisé)" className="min-h-[180px]" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Tags (séparés par des virgules)</label>
              <Input value={form.tags} onChange={(e) => onChange("tags", e.target.value)} placeholder="naturopathie, sommeil, digestion" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Catégorie</label>
              <Input value={form.category} onChange={(e) => onChange("category", e.target.value)} placeholder="Bien-être, Pratiques, Consommation…" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Image de couverture (URL)</label>
              <Input value={form.coverUrl} onChange={(e) => onChange("coverUrl", e.target.value)} placeholder="https://…" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Statut</label>
              <Select value={form.status} onChange={(e) => onChange("status", e.target.value as any)}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </Select>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <Button type="reset" variant="ghost" onClick={() => setForm({ title: "", excerpt: "", content: "", tags: "", category: "", coverUrl: "", status: "draft" })}>
                Réinitialiser
              </Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Articles"
          subtitle="Recherche, filtres et métriques"
          right={
            <div className="flex items-center gap-2">
              <Input placeholder="Rechercher…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-48" />
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                <option value="all">Tous</option>
                <option value="published">Publiés</option>
                <option value="draft">Brouillons</option>
              </Select>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="new">Plus récents</option>
                <option value="top">Top (likes + commentaires)</option>
              </Select>
            </div>
          }
        />
        <CardContent>
          {!articles && !error && <p className="text-sm text-slate-500">Chargement…</p>}
          {articles && filtered.length === 0 && (
            <p className="text-sm text-slate-500">Aucun article ne correspond à la recherche.</p>
          )}
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((a) => (
              <li key={a.id}>
                <article className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                  {a.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.coverUrl} alt="cover" className="h-40 w-full object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900 line-clamp-2">{a.title}</h3>
                      <span
                        className={
                          "rounded-full px-2 py-1 text-[10px] font-medium " +
                          (a.status === "published"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200")
                        }
                      >
                        {a.status === "published" ? "Publié" : "Brouillon"}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">{a.excerpt || "—"}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {a.tags.slice(0, 4).map((t) => (
                        <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-3">
                        <span>❤️ {a.likes}</span>
                        <span>💬 {a.comments}</span>
                      </div>
                      <Link href={`/publications/${a.slug}`} className="underline hover:no-underline">
                        Voir l’article
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-slate-500">
        Astuce : vous pouvez créer en brouillon, laisser la relecture interne, puis passer en publié quand c’est prêt.
      </p>
    </div>
  );
}
