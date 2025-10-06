/**
 * File Upload Middleware
 * Handles multipart/form-data parsing for file uploads in Next.js API routes
 */

import { NextRequest } from 'next/server';
import { Readable } from 'stream';

export interface UploadedFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  fieldName: string;
}

export interface ParsedFormData {
  files: UploadedFile[];
  fields: Record<string, string>;
}

/**
 * Parse multipart/form-data from Next.js request
 */
export async function parseFormData(request: NextRequest): Promise<ParsedFormData> {
  const formData = await request.formData();

  const files: UploadedFile[] = [];
  const fields: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const buffer = Buffer.from(await value.arrayBuffer());
      files.push({
        buffer,
        originalName: value.name,
        mimeType: value.type,
        size: value.size,
        fieldName: key,
      });
    } else {
      fields[key] = value;
    }
  }

  return { files, fields };
}

/**
 * Validate uploaded file
 */
export function validateFile(
  file: UploadedFile,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }
): { valid: boolean; error?: string } {
  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    return {
      valid: false,
      error: `File size exceeds limit of ${options.maxSize / (1024 * 1024)}MB`,
    };
  }

  // Check MIME type
  if (options.allowedTypes && !options.allowedTypes.includes(file.mimeType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`,
    };
  }

  // Check file extension
  if (options.allowedExtensions) {
    const extension = file.originalName.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file extension. Allowed extensions: ${options.allowedExtensions.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Text
    txt: 'text/plain',
    csv: 'text/csv',

    // Archive
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
  };

  return mimeTypes[extension || ''] || 'application/octet-stream';
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path components
  const basename = filename.split(/[\\/]/).pop() || filename;

  // Remove special characters, keep only alphanumeric, dots, dashes, and underscores
  return basename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255); // Limit length
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string, userId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = sanitizeFilename(nameWithoutExt);

  if (userId) {
    return `${userId}_${sanitizedName}_${timestamp}_${random}.${extension}`;
  }

  return `${sanitizedName}_${timestamp}_${random}.${extension}`;
}
