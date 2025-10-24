// Cdw-Spm: Blog Post Detail API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth/session';

type RouteContext = {
  params: {
    slug: string;
  };
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = context.params;

    //Get user session from cookies
    let userId: string | null = null;
    try {
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get(COOKIE_NAME);
      if (sessionCookie) {
        const session = JSON.parse(sessionCookie.value);
        userId = session.id;
      }
    } catch (e) {
      // Pas de session, utilisateur anonyme
    }

    // Récupérer le post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        coverImage: true,
        category: true,
        tags: true,
        views: true,
        readingMinutes: true,
        authorId: true,
        authorName: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { likes: true }
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a liké cet article
    let isLiked = false;
    let isFavorite = false;

    if (userId) {
      const like = await prisma.blogLike.findUnique({
        where: {
          userId_postId: {
            userId,
            postId: post.id
          }
        }
      });
      isLiked = !!like;

      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_targetType_targetId: {
            userId,
            targetType: 'BLOG_POST',
            targetId: post.id
          }
        }
      });
      isFavorite = !!favorite;
    }

    // Incrémenter les vues
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        likesCount: post._count.likes,
        isLiked,
        isFavorite,
        _count: undefined
      }
    });
  } catch (error: any) {
    console.error('[BLOG_POST_DETAIL] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    );
  }
}
