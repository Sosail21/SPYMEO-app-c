// Cdw-Spm: Blog Post Detail with Like, Favorite & Share
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  views: number;
  readingMinutes: number;
  authorName: string;
  publishedAt: string;
  likesCount: number;
  isLiked: boolean;
  isFavorite: boolean;
};

export default function BlogPost({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blog/posts/${params.slug}`);
        const json = await res.json();

        if (json.success) {
          setPost(json.post);
        } else {
          // Article non trouvé
          router.push('/blog');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params.slug, router]);

  async function handleLike() {
    if (!post || actionLoading) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/blog/posts/${params.slug}/like`, {
        method: 'POST',
      });
      const json = await res.json();

      if (json.success) {
        setPost({ ...post, isLiked: json.isLiked, likesCount: json.likesCount });
      } else if (res.status === 401) {
        alert('Vous devez être connecté pour aimer un article');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFavorite() {
    if (!post || actionLoading) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/blog/posts/${params.slug}/favorite`, {
        method: 'POST',
      });
      const json = await res.json();

      if (json.success) {
        setPost({ ...post, isFavorite: json.isFavorite });
        alert(json.message);
      } else if (res.status === 401) {
        alert('Vous devez être connecté pour ajouter aux favoris');
      }
    } catch (error) {
      console.error('Error favoriting post:', error);
    } finally {
      setActionLoading(false);
    }
  }

  function handleShare(platform: 'twitter' | 'facebook' | 'linkedin' | 'copy') {
    if (!post) return;

    const url = `https://spymeo.fr/blog/${post.slug}`;
    const text = `${post.title} - SPYMEO`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Lien copié dans le presse-papier !');
        break;
    }
  }

  if (loading) {
    return (
      <main className="section">
        <div className="container-spy max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Chargement de l'article...</p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="section">
        <div className="container-spy max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Article non trouvé</h1>
          <Link href="/blog" className="btn">← Retour au blog</Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="post-hero">
        <div className="post-hero-inner">
          {post.coverImage && (
            <div className="post-hero-media" style={{ backgroundImage: `url(${post.coverImage})` }} />
          )}
          <div>
            <span className="badge">{post.category}</span>
            <h1 className="section-title" style={{ marginTop: 8 }}>
              {post.title}
            </h1>
            <p className="muted">
              {formatDate(post.publishedAt)} · {post.readingMinutes} min · Par {post.authorName}
            </p>
            <div className="mt-2 flex gap-2">
              <Link className="btn btn-outline" href="/blog">← Retour</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-spy max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            {/* Contenu principal */}
            <article>
              {post.excerpt && (
                <div className="text-lg text-muted mb-8 pb-8 border-b border-slate-200">
                  {post.excerpt}
                </div>
              )}

              <div className="prose prose-slate max-w-none">
                <div dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-muted mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?search=${tag}`}
                        className="pill pill-ghost hover:pill-muted"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="grid gap-4 content-start">
              {/* Actions */}
              <div className="soft-card p-4">
                <h3 className="text-sm font-semibold text-muted mb-3">Actions</h3>
                <div className="grid gap-2">
                  <button
                    onClick={handleLike}
                    disabled={actionLoading}
                    className={`btn w-full ${post.isLiked ? 'bg-red-50 text-red-600 border-red-200' : 'btn-outline'}`}
                  >
                    {post.isLiked ? '❤️' : '🤍'} {post.likesCount} J'aime
                  </button>

                  <button
                    onClick={handleFavorite}
                    disabled={actionLoading}
                    className={`btn w-full ${post.isFavorite ? 'bg-amber-50 text-amber-600 border-amber-200' : 'btn-outline'}`}
                  >
                    {post.isFavorite ? '⭐' : '☆'} Favoris
                  </button>
                </div>
              </div>

              {/* Partage */}
              <div className="soft-card p-4">
                <h3 className="text-sm font-semibold text-muted mb-3">Partager</h3>
                <div className="grid gap-2">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="btn btn-outline w-full text-left"
                  >
                    🐦 Twitter
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="btn btn-outline w-full text-left"
                  >
                    📘 Facebook
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="btn btn-outline w-full text-left"
                  >
                    💼 LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="btn btn-outline w-full text-left"
                  >
                    🔗 Copier le lien
                  </button>
                </div>
              </div>

              {/* Statistiques */}
              <div className="soft-card p-4">
                <h3 className="text-sm font-semibold text-muted mb-3">Statistiques</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Vues</span>
                    <span className="font-semibold">{post.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">J'aime</span>
                    <span className="font-semibold">{post.likesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Lecture</span>
                    <span className="font-semibold">{post.readingMinutes} min</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return iso;
  }
}

function formatContent(content: string) {
  // Convertir markdown simple en HTML (basique)
  let html = content;

  // Titres
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Gras et italique
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Listes
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Paragraphes
  html = html.split('\n\n').map(p => {
    if (p.trim() && !p.startsWith('<')) {
      return `<p>${p}</p>`;
    }
    return p;
  }).join('\n');

  return html;
}
