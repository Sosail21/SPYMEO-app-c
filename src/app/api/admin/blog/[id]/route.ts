// Cdw-Spm: Admin Blog API - Article individuel
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

type RouteContext = {
  params: {
    id: string;
  };
};

// Helper pour vérifier si l'utilisateur est admin
async function checkAdmin() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('__spy_session');

    if (!sessionCookie) {
      console.log('[ADMIN_BLOG_EDIT] Pas de cookie de session');
      return null;
    }

    const session = JSON.parse(sessionCookie.value);
    console.log('[ADMIN_BLOG_EDIT] Session trouvée, user ID:', session.id);

    const user = await prisma.user.findUnique({
      where: { id: session.id }
    });

    if (!user) {
      console.log('[ADMIN_BLOG_EDIT] Utilisateur non trouvé dans la DB');
      return null;
    }

    console.log('[ADMIN_BLOG_EDIT] Utilisateur trouvé, rôle:', user.role, 'email:', user.email);

    if (user.role !== 'ADMIN') {
      console.log('[ADMIN_BLOG_EDIT] Accès refusé: rôle', user.role, 'au lieu de ADMIN');
      return null;
    }

    return user;
  } catch (e) {
    console.error('[ADMIN_BLOG_EDIT] Erreur checkAdmin:', e);
    return null;
  }
}

// GET - Récupérer un article pour édition
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { id } = context.params;

    const article = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        _count: {
          select: { likes: true }
        }
      }
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article
    });
  } catch (error: any) {
    console.error('[ADMIN_BLOG_GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un article
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { id } = context.params;
    const body = await request.json();

    const article = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.readingMinutes !== undefined) updateData.readingMinutes = body.readingMinutes;

    if (body.status !== undefined) {
      updateData.status = body.status;
      // Si on publie, mettre la date de publication
      if (body.status === 'PUBLISHED' && !article.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedArticle = await prisma.blogPost.update({
      where: { id },
      data: updateData
    });

    console.log(`[ADMIN_BLOG] Article mis à jour: ${updatedArticle.title} par ${admin.email}`);

    return NextResponse.json({
      success: true,
      article: updatedArticle
    });
  } catch (error: any) {
    console.error('[ADMIN_BLOG_UPDATE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la mise à jour de l\'article' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un article
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { id } = context.params;

    const article = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    await prisma.blogPost.delete({
      where: { id }
    });

    console.log(`[ADMIN_BLOG] Article supprimé: ${article.title} par ${admin.email}`);

    return NextResponse.json({
      success: true,
      message: 'Article supprimé avec succès'
    });
  } catch (error: any) {
    console.error('[ADMIN_BLOG_DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la suppression de l\'article' },
      { status: 500 }
    );
  }
}
