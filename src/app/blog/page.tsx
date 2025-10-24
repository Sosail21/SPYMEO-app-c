// Cdw-Spm: Blog Page with Real Data
"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  tags: string[];
  views: number;
  readingMinutes: number;
  authorName: string;
  coverImage?: string;
  likesCount: number;
};

type BlogData = {
  posts: Post[];
  meta: {
    total: number;
    categories: { name: string; count: number }[];
    tags: string[];
    popular: { id: string; slug: string; title: string; views: number; readingMinutes: number }[];
  };
};

export default function BlogIndex() {
  const [data, setData] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const params = new URLSearchParams();
        if (cat) params.set('category', cat);
        if (q) params.set('search', q);

        const res = await fetch(`/api/blog/posts?${params.toString()}`);
        const json = await res.json();

        if (json.success) {
          setData(json);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [cat, q]);

  const featured = useMemo(
    () => data?.posts && data.posts.length > 0 ? data.posts.sort((a, b) => b.views - a.views)[0] : null,
    [data]
  );

  const latest = useMemo(() => data?.posts || [], [data]);

  return (
    <main>
      {/* HERO Blog */}
      <section className="post-hero">
        <div className="container-spy max-w-4xl mx-auto text-center py-8">
          <span className="badge">SPYM'Blog</span>
          <h1 className="section-title" style={{ marginTop: 8 }}>
            Inspirations & repères pour une santé globale
          </h1>
          <p className="muted">
            Des guides pratico-pratiques, des éclairages sans blabla, et des retours d'expérience.
          </p>

          <form className="search mt-3 max-w-2xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un article (ex : sommeil, praticien, local...)"
            />
            <button className="btn rounded-full" type="submit">
              Rechercher
            </button>
          </form>

          <div className="chips-row justify-center">
            <button
              type="button"
              className={`chip ${cat === null ? "is-active" : ""}`}
              onClick={() => setCat(null)}
            >
              Tous
            </button>
            {data?.meta.categories.map((c) => (
              <button
                key={c.name}
                type="button"
                className={`chip ${cat === c.name ? "is-active" : ""}`}
                onClick={() => setCat(c.name)}
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="post-layout">
          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-muted">Chargement des articles...</p>
              </div>
            ) : latest.length === 0 ? (
              <div className="soft-card p-8 text-center">
                <h3 className="text-lg font-semibold">Aucun article trouvé</h3>
                <p className="text-muted mt-2">Essayez de modifier vos critères de recherche.</p>
              </div>
            ) : (
              <>
                {/* À la une */}
                {featured && (
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="post-card transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
                  >
                    <span className="post-cover" style={featured.coverImage ? { backgroundImage: `url(${featured.coverImage})` } : {}} />
                    <div className="post-body">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <span>{formatDate(featured.publishedAt)}</span>·
                        <span>{featured.readingMinutes} min</span>·
                        <span>{featured.category}</span>·
                        <span>❤️ {featured.likesCount}</span>
                      </div>
                      <h2 className="text-xl font-semibold">{featured.title}</h2>
                      <p className="text-muted">{featured.excerpt}</p>
                      <div className="flex gap-2">
                        {featured.tags.map((t) => (
                          <span key={t} className="pill pill-muted">{t}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                )}

                {/* Grille d'articles */}
                <section>
                  <h3 className="section-title" style={{ marginBottom: 12 }}>Derniers articles</h3>
                  <div className="post-grid">
                    {latest.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="post-card transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_36px_rgba(11,18,57,0.12)]"
                      >
                        <span className="post-cover" style={p.coverImage ? { backgroundImage: `url(${p.coverImage})` } : {}} />
                        <div className="post-body">
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <span>{formatDate(p.publishedAt)}</span>·
                            <span>{p.readingMinutes} min</span>·
                            <span>{p.category}</span>
                          </div>
                          <h3 className="font-semibold">{p.title}</h3>
                          <p className="text-muted">{p.excerpt}</p>
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <span>Par {p.authorName}</span>·
                            <span>❤️ {p.likesCount}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="grid gap-6">
            {/* Populaires */}
            {data?.meta.popular && data.meta.popular.length > 0 && (
              <section className="soft-card p-4">
                <h3 className="m-0 mb-2">Les plus populaires</h3>
                <ul className="grid gap-3">
                  {data.meta.popular.map((p) => {
                    const fullPost = data.posts.find(post => post.slug === p.slug);
                    return (
                      <li key={p.slug} className="grid grid-cols-[56px_1fr] gap-3 items-center">
                        <div
                          className="block w-14 h-14 rounded-md bg-[linear-gradient(135deg,#17a2b8,#5ce0ee)] overflow-hidden"
                          style={fullPost?.coverImage ? {
                            backgroundImage: `url(${fullPost.coverImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          } : {}}
                        />
                        <div className="grid">
                          <Link className="font-semibold leading-tight hover:underline" href={`/blog/${p.slug}`}>
                            {p.title}
                          </Link>
                          <span className="text-sm text-muted">{abbrViews(p.views)} vues · {p.readingMinutes} min</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {/* Catégories */}
            {data?.meta.categories && data.meta.categories.length > 0 && (
              <section className="soft-card p-4">
                <h3 className="m-0 mb-2">Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  {data.meta.categories.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCat((prev) => (prev === c.name ? null : c.name))}
                      className={`pill ${cat === c.name ? "pill-solid" : "pill-muted"}`}
                    >
                      {c.name} ({c.count})
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {data?.meta.tags && data.meta.tags.length > 0 && (
              <section className="soft-card p-4">
                <h3 className="m-0 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {data.meta.tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setQ(t)}
                      className="pill pill-ghost hover:pill-muted"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}

function abbrViews(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `${v}`;
}
