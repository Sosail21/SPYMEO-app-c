// Cdw-Spm: Reset Password API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token et mot de passe requis' },
        { status: 400 }
      );
    }

    // Valider le mot de passe
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Hasher le token pour comparer avec celui en base
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Chercher tous les utilisateurs pour vérifier le token
    const users = await prisma.user.findMany({
      where: {
        profileData: {
          path: ['resetToken'],
          not: null
        }
      }
    });

    // Trouver l'utilisateur avec le bon token non expiré
    let targetUser = null;
    for (const user of users) {
      const profileData = user.profileData as any;
      if (profileData?.resetToken === resetTokenHash) {
        const resetTokenExpiry = profileData?.resetTokenExpiry;
        if (resetTokenExpiry && new Date(resetTokenExpiry) > new Date()) {
          targetUser = user;
          break;
        }
      }
    }

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe et supprimer le token de réinitialisation
    const profileData = targetUser.profileData as any || {};
    delete profileData.resetToken;
    delete profileData.resetTokenExpiry;

    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        password: hashedPassword,
        profileData: profileData
      }
    });

    console.log(`[RESET_PASSWORD] Mot de passe réinitialisé pour ${targetUser.email}`);

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error: any) {
    console.error('[RESET_PASSWORD] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
}
