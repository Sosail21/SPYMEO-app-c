/**
 * Cloudinary Upload Utilities
 * High-level functions for uploading different types of files
 */

import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { getCloudinary } from './client';
import { CLOUDINARY_FOLDERS, UPLOAD_PRESETS, FILE_SIZE_LIMITS } from './config';

// Types
export interface UploadResult {
  success: boolean;
  publicId?: string;
  url?: string;
  secureUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType?: string;
  bytes?: number;
  error?: string;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: any[];
  tags?: string[];
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  allowedFormats?: string[];
  maxFileSize?: number;
}

/**
 * Generic upload function with validation
 */
async function uploadFile(
  file: Buffer | string,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    const cloudinary = getCloudinary();

    // Validate file size if provided
    if (options.maxFileSize && file instanceof Buffer) {
      if (file.length > options.maxFileSize) {
        return {
          success: false,
          error: `File size exceeds limit of ${options.maxFileSize / (1024 * 1024)}MB`,
        };
      }
    }

    // Prepare upload options
    const uploadOptions: any = {
      folder: options.folder || 'spymeo',
      resource_type: options.resourceType || 'auto',
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    if (options.tags) {
      uploadOptions.tags = options.tags;
    }

    if (options.allowedFormats) {
      uploadOptions.allowed_formats = options.allowedFormats;
    }

    // Upload based on input type
    let result: UploadApiResponse;

    if (typeof file === 'string') {
      // File is a path or base64 string
      result = await cloudinary.uploader.upload(file, uploadOptions);
    } else {
      // File is a buffer
      result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('Upload failed'));
          }
        );
        uploadStream.end(file);
      });
    }

    return {
      success: true,
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
}

/**
 * Upload user avatar with circular crop and optimization
 */
export async function uploadAvatar(
  file: Buffer | string,
  userId: string
): Promise<UploadResult> {
  return uploadFile(file, {
    folder: CLOUDINARY_FOLDERS.AVATARS,
    publicId: `user_${userId}`,
    transformation: UPLOAD_PRESETS.AVATAR.transformation,
    allowedFormats: UPLOAD_PRESETS.AVATAR.allowedFormats,
    maxFileSize: FILE_SIZE_LIMITS.AVATAR,
    resourceType: 'image',
    tags: ['avatar', `user:${userId}`],
  });
}

/**
 * Upload document (PDF, Word, images)
 */
export async function uploadDocument(
  file: Buffer | string,
  userId: string,
  documentType: string = 'general'
): Promise<UploadResult> {
  const timestamp = Date.now();
  return uploadFile(file, {
    folder: CLOUDINARY_FOLDERS.DOCUMENTS,
    publicId: `doc_${userId}_${documentType}_${timestamp}`,
    transformation: UPLOAD_PRESETS.DOCUMENT.transformation,
    allowedFormats: UPLOAD_PRESETS.DOCUMENT.allowedFormats,
    maxFileSize: FILE_SIZE_LIMITS.DOCUMENT,
    resourceType: 'auto',
    tags: ['document', `user:${userId}`, `type:${documentType}`],
  });
}

/**
 * Upload receipt for pre-accounting
 */
export async function uploadReceipt(
  file: Buffer | string,
  userId: string
): Promise<UploadResult> {
  const timestamp = Date.now();
  return uploadFile(file, {
    folder: CLOUDINARY_FOLDERS.RECEIPTS,
    publicId: `receipt_${userId}_${timestamp}`,
    transformation: UPLOAD_PRESETS.RECEIPT.transformation,
    allowedFormats: UPLOAD_PRESETS.RECEIPT.allowedFormats,
    maxFileSize: FILE_SIZE_LIMITS.RECEIPT,
    resourceType: 'auto',
    tags: ['receipt', `user:${userId}`],
  });
}

/**
 * Upload product image with optimization
 */
export async function uploadProductImage(
  file: Buffer | string,
  productId: string,
  index: number = 0
): Promise<UploadResult> {
  return uploadFile(file, {
    folder: CLOUDINARY_FOLDERS.PRODUCTS,
    publicId: `product_${productId}_${index}`,
    transformation: UPLOAD_PRESETS.PRODUCT_IMAGE.transformation,
    allowedFormats: UPLOAD_PRESETS.PRODUCT_IMAGE.allowedFormats,
    maxFileSize: FILE_SIZE_LIMITS.IMAGE,
    resourceType: 'image',
    tags: ['product', `product:${productId}`],
  });
}

/**
 * Upload article cover image
 */
export async function uploadArticleCover(
  file: Buffer | string,
  articleId: string
): Promise<UploadResult> {
  return uploadFile(file, {
    folder: CLOUDINARY_FOLDERS.ARTICLES,
    publicId: `article_${articleId}`,
    transformation: UPLOAD_PRESETS.ARTICLE_COVER.transformation,
    allowedFormats: UPLOAD_PRESETS.ARTICLE_COVER.allowedFormats,
    maxFileSize: FILE_SIZE_LIMITS.IMAGE,
    resourceType: 'image',
    tags: ['article', `article:${articleId}`],
  });
}

/**
 * Upload service image
 */
export async function uploadServiceImage(
  file: Buffer | string,
  serviceId: string,
  index: number = 0
): Promise<UploadResult> {
  return uploadFile(file, {
    folder: CLOUDINARY_FOLDERS.SERVICES,
    publicId: `service_${serviceId}_${index}`,
    transformation: UPLOAD_PRESETS.PRODUCT_IMAGE.transformation,
    allowedFormats: UPLOAD_PRESETS.PRODUCT_IMAGE.allowedFormats,
    maxFileSize: FILE_SIZE_LIMITS.IMAGE,
    resourceType: 'image',
    tags: ['service', `service:${serviceId}`],
  });
}

/**
 * Upload formation/training image
 */
export async function uploadFormationImage(
  file: Buffer | string,
  formationId: string,
  index: number = 0
): Promise<UploadResult> {
  return uploadFile(file, {
    folder: CLOUDINARY_FOLDERS.FORMATIONS,
    publicId: `formation_${formationId}_${index}`,
    transformation: UPLOAD_PRESETS.PRODUCT_IMAGE.transformation,
    allowedFormats: UPLOAD_PRESETS.PRODUCT_IMAGE.allowedFormats,
    maxFileSize: FILE_SIZE_LIMITS.IMAGE,
    resourceType: 'image',
    tags: ['formation', `formation:${formationId}`],
  });
}

/**
 * Upload shared office announcement image
 */
export async function uploadAnnonceImage(
  file: Buffer | string,
  annonceId: string,
  index: number = 0
): Promise<UploadResult> {
  return uploadFile(file, {
    folder: CLOUDINARY_FOLDERS.ANNONCES,
    publicId: `annonce_${annonceId}_${index}`,
    transformation: UPLOAD_PRESETS.PRODUCT_IMAGE.transformation,
    allowedFormats: UPLOAD_PRESETS.PRODUCT_IMAGE.allowedFormats,
    maxFileSize: FILE_SIZE_LIMITS.IMAGE,
    resourceType: 'image',
    tags: ['annonce', `annonce:${annonceId}`],
  });
}

/**
 * Upload practitioner resource
 */
export async function uploadResource(
  file: Buffer | string,
  userId: string,
  resourceId: string
): Promise<UploadResult> {
  return uploadFile(file, {
    folder: CLOUDINARY_FOLDERS.RESOURCES,
    publicId: `resource_${userId}_${resourceId}`,
    transformation: UPLOAD_PRESETS.RESOURCE.transformation,
    allowedFormats: UPLOAD_PRESETS.RESOURCE.allowedFormats,
    maxFileSize: FILE_SIZE_LIMITS.DOCUMENT,
    resourceType: 'auto',
    tags: ['resource', `user:${userId}`, `resource:${resourceId}`],
  });
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFile(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ success: boolean; error?: string }> {
  try {
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return { success: true };
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate thumbnail from image or PDF
 */
export async function generateThumbnail(
  publicId: string,
  options: { width?: number; height?: number } = {}
): Promise<string> {
  const cloudinary = getCloudinary();
  const width = options.width || 150;
  const height = options.height || 150;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
}
