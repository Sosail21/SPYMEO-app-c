// Cdw-Spm: User Registration API (Particuliers)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

const registerSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
  userPlan: z.enum(['FREE', 'PASS']).default('FREE'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: passwordHash,
        name: data.name,
        role: 'PASS_USER',
        status: 'ACTIVE',
        userPlan: data.userPlan,
      },
    });

    console.log(`[REGISTER] Nouveau compte ${data.userPlan}: ${user.email}`);

    // Si PASS, rediriger vers paiement
    if (data.userPlan === 'PASS') {
      return NextResponse.json({
        success: true,
        userId: user.id,
        redirectTo: `/payment/pass?userId=${user.id}`,
      });
    }

    // Si FREE, compte actif immédiatement
    return NextResponse.json({
      success: true,
      userId: user.id,
      message: 'Compte créé avec succès',
    });
  } catch (error: any) {
    console.error('[REGISTER] Erreur:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
