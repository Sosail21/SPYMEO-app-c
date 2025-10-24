// Cdw-Spm: S3 Upload Service
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configuration du client S3
const s3ClientConfig: any = {
  region: process.env.AWS_REGION || 'eu-west-3',
};

// Si des credentials sont fournies en variables d'environnement, les utiliser
// Sinon, le SDK utilisera le rôle IAM ECS (recommandé en production)
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3ClientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
  console.log('[S3] Using credentials from environment variables');
} else {
  console.log('[S3] Using IAM role from ECS task (recommended)');
}

const s3Client = new S3Client(s3ClientConfig);

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
  // Note: ACL non utilisé car le bucket a "Object Ownership: Bucket owner enforced"
  // Les permissions publiques sont gérées via la Bucket Policy
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  try {
    console.log(`[S3] Uploading to bucket: ${BUCKET_NAME}, key: ${key}`);
    await s3Client.send(command);

    // Retourner l'URL du fichier
    // Si CloudFront est configuré, utiliser le domaine CloudFront
    // Sinon, utiliser l'URL S3 directe
    const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
    const fileUrl = cloudFrontDomain
      ? `https://${cloudFrontDomain}/${key}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-3'}.amazonaws.com/${key}`;

    console.log(`[S3] ✅ Fichier uploadé avec succès : ${fileUrl}`);
    console.log(`[S3] Using ${cloudFrontDomain ? 'CloudFront' : 'S3 direct'} URL`);
    return fileUrl;
  } catch (error: any) {
    console.error('[S3] ❌ Erreur upload:', {
      message: error.message,
      code: error.code,
      name: error.name,
      bucket: BUCKET_NAME,
      key: key,
      region: process.env.AWS_REGION || 'eu-west-3',
    });
    throw new Error(`Erreur S3: ${error.message || 'Erreur lors de l\'upload du fichier'}`);
  }
}

/**
 * Génère une URL signée pour télécharger un fichier privé
 * (À implémenter si besoin de fichiers privés)
 */
export async function getSignedUrl(key: string): Promise<string> {
  // À implémenter avec GetObjectCommand + getSignedUrl si nécessaire
  // Pour l'instant, on retourne l'URL publique
  const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
  return cloudFrontDomain
    ? `https://${cloudFrontDomain}/${key}`
    : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-3'}.amazonaws.com/${key}`;
}
