/**
 * Storage Service
 * High-level abstraction for file storage operations using Cloudinary
 */

import { getCloudinary } from '../cloudinary/client';
import { getTransformationUrl } from '../cloudinary/config';
import { UploadResult } from '../cloudinary/upload';

export interface StorageFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface TransformationOptions {
  width?: number;
  height?: number;
  crop?: 'scale' | 'fit' | 'limit' | 'fill' | 'pad' | 'crop';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  quality?: number | 'auto';
  format?: 'jpg' | 'png' | 'webp' | 'avif' | 'auto';
  radius?: number | 'max';
  effect?: string;
}

export class StorageService {
  /**
   * Upload a file to Cloudinary with custom transformations
   */
  static async uploadFile(
    file: Buffer | string,
    folder: string,
    options: {
      publicId?: string;
      transformations?: TransformationOptions;
      tags?: string[];
      resourceType?: 'image' | 'video' | 'raw' | 'auto';
    } = {}
  ): Promise<UploadResult> {
    try {
      const cloudinary = getCloudinary();

      const uploadOptions: any = {
        folder,
        resource_type: options.resourceType || 'auto',
      };

      if (options.publicId) {
        uploadOptions.public_id = options.publicId;
      }

      if (options.transformations) {
        uploadOptions.transformation = this.buildTransformation(options.transformations);
      }

      if (options.tags) {
        uploadOptions.tags = options.tags;
      }

      // Upload based on input type
      let result;
      if (typeof file === 'string') {
        result = await cloudinary.uploader.upload(file, uploadOptions);
      } else {
        result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file);
        });
      }

      return {
        success: true,
        publicId: (result as any).public_id,
        url: (result as any).url,
        secureUrl: (result as any).secure_url,
        width: (result as any).width,
        height: (result as any).height,
        format: (result as any).format,
        resourceType: (result as any).resource_type,
        bytes: (result as any).bytes,
      };
    } catch (error: any) {
      console.error('Storage service upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  static async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const cloudinary = getCloudinary();
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      return { success: true };
    } catch (error: any) {
      console.error('Storage service delete error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete multiple files from Cloudinary
   */
  static async deleteFiles(
    publicIds: string[],
    resourceType: 'image' | 'video' | 'raw' = 'image'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const cloudinary = getCloudinary();
      await cloudinary.api.delete_resources(publicIds, { resource_type: resourceType });
      return { success: true };
    } catch (error: any) {
      console.error('Storage service bulk delete error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get signed URL for secure access (expires after specified time)
   */
  static getSignedUrl(
    publicId: string,
    options: {
      expiresIn?: number; // seconds
      transformation?: TransformationOptions;
      resourceType?: 'image' | 'video' | 'raw';
    } = {}
  ): string {
    const cloudinary = getCloudinary();
    const expiresAt = Math.floor(Date.now() / 1000) + (options.expiresIn || 3600);

    const urlOptions: any = {
      sign_url: true,
      expires_at: expiresAt,
      resource_type: options.resourceType || 'image',
    };

    if (options.transformation) {
      urlOptions.transformation = this.buildTransformation(options.transformation);
    }

    return cloudinary.url(publicId, urlOptions);
  }

  /**
   * Optimize image with automatic format and quality
   */
  static optimizeImage(
    publicId: string,
    options: TransformationOptions = {}
  ): string {
    const cloudinary = getCloudinary();

    return cloudinary.url(publicId, {
      transformation: [
        {
          ...this.buildTransformation(options),
          quality: options.quality || 'auto',
          fetch_format: options.format || 'auto',
        },
      ],
    });
  }

  /**
   * Generate thumbnail from image or PDF
   */
  static generateThumbnail(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      page?: number; // For PDFs
    } = {}
  ): string {
    const cloudinary = getCloudinary();
    const width = options.width || 150;
    const height = options.height || 150;

    const transformation: any = {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    };

    if (options.page !== undefined) {
      transformation.page = options.page;
    }

    return cloudinary.url(publicId, { transformation: [transformation] });
  }

  /**
   * Get image with responsive breakpoints
   */
  static getResponsiveUrl(
    publicId: string,
    breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    options: TransformationOptions = {}
  ): string {
    const widths = {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    };

    return this.optimizeImage(publicId, {
      ...options,
      width: widths[breakpoint],
    });
  }

  /**
   * Extract text from PDF or image (OCR)
   */
  static async extractText(publicId: string): Promise<string | null> {
    try {
      const cloudinary = getCloudinary();
      const result = await cloudinary.api.resource(publicId, {
        ocr: 'adv_ocr',
      });
      return result.info?.ocr?.adv_ocr?.data || null;
    } catch (error: any) {
      console.error('OCR extraction error:', error);
      return null;
    }
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(publicId: string) {
    try {
      const cloudinary = getCloudinary();
      const result = await cloudinary.api.resource(publicId);
      return {
        success: true,
        data: {
          publicId: result.public_id,
          format: result.format,
          resourceType: result.resource_type,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          url: result.url,
          secureUrl: result.secure_url,
          createdAt: result.created_at,
          tags: result.tags,
        },
      };
    } catch (error: any) {
      console.error('Get metadata error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search files by tags
   */
  static async searchByTags(tags: string[], maxResults: number = 50) {
    try {
      const cloudinary = getCloudinary();
      const result = await cloudinary.search
        .expression(`tags=${tags.join(' AND tags=')}`)
        .max_results(maxResults)
        .execute();

      return {
        success: true,
        resources: result.resources,
        total: result.total_count,
      };
    } catch (error: any) {
      console.error('Search by tags error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Build transformation object from options
   */
  private static buildTransformation(options: TransformationOptions): any {
    const transformation: any = {};

    if (options.width) transformation.width = options.width;
    if (options.height) transformation.height = options.height;
    if (options.crop) transformation.crop = options.crop;
    if (options.gravity) transformation.gravity = options.gravity;
    if (options.quality) transformation.quality = options.quality;
    if (options.format) transformation.fetch_format = options.format;
    if (options.radius !== undefined) transformation.radius = options.radius;
    if (options.effect) transformation.effect = options.effect;

    return transformation;
  }

  /**
   * Convert base64 to buffer
   */
  static base64ToBuffer(base64String: string): Buffer {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

  /**
   * Validate file type
   */
  static validateFileType(
    mimeType: string,
    allowedTypes: string[]
  ): { valid: boolean; error?: string } {
    if (!allowedTypes.includes(mimeType)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }
    return { valid: true };
  }

  /**
   * Validate file size
   */
  static validateFileSize(
    size: number,
    maxSize: number
  ): { valid: boolean; error?: string } {
    if (size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
      };
    }
    return { valid: true };
  }
}

export default StorageService;
