// Cdw-Spm: File Upload API
import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToS3 } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'uploads';
    const userId = formData.get('userId') as string || 'temp';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10MB)' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier (PDF, images, docs)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé (PDF, images, ou documents Word uniquement)' },
        { status: 400 }
      );
    }

    console.log(`[UPLOAD] Uploading ${file.name} (${file.size} bytes) to ${folder}`);

    // Upload vers S3
    const fileUrl = await uploadFileToS3({
      file,
      folder,
      userId,
    });

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error('[UPLOAD] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    );
  }
}
