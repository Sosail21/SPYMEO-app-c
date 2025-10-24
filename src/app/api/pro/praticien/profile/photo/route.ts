// API route for practitioner profile photo upload
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await verifySession(cookieStore);

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Verify user is a practitioner
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user || user.role !== 'PRACTITIONER') {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux praticiens' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('photo') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucune photo fournie' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Le fichier doit être une image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'La photo ne doit pas dépasser 5 Mo' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const key = `practitioner/profile/${session.userId}_${timestamp}.${ext}`;

    const fileUrl = await uploadFileToS3(buffer, key, file.type);

    // Update user profile with avatar URL
    await prisma.profile.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        avatar: fileUrl,
      },
      update: {
        avatar: fileUrl,
      },
    });

    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: 'Photo de profil mise à jour',
    });
  } catch (error) {
    console.error('[POST /api/pro/praticien/profile/photo] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'upload de la photo' },
      { status: 500 }
    );
  }
}
