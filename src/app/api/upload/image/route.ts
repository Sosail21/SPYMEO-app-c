/**
 * Generic Image Upload API Route
 * POST /api/upload/image
 * Supports products, articles, services, formations, announcements
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import {
  uploadProductImage,
  uploadArticleCover,
  uploadServiceImage,
  uploadFormationImage,
  uploadAnnonceImage,
} from '@/lib/cloudinary/upload';
import { parseFormData, validateFile } from '@/lib/middleware/file-upload';
import { FILE_SIZE_LIMITS } from '@/lib/cloudinary/config';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const { files, fields } = await parseFormData(request);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const file = files[0];
    const type = fields.type; // product, article, service, formation, annonce
    const entityId = fields.entityId;
    const index = parseInt(fields.index || '0', 10);

    if (!type || !entityId) {
      return NextResponse.json(
        { success: false, error: 'Missing type or entityId' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file, {
      maxSize: FILE_SIZE_LIMITS.IMAGE,
      allowedTypes: ALLOWED_TYPES,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Upload based on type
    let result;

    switch (type) {
      case 'product':
        result = await uploadProductImage(file.buffer, entityId, index);
        break;
      case 'article':
        result = await uploadArticleCover(file.buffer, entityId);
        break;
      case 'service':
        result = await uploadServiceImage(file.buffer, entityId, index);
        break;
      case 'formation':
        result = await uploadFormationImage(file.buffer, entityId, index);
        break;
      case 'annonce':
        result = await uploadAnnonceImage(file.buffer, entityId, index);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid upload type' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    // Return success with URL
    return NextResponse.json({
      success: true,
      data: {
        url: result.secureUrl,
        publicId: result.publicId,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
