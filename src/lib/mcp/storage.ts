/**
 * Storage Operations via MCP
 *
 * This module provides high-level storage operations using the Cloudinary MCP server.
 * It wraps MCP tool calls in convenient TypeScript functions for media management.
 */

import { getMCPManager } from './client';

const SERVER_NAME = 'cloudinary';

export interface UploadOptions {
  file: string | Buffer;
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: TransformationOptions;
}

export interface TransformationOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit' | 'pad';
  quality?: string | number;
  format?: string;
  gravity?: string;
  aspectRatio?: string;
}

export interface SearchOptions {
  expression: string;
  maxResults?: number;
  sortBy?: Array<{ [key: string]: 'asc' | 'desc' }>;
}

export interface CloudinaryAsset {
  publicId: string;
  secureUrl: string;
  url: string;
  format: string;
  resourceType: string;
  width?: number;
  height?: number;
  bytes?: number;
  createdAt?: string;
}

/**
 * Cloudinary MCP Client
 *
 * Provides methods for media storage and manipulation via Cloudinary MCP server
 */
export class CloudinaryMCPClient {
  /**
   * Upload an image
   */
  async uploadImage(options: UploadOptions): Promise<CloudinaryAsset> {
    const manager = await getMCPManager();

    const params: any = {
      file: typeof options.file === 'string' ? options.file : options.file.toString('base64'),
      folder: options.folder,
      publicId: options.publicId,
      tags: options.tags,
      transformation: options.transformation
    };

    const result = await manager.callTool<CloudinaryAsset>(
      SERVER_NAME,
      'cloudinary:upload:image',
      params
    );

    return result;
  }

  /**
   * Upload a document
   */
  async uploadDocument(
    file: string | Buffer,
    folder: string = 'documents',
    publicId?: string
  ): Promise<CloudinaryAsset> {
    const manager = await getMCPManager();

    const params: any = {
      file: typeof file === 'string' ? file : file.toString('base64'),
      folder,
      publicId,
      resourceType: 'raw'
    };

    const result = await manager.callTool<CloudinaryAsset>(
      SERVER_NAME,
      'cloudinary:upload:document',
      params
    );

    return result;
  }

  /**
   * Transform an existing image
   */
  async transformImage(
    publicId: string,
    transformation: TransformationOptions
  ): Promise<CloudinaryAsset> {
    const manager = await getMCPManager();

    const result = await manager.callTool<CloudinaryAsset>(
      SERVER_NAME,
      'cloudinary:transform:image',
      {
        publicId,
        transformation
      }
    );

    return result;
  }

  /**
   * Delete an asset
   */
  async deleteAsset(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
  ): Promise<void> {
    const manager = await getMCPManager();

    await manager.callTool(SERVER_NAME, 'cloudinary:delete:asset', {
      publicId,
      resourceType
    });
  }

  /**
   * Search for assets
   */
  async searchAssets(options: SearchOptions): Promise<CloudinaryAsset[]> {
    const manager = await getMCPManager();

    const result = await manager.callTool<{ assets: CloudinaryAsset[] }>(
      SERVER_NAME,
      'cloudinary:search:assets',
      {
        expression: options.expression,
        maxResults: options.maxResults || 50,
        sortBy: options.sortBy
      }
    );

    return result.assets || [];
  }

  /**
   * Create a folder
   */
  async createFolder(path: string): Promise<void> {
    const manager = await getMCPManager();

    await manager.callTool(SERVER_NAME, 'cloudinary:folder:create', { path });
  }

  /**
   * Generate optimized URL for an asset
   */
  async generateUrl(
    publicId: string,
    transformation?: TransformationOptions,
    secure: boolean = true
  ): Promise<string> {
    const manager = await getMCPManager();

    const result = await manager.callTool<{ url: string }>(
      SERVER_NAME,
      'cloudinary:url:generate',
      {
        publicId,
        transformation,
        secure
      }
    );

    return result.url;
  }

  /**
   * Get folder structure resource
   */
  async getFolders(): Promise<any> {
    const manager = await getMCPManager();
    return await manager.readResource(SERVER_NAME, 'cloudinary://folders');
  }

  /**
   * Get storage usage statistics
   */
  async getUsageStats(): Promise<any> {
    const manager = await getMCPManager();
    return await manager.readResource(SERVER_NAME, 'cloudinary://usage');
  }

  /**
   * Get transformation presets
   */
  async getTransformationPresets(): Promise<any> {
    const manager = await getMCPManager();
    return await manager.readResource(SERVER_NAME, 'cloudinary://transformations');
  }
}

/**
 * Singleton instance
 */
let cloudinaryMCP: CloudinaryMCPClient | null = null;

export function getCloudinaryMCP(): CloudinaryMCPClient {
  if (!cloudinaryMCP) {
    cloudinaryMCP = new CloudinaryMCPClient();
  }
  return cloudinaryMCP;
}

/**
 * Convenience functions for common SPYMEO use cases
 */

/**
 * Upload practitioner profile picture with automatic optimization
 */
export async function uploadPractitionerProfile(
  file: string | Buffer,
  practitionerId: string
): Promise<{ profile: string; thumbnail: string }> {
  const cloudinary = getCloudinaryMCP();

  // Upload with profile transformation
  const profileResult = await cloudinary.uploadImage({
    file,
    folder: 'spymeo/practitioners',
    publicId: `practitioner-${practitionerId}`,
    tags: ['profile', 'practitioner'],
    transformation: {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto:good',
      format: 'webp'
    }
  });

  // Generate thumbnail URL
  const thumbnailUrl = await cloudinary.generateUrl(
    profileResult.publicId,
    {
      width: 150,
      height: 150,
      crop: 'fill',
      quality: 'auto',
      format: 'webp'
    }
  );

  return {
    profile: profileResult.secureUrl,
    thumbnail: thumbnailUrl
  };
}

/**
 * Upload merchant/product image with multiple sizes
 */
export async function uploadProductImage(
  file: string | Buffer,
  productId: string,
  merchantId: string
): Promise<{
  full: string;
  large: string;
  medium: string;
  thumbnail: string;
}> {
  const cloudinary = getCloudinaryMCP();

  // Upload original
  const result = await cloudinary.uploadImage({
    file,
    folder: `spymeo/products/${merchantId}`,
    publicId: `product-${productId}`,
    tags: ['product', merchantId]
  });

  // Generate responsive URLs
  const large = await cloudinary.generateUrl(result.publicId, {
    width: 1200,
    height: 1200,
    crop: 'limit',
    quality: 'auto:good',
    format: 'webp'
  });

  const medium = await cloudinary.generateUrl(result.publicId, {
    width: 600,
    height: 600,
    crop: 'limit',
    quality: 'auto',
    format: 'webp'
  });

  const thumbnail = await cloudinary.generateUrl(result.publicId, {
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  });

  return {
    full: result.secureUrl,
    large,
    medium,
    thumbnail
  };
}

/**
 * Upload blog article image
 */
export async function uploadArticleImage(
  file: string | Buffer,
  articleId: string
): Promise<{ banner: string; thumbnail: string }> {
  const cloudinary = getCloudinaryMCP();

  // Upload banner
  const result = await cloudinary.uploadImage({
    file,
    folder: 'spymeo/blog',
    publicId: `article-${articleId}`,
    tags: ['article', 'blog'],
    transformation: {
      width: 1200,
      height: 400,
      crop: 'fill',
      quality: 'auto:good',
      format: 'webp'
    }
  });

  // Generate thumbnail
  const thumbnail = await cloudinary.generateUrl(result.publicId, {
    width: 300,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  });

  return {
    banner: result.secureUrl,
    thumbnail
  };
}

/**
 * Upload user avatar
 */
export async function uploadUserAvatar(
  file: string | Buffer,
  userId: string
): Promise<string> {
  const cloudinary = getCloudinaryMCP();

  const result = await cloudinary.uploadImage({
    file,
    folder: 'spymeo/avatars',
    publicId: `user-${userId}`,
    tags: ['avatar', 'user'],
    transformation: {
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      format: 'webp',
      gravity: 'face'
    }
  });

  return result.secureUrl;
}

/**
 * Upload document (PDF, DOC, etc.)
 */
export async function uploadUserDocument(
  file: string | Buffer,
  userId: string,
  documentType: string,
  filename: string
): Promise<CloudinaryAsset> {
  const cloudinary = getCloudinaryMCP();

  return await cloudinary.uploadDocument(
    file,
    `spymeo/documents/${userId}`,
    `${documentType}-${filename}`
  );
}

/**
 * Generate responsive image URLs for different screen sizes
 */
export async function generateResponsiveUrls(
  publicId: string,
  widths: number[] = [320, 640, 1024, 1920]
): Promise<Record<string, string>> {
  const cloudinary = getCloudinaryMCP();

  const urls: Record<string, string> = {};

  for (const width of widths) {
    const url = await cloudinary.generateUrl(publicId, {
      width,
      quality: 'auto',
      format: 'webp'
    });

    urls[`w${width}`] = url;
  }

  return urls;
}

/**
 * Delete all assets for a user/entity
 */
export async function deleteEntityAssets(
  entityType: 'user' | 'practitioner' | 'merchant' | 'product',
  entityId: string
): Promise<void> {
  const cloudinary = getCloudinaryMCP();

  // Search for assets with the entity's tag or in their folder
  const assets = await cloudinary.searchAssets({
    expression: `folder:spymeo/${entityType}s/${entityId} OR tags:${entityId}`,
    maxResults: 1000
  });

  // Delete each asset
  for (const asset of assets) {
    await cloudinary.deleteAsset(asset.publicId, asset.resourceType as any);
  }
}

/**
 * Example usage:
 *
 * // Upload practitioner profile
 * const { profile, thumbnail } = await uploadPractitionerProfile(
 *   imageBuffer,
 *   'practitioner-123'
 * );
 *
 * // Upload product image
 * const productImages = await uploadProductImage(
 *   imageFile,
 *   'product-456',
 *   'merchant-789'
 * );
 *
 * // Generate responsive URLs
 * const responsiveUrls = await generateResponsiveUrls('spymeo/practitioners/practitioner-123');
 * // { w320: 'https://...', w640: 'https://...', ... }
 *
 * // Search for images
 * const images = await getCloudinaryMCP().searchAssets({
 *   expression: 'folder:spymeo/practitioners AND tags:profile'
 * });
 *
 * // Delete asset
 * await getCloudinaryMCP().deleteAsset('spymeo/products/merchant-123/product-456');
 */
