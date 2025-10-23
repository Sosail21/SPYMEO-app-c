// Cdw-Spm: Get All Professionals API (all statuses)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['PRACTITIONER', 'ARTISAN', 'COMMERCANT', 'CENTER'] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        phone: true,
        siret: true,
        role: true,
        status: true,
        profileData: true,
        businessData: true,
        applicationDocuments: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('[ADMIN] Erreur liste all pros:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
