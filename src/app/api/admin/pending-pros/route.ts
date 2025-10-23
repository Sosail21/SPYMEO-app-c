// Cdw-Spm: Get Pending Professionals API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: {
        status: 'PENDING_VALIDATION',
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
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('[ADMIN] Erreur liste pending:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
