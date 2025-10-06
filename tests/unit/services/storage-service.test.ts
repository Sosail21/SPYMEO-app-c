/**
 * Unit Tests for Storage Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import StorageService from '@/lib/services/storage-service';

// Mock Cloudinary
vi.mock('@/lib/cloudinary/client', () => ({
  getCloudinary: vi.fn(() => ({
    uploader: {
      upload: vi.fn((file, options) =>
        Promise.resolve({
          public_id: 'test_public_id',
          url: 'http://test.cloudinary.com/test.jpg',
          secure_url: 'https://test.cloudinary.com/test.jpg',
          width: 800,
          height: 600,
          format: 'jpg',
          resource_type: 'image',
          bytes: 50000,
        })
      ),
      upload_stream: vi.fn((options, callback) => ({
        end: vi.fn((buffer) => {
          callback(undefined, {
            public_id: 'test_public_id',
            url: 'http://test.cloudinary.com/test.jpg',
            secure_url: 'https://test.cloudinary.com/test.jpg',
            width: 800,
            height: 600,
            format: 'jpg',
            resource_type: 'image',
            bytes: 50000,
          });
        }),
      })),
      destroy: vi.fn(() => Promise.resolve({ result: 'ok' })),
    },
    api: {
      delete_resources: vi.fn(() => Promise.resolve({ deleted: {} })),
      resource: vi.fn(() =>
        Promise.resolve({
          public_id: 'test_public_id',
          format: 'jpg',
          resource_type: 'image',
          bytes: 50000,
          width: 800,
          height: 600,
          url: 'http://test.cloudinary.com/test.jpg',
          secure_url: 'https://test.cloudinary.com/test.jpg',
          created_at: '2025-01-01T00:00:00Z',
          tags: ['test'],
        })
      ),
    },
    search: {
      expression: vi.fn(() => ({
        max_results: vi.fn(() => ({
          execute: vi.fn(() =>
            Promise.resolve({
              resources: [],
              total_count: 0,
            })
          ),
        })),
      })),
    },
    url: vi.fn((publicId, options) => `https://res.cloudinary.com/test/${publicId}`),
  })),
}));

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file with buffer', async () => {
      const buffer = Buffer.from('test-data');
      const folder = 'spymeo/test';

      const result = await StorageService.uploadFile(buffer, folder);

      expect(result.success).toBe(true);
      expect(result.publicId).toBeDefined();
      expect(result.secureUrl).toBeDefined();
    });

    it('should apply transformations', async () => {
      const buffer = Buffer.from('test-data');
      const folder = 'spymeo/test';
      const transformations = {
        width: 400,
        height: 400,
        crop: 'fill' as const,
      };

      const result = await StorageService.uploadFile(buffer, folder, {
        transformations,
      });

      expect(result.success).toBe(true);
    });

    it('should add tags to upload', async () => {
      const buffer = Buffer.from('test-data');
      const folder = 'spymeo/test';
      const tags = ['user:123', 'type:avatar'];

      const result = await StorageService.uploadFile(buffer, folder, {
        tags,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const publicId = 'spymeo/test/image';

      const result = await StorageService.deleteFile(publicId);

      expect(result.success).toBe(true);
    });
  });

  describe('deleteFiles', () => {
    it('should delete multiple files', async () => {
      const publicIds = ['spymeo/test/image1', 'spymeo/test/image2'];

      const result = await StorageService.deleteFiles(publicIds);

      expect(result.success).toBe(true);
    });
  });

  describe('getFileMetadata', () => {
    it('should retrieve file metadata', async () => {
      const publicId = 'spymeo/test/image';

      const result = await StorageService.getFileMetadata(publicId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.publicId).toBe('test_public_id');
      expect(result.data?.format).toBe('jpg');
    });
  });

  describe('optimizeImage', () => {
    it('should generate optimized URL', () => {
      const publicId = 'spymeo/test/image';

      const url = StorageService.optimizeImage(publicId, {
        width: 800,
        quality: 'auto',
      });

      expect(url).toContain(publicId);
    });
  });

  describe('generateThumbnail', () => {
    it('should generate thumbnail URL', () => {
      const publicId = 'spymeo/test/image';

      const url = StorageService.generateThumbnail(publicId, {
        width: 150,
        height: 150,
      });

      expect(url).toContain(publicId);
    });

    it('should support PDF page selection', () => {
      const publicId = 'spymeo/documents/file.pdf';

      const url = StorageService.generateThumbnail(publicId, {
        width: 150,
        height: 150,
        page: 1,
      });

      expect(url).toContain(publicId);
    });
  });

  describe('getResponsiveUrl', () => {
    it('should generate responsive breakpoint URLs', () => {
      const publicId = 'spymeo/test/image';

      const breakpoints: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl'];

      breakpoints.forEach((breakpoint) => {
        const url = StorageService.getResponsiveUrl(publicId, breakpoint);
        expect(url).toContain(publicId);
      });
    });
  });

  describe('validateFileType', () => {
    it('should validate allowed file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png'];

      const validResult = StorageService.validateFileType('image/jpeg', allowedTypes);
      expect(validResult.valid).toBe(true);

      const invalidResult = StorageService.validateFileType('image/gif', allowedTypes);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toBeDefined();
    });
  });

  describe('validateFileSize', () => {
    it('should validate file size', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB

      const validResult = StorageService.validateFileSize(3 * 1024 * 1024, maxSize);
      expect(validResult.valid).toBe(true);

      const invalidResult = StorageService.validateFileSize(6 * 1024 * 1024, maxSize);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('File too large');
    });
  });

  describe('base64ToBuffer', () => {
    it('should convert base64 to buffer', () => {
      const base64 = 'SGVsbG8gV29ybGQ='; // "Hello World"
      const buffer = StorageService.base64ToBuffer(base64);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.toString()).toBe('Hello World');
    });

    it('should handle data URL prefix', () => {
      const dataUrl = 'data:image/png;base64,SGVsbG8gV29ybGQ=';
      const buffer = StorageService.base64ToBuffer(dataUrl);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.toString()).toBe('Hello World');
    });
  });
});
