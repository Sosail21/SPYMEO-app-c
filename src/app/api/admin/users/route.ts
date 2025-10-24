// Cdw-Spm: Admin Users API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les utilisateurs avec leurs informations de base
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        userPlan: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les données pour le front-end
    const formattedUsers = users.map(user => {
      // Construire le nom complet
      let displayName = user.name || '';
      if (!displayName && user.firstName && user.lastName) {
        displayName = `${user.firstName} ${user.lastName}`;
      } else if (!displayName && user.firstName) {
        displayName = user.firstName;
      } else if (!displayName && user.lastName) {
        displayName = user.lastName;
      } else if (!displayName) {
        displayName = 'Utilisateur sans nom';
      }

      return {
        id: user.id,
        name: displayName,
        email: user.email,
        role: user.role,
        status: user.status,
        passActive: user.role === 'PASS_USER' && user.status === 'ACTIVE',
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      };
    });

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });
  } catch (error: any) {
    console.error('[ADMIN_USERS] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}
