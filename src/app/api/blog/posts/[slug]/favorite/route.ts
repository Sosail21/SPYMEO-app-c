// Cdw-Spm: Blog Post Favorite API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

type RouteContext = {
  params: {
    slug: string;
  };
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = context.params;

    // Get user session from cookies
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('__spy_session');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être connecté pour ajouter aux favoris' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;

    // Trouver le post
    const post = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si déjà en favoris
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: 'BLOG_POST',
          targetId: post.id
        }
      }
    });

    if (existingFavorite) {
      // Retirer des favoris
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });

      return NextResponse.json({
        success: true,
        isFavorite: false,
        message: 'Retiré des favoris'
      });
    } else {
      // Ajouter aux favoris
      await prisma.favorite.create({
        data: {
          userId,
          targetType: 'BLOG_POST',
          targetId: post.id,
          targetSlug: slug
        }
      });

      return NextResponse.json({
        success: true,
        isFavorite: true,
        message: 'Ajouté aux favoris'
      });
    }
  } catch (error: any) {
    console.error('[BLOG_FAVORITE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de l\'ajout aux favoris' },
      { status: 500 }
    );
  }
}
