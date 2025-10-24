// Cdw-Spm: Admin Blog API - Liste et création
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Helper pour vérifier si l'utilisateur est admin
async function checkAdmin() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('__spy_session');

    if (!sessionCookie) {
      console.log('[ADMIN_BLOG] Pas de cookie de session');
      return null;
    }

    const session = JSON.parse(sessionCookie.value);
    console.log('[ADMIN_BLOG] Session trouvée, user ID:', session.id);

    const user = await prisma.user.findUnique({
      where: { id: session.id }
    });

    if (!user) {
      console.log('[ADMIN_BLOG] Utilisateur non trouvé dans la DB');
      return null;
    }

    console.log('[ADMIN_BLOG] Utilisateur trouvé, rôle:', user.role, 'email:', user.email);

    if (user.role !== 'ADMIN') {
      console.log('[ADMIN_BLOG] Accès refusé: rôle', user.role, 'au lieu de ADMIN');
      return null;
    }

    return user;
  } catch (e) {
    console.error('[ADMIN_BLOG] Erreur checkAdmin:', e);
    return null;
  }
}

// GET - Liste tous les articles (admin)
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const articles = await prisma.blogPost.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        tags: true,
        category: true,
        authorName: true,
        authorId: true,
        views: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { likes: true }
        },
        author: {
          select: {
            role: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // SUBMITTED en premier
        { updatedAt: 'desc' }
      ]
    });

    const formattedArticles = articles.map(article => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      status: article.status,
      tags: article.tags,
      category: article.category,
      author: article.authorName,
      authorId: article.authorId,
      source: article.author.role === 'ADMIN' ? 'ADMIN' : 'PRACTITIONER',
      views: article.views,
      likesCount: article._count.likes,
      publishedAt: article.publishedAt?.toISOString(),
      submittedAt: article.status === 'SUBMITTED' ? article.createdAt.toISOString() : undefined,
      updatedAt: article.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      articles: formattedArticles
    });
  } catch (error: any) {
    console.error('[ADMIN_BLOG_LIST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel article (admin)
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, slug, excerpt, content, coverImage, category, tags, readingMinutes, status } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: 'Titre et slug requis' },
        { status: 400 }
      );
    }

    // Vérifier si le slug existe déjà
    const existing = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ce slug existe déjà' },
        { status: 400 }
      );
    }

    // Créer l'article
    const article = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        category,
        tags: tags || [],
        readingMinutes: readingMinutes || 5,
        status: status || 'DRAFT',
        authorId: admin.id,
        authorName: 'Équipe SPYMEO',
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      }
    });

    console.log(`[ADMIN_BLOG] Article créé: ${article.title} par ${admin.email}`);

    return NextResponse.json({
      success: true,
      article
    });
  } catch (error: any) {
    console.error('[ADMIN_BLOG_CREATE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la création de l\'article' },
      { status: 500 }
    );
  }
}
