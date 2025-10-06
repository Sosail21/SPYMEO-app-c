/**
 * Cloudinary Configuration
 * Defines folder structure and upload presets for SPYMEO platform
 */

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
  apiSecret: process.env.CLOUDINARY_API_SECRET!,
} as const;

// Folder structure for organized file storage
export const CLOUDINARY_FOLDERS = {
  AVATARS: 'spymeo/avatars',
  DOCUMENTS: 'spymeo/documents',
  RECEIPTS: 'spymeo/receipts',
  PRODUCTS: 'spymeo/products',
  ARTICLES: 'spymeo/articles',
  RESOURCES: 'spymeo/resources',
  SERVICES: 'spymeo/services',
  FORMATIONS: 'spymeo/formations',
  ANNONCES: 'spymeo/annonces',
} as const;

// Upload presets with default transformations
export const UPLOAD_PRESETS = {
  AVATAR: {
    folder: CLOUDINARY_FOLDERS.AVATARS,
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
      { radius: 'max' }, // circular crop
    ],
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  PRODUCT_IMAGE: {
    folder: CLOUDINARY_FOLDERS.PRODUCTS,
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  PRODUCT_THUMBNAIL: {
    folder: CLOUDINARY_FOLDERS.PRODUCTS,
    transformation: [
      { width: 150, height: 150, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  ARTICLE_COVER: {
    folder: CLOUDINARY_FOLDERS.ARTICLES,
    transformation: [
      { width: 1200, height: 630, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  DOCUMENT: {
    folder: CLOUDINARY_FOLDERS.DOCUMENTS,
    transformation: [],
    allowedFormats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  },
  RECEIPT: {
    folder: CLOUDINARY_FOLDERS.RECEIPTS,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
    ],
    allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
  },
  RESOURCE: {
    folder: CLOUDINARY_FOLDERS.RESOURCES,
    transformation: [],
    allowedFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'],
  },
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  IMAGE: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 20 * 1024 * 1024, // 20MB
  RECEIPT: 10 * 1024 * 1024, // 10MB
} as const;

// Validation
export function validateCloudinaryConfig() {
  if (!CLOUDINARY_CONFIG.cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }
  if (!CLOUDINARY_CONFIG.apiKey) {
    throw new Error('CLOUDINARY_API_KEY is not configured');
  }
  if (!CLOUDINARY_CONFIG.apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET is not configured');
  }
}

// Get transformation URL for specific use case
export function getTransformationUrl(
  publicId: string,
  transformation: 'avatar' | 'thumbnail' | 'medium' | 'large' | 'original'
): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

  const transformations = {
    avatar: 'w_200,h_200,c_fill,g_face,r_max,q_auto,f_auto',
    thumbnail: 'w_150,h_150,c_fill,q_auto,f_auto',
    medium: 'w_400,h_400,c_limit,q_auto,f_auto',
    large: 'w_800,h_800,c_limit,q_auto,f_auto',
    original: 'q_auto,f_auto',
  };

  return `${baseUrl}/${transformations[transformation]}/${publicId}`;
}
