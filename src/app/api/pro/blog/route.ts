// Cdw-Spm: Practitioner Blog Submission API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth/session';

// Helper pour vérifier si l'utilisateur est un praticien
async function checkPractitioner() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value);
    const user = await prisma.user.findUnique({
      where: { id: session.id }
    });

    if (!user || !['PRACTITIONER', 'ARTISAN', 'COMMERCANT', 'CENTER'].includes(user.role)) {
      return null;
    }

    return user;
  } catch (e) {
    return null;
  }
}

// POST - Soumettre un article pour validation
export async function POST(request: NextRequest) {
  try {
    const practitioner = await checkPractitioner();
    if (!practitioner) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux professionnels' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, slug, excerpt, content, category, tags, readingMinutes } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: 'Titre, slug et contenu requis' },
        { status: 400 }
      );
    }

    // Vérifier si le slug existe déjà
    const existing = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ce slug existe déjà. Veuillez en choisir un autre.' },
        { status: 400 }
      );
    }

    // Créer l'article avec statut SUBMITTED
    const authorName = practitioner.firstName && practitioner.lastName
      ? `${practitioner.firstName} ${practitioner.lastName}`
      : practitioner.name || 'Praticien SPYMEO';

    const article = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        category,
        tags: tags || [],
        readingMinutes: readingMinutes || 5,
        status: 'SUBMITTED',
        authorId: practitioner.id,
        authorName
      }
    });

    console.log(`[PRO_BLOG] Article soumis: ${article.title} par ${practitioner.email}`);

    return NextResponse.json({
      success: true,
      message: 'Article soumis avec succès. Il sera examiné par notre équipe.',
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status
      }
    });
  } catch (error: any) {
    console.error('[PRO_BLOG_SUBMIT] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la soumission de l\'article' },
      { status: 500 }
    );
  }
}

// GET - Liste des articles soumis par le praticien
export async function GET(request: NextRequest) {
  try {
    const practitioner = await checkPractitioner();
    if (!practitioner) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux professionnels' },
        { status: 403 }
      );
    }

    const articles = await prisma.blogPost.findMany({
      where: {
        authorId: practitioner.id
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        status: true,
        category: true,
        tags: true,
        views: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { likes: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      articles
    });
  } catch (error: any) {
    console.error('[PRO_BLOG_LIST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}
