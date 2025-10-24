// Cdw-Spm: Admin User Update API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const { action, value } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action manquante' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    let updatedUser;

    switch (action) {
      case 'changeRole':
        if (!value || !['FREE_USER', 'PASS_USER', 'PRACTITIONER', 'ARTISAN', 'COMMERCANT', 'CENTER', 'ADMIN'].includes(value)) {
          return NextResponse.json(
            { success: false, error: 'Rôle invalide' },
            { status: 400 }
          );
        }

        updatedUser = await prisma.user.update({
          where: { id },
          data: {
            role: value,
            // Mettre à jour userPlan si on change vers FREE_USER ou PASS_USER
            userPlan: value === 'FREE_USER' ? 'FREE' : value === 'PASS_USER' ? 'PASS' : user.userPlan,
          }
        });

        console.log(`[ADMIN] Rôle changé pour ${user.email}: ${user.role} → ${value}`);
        break;

      case 'toggleStatus':
        const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

        updatedUser = await prisma.user.update({
          where: { id },
          data: {
            status: newStatus
          }
        });

        console.log(`[ADMIN] Status changé pour ${user.email}: ${user.status} → ${newStatus}`);
        break;

      case 'updateStatus':
        if (!value || !['ACTIVE', 'PENDING_VALIDATION', 'PENDING_PAYMENT', 'REJECTED', 'SUSPENDED'].includes(value)) {
          return NextResponse.json(
            { success: false, error: 'Status invalide' },
            { status: 400 }
          );
        }

        updatedUser = await prisma.user.update({
          where: { id },
          data: {
            status: value
          }
        });

        console.log(`[ADMIN] Status mis à jour pour ${user.email}: ${user.status} → ${value}`);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('[ADMIN_USER_UPDATE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id }
    });

    console.log(`[ADMIN] Utilisateur supprimé: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error: any) {
    console.error('[ADMIN_USER_DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}
