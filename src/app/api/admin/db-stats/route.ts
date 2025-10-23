// Cdw-Spm: Database Statistics and Viewer API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Récupérer toutes les statistiques en parallèle
    const [
      totalUsers,
      usersByRole,
      usersByStatus,
      recentUsers,
      allUsers,
    ] = await Promise.all([
      // Total des utilisateurs
      prisma.user.count(),

      // Utilisateurs par rôle
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),

      // Utilisateurs par statut
      prisma.user.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // 10 derniers utilisateurs créés
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          role: true,
          status: true,
          plan: true,
          createdAt: true,
        },
      }),

      // Tous les utilisateurs (pour vue complète)
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          role: true,
          status: true,
          plan: true,
          city: true,
          profileData: true,
          businessData: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    // Formater les résultats
    const stats = {
      overview: {
        totalUsers,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        byStatus: usersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
      },
      recentUsers,
      allUsers,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[ADMIN] Erreur récupération stats DB:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
