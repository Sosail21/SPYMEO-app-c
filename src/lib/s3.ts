// Cdw-Spm: S3 Upload Service
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-3',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'spymeo-production-assets';

export interface UploadFileParams {
  file: File;
  folder: string; // e.g., "applications", "profiles", "documents"
  userId: string;
}

/**
 * Upload un fichier vers S3
 * @returns L'URL du fichier uploadé
 */
export async function uploadFileToS3(params: UploadFileParams): Promise<string> {
  const { file, folder, userId } = params;

  // Générer un nom de fichier unique
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${userId}/${timestamp}_${sanitizedFileName}`;

  // Convertir le File en Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload vers S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  try {
    await s3Client.send(command);

    // Retourner l'URL du fichier
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-3'}.amazonaws.com/${key}`;

    console.log(`[S3] Fichier uploadé : ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error('[S3] Erreur upload:', error);
    throw new Error('Erreur lors de l\'upload du fichier');
  }
}

/**
 * Génère une URL signée pour télécharger un fichier privé
 * (À implémenter si besoin de fichiers privés)
 */
export async function getSignedUrl(key: string): Promise<string> {
  // À implémenter avec GetObjectCommand + getSignedUrl
  // Pour l'instant, on retourne l'URL publique
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-3'}.amazonaws.com/${key}`;
}
