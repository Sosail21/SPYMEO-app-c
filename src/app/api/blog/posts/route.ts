// Cdw-Spm: Blog Posts Public API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Construire la requête where
    const where: any = {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() }
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    // Récupérer les posts
    const posts = await prisma.blogPost.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        views: true,
        readingMinutes: true,
        authorName: true,
        publishedAt: true,
        createdAt: true,
        _count: {
          select: { likes: true }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit,
      skip
    });

    // Formater les résultats
    const formattedPosts = posts.map(post => ({
      ...post,
      likesCount: post._count.likes,
      _count: undefined
    }));

    // Récupérer les statistiques pour la sidebar
    const categories = await prisma.blogPost.groupBy({
      by: ['category'],
      where: { status: 'PUBLISHED' },
      _count: { id: true }
    });

    const tags = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { tags: true }
    });

    // Extraire tous les tags uniques
    const allTags = [...new Set(tags.flatMap(t => t.tags))];

    // Articles les plus populaires
    const popular = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        slug: true,
        title: true,
        views: true,
        readingMinutes: true
      },
      orderBy: { views: 'desc' },
      take: 5
    });

    return NextResponse.json({
      success: true,
      posts: formattedPosts,
      meta: {
        total: await prisma.blogPost.count({ where }),
        categories: categories.map(c => ({
          name: c.category,
          count: c._count.id
        })),
        tags: allTags,
        popular
      }
    });
  } catch (error: any) {
    console.error('[BLOG_POSTS] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}
