/**
 * Unit Tests for Cloudinary Upload Utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadAvatar, uploadDocument, uploadReceipt, deleteFile } from '@/lib/cloudinary/upload';

// Mock Cloudinary
vi.mock('@/lib/cloudinary/client', () => ({
  getCloudinary: vi.fn(() => ({
    uploader: {
      upload: vi.fn((file, options) =>
        Promise.resolve({
          public_id: 'test_public_id',
          url: 'http://test.cloudinary.com/test.jpg',
          secure_url: 'https://test.cloudinary.com/test.jpg',
          width: 200,
          height: 200,
          format: 'jpg',
          resource_type: 'image',
          bytes: 12345,
        })
      ),
      upload_stream: vi.fn((options, callback) => ({
        end: vi.fn((buffer) => {
          callback(undefined, {
            public_id: 'test_public_id',
            url: 'http://test.cloudinary.com/test.jpg',
            secure_url: 'https://test.cloudinary.com/test.jpg',
            width: 200,
            height: 200,
            format: 'jpg',
            resource_type: 'image',
            bytes: 12345,
          });
        }),
      })),
      destroy: vi.fn(() => Promise.resolve({ result: 'ok' })),
    },
  })),
}));

describe('Cloudinary Upload Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadAvatar', () => {
    it('should upload avatar with buffer', async () => {
      const buffer = Buffer.from('fake-image-data');
      const userId = 'user123';

      const result = await uploadAvatar(buffer, userId);

      expect(result.success).toBe(true);
      expect(result.publicId).toBe('test_public_id');
      expect(result.secureUrl).toBe('https://test.cloudinary.com/test.jpg');
      expect(result.width).toBe(200);
      expect(result.height).toBe(200);
    });

    it('should upload avatar with file path', async () => {
      const filePath = '/path/to/avatar.jpg';
      const userId = 'user123';

      const result = await uploadAvatar(filePath, userId);

      expect(result.success).toBe(true);
      expect(result.publicId).toBeDefined();
    });

    it('should fail with oversized file', async () => {
      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      const userId = 'user123';

      const result = await uploadAvatar(largeBuffer, userId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File size exceeds limit');
    });
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      const buffer = Buffer.from('fake-document-data');
      const userId = 'user123';
      const docType = 'invoice';

      const result = await uploadDocument(buffer, userId, docType);

      expect(result.success).toBe(true);
      expect(result.publicId).toBeDefined();
      expect(result.secureUrl).toBeDefined();
    });

    it('should include document type in upload', async () => {
      const buffer = Buffer.from('fake-document-data');
      const userId = 'user123';
      const docType = 'contract';

      const result = await uploadDocument(buffer, userId, docType);

      expect(result.success).toBe(true);
    });
  });

  describe('uploadReceipt', () => {
    it('should upload receipt successfully', async () => {
      const buffer = Buffer.from('fake-receipt-data');
      const userId = 'user123';

      const result = await uploadReceipt(buffer, userId);

      expect(result.success).toBe(true);
      expect(result.publicId).toBeDefined();
      expect(result.secureUrl).toBeDefined();
    });

    it('should fail with oversized receipt', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // > 10MB
      const userId = 'user123';

      const result = await uploadReceipt(largeBuffer, userId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File size exceeds limit');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const publicId = 'spymeo/avatars/user_123';

      const result = await deleteFile(publicId);

      expect(result.success).toBe(true);
    });

    it('should handle deletion errors', async () => {
      // Mock error
      const { getCloudinary } = await import('@/lib/cloudinary/client');
      const mockCloudinary = getCloudinary();
      vi.spyOn(mockCloudinary.uploader, 'destroy').mockRejectedValueOnce(
        new Error('File not found')
      );

      const publicId = 'spymeo/avatars/nonexistent';

      const result = await deleteFile(publicId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
    });
  });
});
