/**
 * Receipt Upload API Route
 * POST /api/upload/receipt
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { uploadReceipt } from '@/lib/cloudinary/upload';
import { parseFormData, validateFile } from '@/lib/middleware/file-upload';
import { FILE_SIZE_LIMITS } from '@/lib/cloudinary/config';

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

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

    // Check if user is practitioner
    if (session.user.role !== 'PRACTITIONER') {
      return NextResponse.json(
        { success: false, error: 'Only practitioners can upload receipts' },
        { status: 403 }
      );
    }

    // Parse form data
    const { files } = await parseFormData(request);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const file = files[0];

    // Validate file
    const validation = validateFile(file, {
      maxSize: FILE_SIZE_LIMITS.RECEIPT,
      allowedTypes: ALLOWED_TYPES,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await uploadReceipt(file.buffer, session.user.id);

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
        bytes: result.bytes,
        originalName: file.originalName,
      },
    });
  } catch (error: any) {
    console.error('Receipt upload error:', error);
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
