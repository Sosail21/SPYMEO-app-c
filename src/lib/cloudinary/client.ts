/**
 * Cloudinary SDK Client
 * Singleton instance for server-side Cloudinary operations
 */

import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from './config';

let isConfigured = false;

/**
 * Initialize Cloudinary SDK
 */
export function initCloudinary() {
  if (isConfigured) return;

  validateCloudinaryConfig();

  cloudinary.config({
    cloud_name: CLOUDINARY_CONFIG.cloudName,
    api_key: CLOUDINARY_CONFIG.apiKey,
    api_secret: CLOUDINARY_CONFIG.apiSecret,
    secure: true,
  });

  isConfigured = true;
}

/**
 * Get configured Cloudinary instance
 */
export function getCloudinary() {
  if (!isConfigured) {
    initCloudinary();
  }
  return cloudinary;
}

/**
 * Generate signature for signed uploads (enhanced security)
 */
export function generateUploadSignature(params: Record<string, any>): string {
  initCloudinary();

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { ...params, timestamp },
    CLOUDINARY_CONFIG.apiSecret
  );

  return signature;
}

/**
 * Generate upload parameters for client-side signed uploads
 */
export function generateSignedUploadParams(options: {
  folder: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  publicId?: string;
  tags?: string[];
}) {
  initCloudinary();

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, any> = {
    timestamp,
    folder: options.folder,
  };

  if (options.resourceType) {
    params.resource_type = options.resourceType;
  }

  if (options.publicId) {
    params.public_id = options.publicId;
  }

  if (options.tags) {
    params.tags = options.tags.join(',');
  }

  const signature = cloudinary.utils.api_sign_request(
    params,
    CLOUDINARY_CONFIG.apiSecret
  );

  return {
    ...params,
    signature,
    api_key: CLOUDINARY_CONFIG.apiKey,
    cloud_name: CLOUDINARY_CONFIG.cloudName,
  };
}

export default cloudinary;
