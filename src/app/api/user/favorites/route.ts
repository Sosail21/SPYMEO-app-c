// Cdw-Spm: User Favorites API - List all user favorites including blog posts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getUser() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('__spy_session');
    if (!sessionCookie) return null;

    const session = JSON.parse(sessionCookie.value);
    const user = await prisma.user.findUnique({
      where: { id: session.id }
    });

    return user;
  } catch (e) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifi�' },
        { status: 401 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch details for each favorite based on targetType
    const enrichedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        let title = '';
        let meta = '';
        let href = '';
        let kind = '';

        switch (fav.targetType) {
          case 'BLOG_POST': {
            const post = await prisma.blogPost.findUnique({
              where: { id: fav.targetId },
              select: { title: true, slug: true, excerpt: true, category: true }
            });
            if (post) {
              title = post.title;
              meta = post.category || post.excerpt || '';
              href = `/blog/${post.slug}`;
              kind = 'Article';
            }
            break;
          }

          case 'PRACTITIONER': {
            const practitioner = await prisma.user.findUnique({
              where: { id: fav.targetId },
              select: { firstName: true, lastName: true, specialties: true, city: true }
            });
            if (practitioner) {
              title = `${practitioner.firstName} ${practitioner.lastName}`;
              meta = `${(practitioner.specialties as string[])?.join(', ') || 'Praticien'}  ${practitioner.city || ''}`;
              href = `/praticien/${fav.targetSlug || fav.targetId}`;
              kind = 'Praticien';
            }
            break;
          }

          case 'ARTISAN': {
            const artisan = await prisma.user.findUnique({
              where: { id: fav.targetId },
              select: { name: true, firstName: true, lastName: true, specialties: true, city: true }
            });
            if (artisan) {
              title = artisan.name || `${artisan.firstName} ${artisan.lastName}`;
              meta = `${(artisan.specialties as string[])?.join(', ') || 'Artisan'}  ${artisan.city || ''}`;
              href = `/artisan/${fav.targetSlug || fav.targetId}`;
              kind = 'Artisan';
            }
            break;
          }

          case 'MERCHANT': {
            const merchant = await prisma.user.findUnique({
              where: { id: fav.targetId },
              select: { name: true, firstName: true, lastName: true, city: true }
            });
            if (merchant) {
              title = merchant.name || `${merchant.firstName} ${merchant.lastName}`;
              meta = `Commer�ant  ${merchant.city || ''}`;
              href = `/commercant/${fav.targetSlug || fav.targetId}`;
              kind = 'Commer�ant';
            }
            break;
          }

          case 'CENTER': {
            const center = await prisma.user.findUnique({
              where: { id: fav.targetId },
              select: { name: true, city: true }
            });
            if (center) {
              title = center.name || 'Centre de formation';
              meta = `Centre  ${center.city || ''}`;
              href = `/centre-de-formation/${fav.targetSlug || fav.targetId}`;
              kind = 'Centre';
            }
            break;
          }

          case 'PRODUCT': {
            // Products would need a separate Product model - for now, placeholder
            title = 'Produit';
            meta = 'Produit enregistr�';
            href = `/produit/${fav.targetSlug || fav.targetId}`;
            kind = 'Produit';
            break;
          }

          default:
            return null;
        }

        if (!title) return null; // Skip if entity not found or deleted

        return {
          id: fav.id,
          title,
          meta,
          href,
          kind,
          targetType: fav.targetType,
          createdAt: fav.createdAt
        };
      })
    );

    // Filter out null values (deleted entities)
    const validFavorites = enrichedFavorites.filter(f => f !== null);

    return NextResponse.json({
      success: true,
      favorites: validFavorites
    });
  } catch (error: any) {
    console.error('[USER_FAVORITES] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la r�cup�ration des favoris' },
      { status: 500 }
    );
  }
}
