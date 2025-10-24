// Cdw-Spm: Admin Metrics API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Compter le nombre total d'utilisateurs (FREE_USER + PASS_USER)
    const totalUsers = await prisma.user.count({
      where: {
        role: {
          in: ['FREE_USER', 'PASS_USER']
        }
      }
    });

    // Compter les pros actifs (PRACTITIONER, ARTISAN, COMMERCANT, CENTER)
    const totalPros = await prisma.user.count({
      where: {
        role: {
          in: ['PRACTITIONER', 'ARTISAN', 'COMMERCANT', 'CENTER']
        },
        status: 'ACTIVE'
      }
    });

    // Compter les centres
    const totalCenters = await prisma.user.count({
      where: {
        role: 'CENTER',
        status: 'ACTIVE'
      }
    });

    // Compter les PASS actifs
    const passActive = await prisma.user.count({
      where: {
        role: 'PASS_USER',
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({
      success: true,
      kpis: {
        users: totalUsers,
        pros: totalPros,
        centers: totalCenters,
        passActive: passActive
      }
    });
  } catch (error: any) {
    console.error('[ADMIN_METRICS] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération des métriques' },
      { status: 500 }
    );
  }
}
