// Cdw-Spm: Blog Post Like API
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
        { success: false, error: 'Vous devez être connecté pour aimer un article' },
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

    // Vérifier si déjà liké
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: post.id
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.blogLike.delete({
        where: { id: existingLike.id }
      });

      const likesCount = await prisma.blogLike.count({
        where: { postId: post.id }
      });

      return NextResponse.json({
        success: true,
        isLiked: false,
        likesCount
      });
    } else {
      // Like
      await prisma.blogLike.create({
        data: {
          userId,
          postId: post.id
        }
      });

      const likesCount = await prisma.blogLike.count({
        where: { postId: post.id }
      });

      return NextResponse.json({
        success: true,
        isLiked: true,
        likesCount
      });
    }
  } catch (error: any) {
    console.error('[BLOG_LIKE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du like' },
      { status: 500 }
    );
  }
}
