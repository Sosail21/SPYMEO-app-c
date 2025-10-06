# Cloudinary Integration - Implementation Summary

Complete implementation of Cloudinary file storage for SPYMEO platform.

## Overview

Successfully integrated Cloudinary as the primary file storage solution for:
- User avatars
- Documents (PDF, Word, images)
- Pre-accounting receipts
- Product images
- Article cover images
- Service images
- Formation/training images
- Shared office announcement images
- Practitioner shared resources

## What Was Implemented

### 1. Dependencies Installed

```bash
npm install cloudinary next-cloudinary multer @types/multer
```

### 2. Configuration Files

- **`/src/lib/cloudinary/client.ts`** - Cloudinary SDK client initialization
- **`/src/lib/cloudinary/config.ts`** - Configuration with folder structure and presets
- **`/src/lib/cloudinary/upload.ts`** - Upload utilities for all file types

### 3. Service Layer

- **`/src/lib/services/storage-service.ts`** - High-level storage abstraction with:
  - File upload with transformations
  - File deletion (single and bulk)
  - Signed URLs for secure access
  - Image optimization
  - Thumbnail generation
  - Responsive image URLs
  - File validation
  - Metadata retrieval
  - Tag-based search

### 4. API Routes

Created upload endpoints:
- **`/src/app/api/upload/avatar/route.ts`** - Avatar upload
- **`/src/app/api/upload/document/route.ts`** - Document upload
- **`/src/app/api/upload/receipt/route.ts`** - Receipt upload (practitioners only)
- **`/src/app/api/upload/image/route.ts`** - Generic image upload

Supporting utilities:
- **`/src/lib/middleware/file-upload.ts`** - Multipart form data parsing and validation

### 5. Client Components

Created React components:
- **`/src/components/upload/AvatarUpload.tsx`** - Avatar upload with circular crop preview
- **`/src/components/upload/FileUpload.tsx`** - Generic file upload with drag & drop
- **`/src/components/upload/ImageGallery.tsx`** - Multi-image upload with reordering

### 6. Database Schema Updates

Updated Prisma models with Cloudinary fields:

```prisma
// User
avatarPublicId String?

// Receipt
cloudinaryPublicId String?

// Document
cloudinaryPublicId String?

// ClientDocument
cloudinaryPublicId String?

// Product, Service, Formation, Annonce
cloudinaryPublicIds String[]

// Article
thumbnailPublicId String?

// Resource
cloudinaryPublicId String?
```

### 7. Tests

Created comprehensive tests:
- **`/tests/unit/cloudinary/upload.test.ts`** - Upload utilities tests
- **`/tests/unit/services/storage-service.test.ts`** - Storage service tests
- **`/tests/integration/api/upload.test.ts`** - API routes integration tests

### 8. Migration Script

- **`/scripts/migrate-files-to-cloudinary.ts`** - Migrate existing mock files to Cloudinary
  - Supports dry-run mode
  - Migrates avatars, receipts, documents, products, etc.
  - Provides detailed progress and summary

### 9. Documentation

Created comprehensive documentation:
- **`/docs/cloudinary-integration.md`** - Complete integration guide (setup, usage, best practices)
- **`/docs/cloudinary-usage-examples.md`** - Practical usage examples
- **`/src/components/upload/README.md`** - Component documentation
- **`.env.example`** - Updated with Cloudinary environment variables

### 10. Package Scripts

Added npm scripts:
```json
{
  "migrate:cloudinary": "tsx scripts/migrate-files-to-cloudinary.ts",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio"
}
```

## File Structure

```
spymeo/
├── src/
│   ├── lib/
│   │   ├── cloudinary/
│   │   │   ├── client.ts          # Cloudinary SDK client
│   │   │   ├── config.ts          # Configuration & presets
│   │   │   └── upload.ts          # Upload utilities
│   │   ├── services/
│   │   │   └── storage-service.ts # Storage service layer
│   │   └── middleware/
│   │       └── file-upload.ts     # File upload helpers
│   ├── app/
│   │   └── api/
│   │       └── upload/
│   │           ├── avatar/route.ts    # Avatar upload
│   │           ├── document/route.ts  # Document upload
│   │           ├── receipt/route.ts   # Receipt upload
│   │           └── image/route.ts     # Image upload
│   └── components/
│       └── upload/
│           ├── AvatarUpload.tsx   # Avatar component
│           ├── FileUpload.tsx     # File upload component
│           ├── ImageGallery.tsx   # Image gallery component
│           └── README.md          # Component docs
├── scripts/
│   └── migrate-files-to-cloudinary.ts # Migration script
├── tests/
│   ├── unit/
│   │   ├── cloudinary/upload.test.ts
│   │   └── services/storage-service.test.ts
│   └── integration/
│       └── api/upload.test.ts
├── docs/
│   ├── cloudinary-integration.md      # Main guide
│   └── cloudinary-usage-examples.md   # Examples
├── prisma/
│   └── schema.prisma              # Updated with Cloudinary fields
└── .env.example                   # Environment variables
```

## Environment Variables Required

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Setup Instructions

### 1. Get Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from Dashboard
3. Add to `.env` file

### 2. Run Database Migration

```bash
# Generate Prisma client with new schema
npm run prisma:generate

# Run database migration
npm run prisma:migrate

# Migration name: add_cloudinary_fields
```

### 3. Migrate Existing Files (Optional)

```bash
# Dry run first
npm run migrate:cloudinary -- --dry-run

# Migrate all files
npm run migrate:cloudinary

# Or migrate specific types
npm run migrate:cloudinary -- --type=avatars
npm run migrate:cloudinary -- --type=receipts
npm run migrate:cloudinary -- --type=documents
npm run migrate:cloudinary -- --type=products
```

## Key Features

### Automatic Optimization

- **Format conversion**: WebP/AVIF for modern browsers
- **Quality optimization**: Automatic quality adjustment
- **Compression**: Lossless and lossy compression
- **Lazy loading**: Optimized for performance

### Transformations

- **Avatar**: 200x200, circular crop, face detection
- **Product images**: 800x800 max, maintain aspect ratio
- **Thumbnails**: 150x150, auto quality
- **Custom**: On-the-fly transformations via URL

### Security

- **Signed uploads**: Enhanced security for sensitive files
- **Private resources**: Secure document delivery
- **File validation**: Server-side type and size validation
- **Access control**: Role-based upload permissions

### Developer Experience

- **Type-safe**: Full TypeScript support
- **Easy to use**: Simple API and components
- **Well documented**: Comprehensive guides and examples
- **Tested**: Unit and integration tests

## Usage Examples

### Upload Avatar

```tsx
import AvatarUpload from '@/components/upload/AvatarUpload';

<AvatarUpload
  currentAvatar={user.avatar}
  onUploadSuccess={(url, publicId) => {
    updateUser({ avatar: url, avatarPublicId: publicId });
  }}
  size="lg"
/>
```

### Upload Document

```tsx
import FileUpload from '@/components/upload/FileUpload';

<FileUpload
  uploadType="document"
  accept=".pdf,.doc,.docx"
  maxSize={20}
  onUploadSuccess={(data) => {
    saveDocument(data);
  }}
/>
```

### Product Images

```tsx
import ImageGallery from '@/components/upload/ImageGallery';

<ImageGallery
  images={product.images}
  maxImages={5}
  entityType="product"
  entityId={product.id}
  onImagesChange={(images) => {
    updateProduct({ images });
  }}
/>
```

### Backend Upload

```typescript
import { uploadAvatar } from '@/lib/cloudinary/upload';

const result = await uploadAvatar(fileBuffer, userId);

if (result.success) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      avatar: result.secureUrl,
      avatarPublicId: result.publicId,
    },
  });
}
```

### Image Optimization

```typescript
import StorageService from '@/lib/services/storage-service';

// Optimize image
const url = StorageService.optimizeImage(publicId, {
  width: 800,
  quality: 'auto',
});

// Generate thumbnail
const thumb = StorageService.generateThumbnail(publicId, {
  width: 150,
  height: 150,
});

// Responsive URLs
const mobileUrl = StorageService.getResponsiveUrl(publicId, 'sm');
const desktopUrl = StorageService.getResponsiveUrl(publicId, 'lg');
```

## File Size Limits

- **Avatar**: 5MB
- **Images**: 10MB
- **Documents**: 20MB
- **Receipts**: 10MB

## Supported Formats

### Images
- JPG, JPEG, PNG, WebP, GIF

### Documents
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX

## Cloudinary Folder Structure

```
spymeo/
├── avatars/          user_123
├── documents/        doc_123_invoice_1234567890
├── receipts/         receipt_123_1234567890
├── products/         product_abc_0, product_abc_1
├── articles/         article_xyz
├── services/         service_def_0
├── formations/       formation_ghi_0
├── annonces/         annonce_jkl_0
└── resources/        resource_123_mno
```

## Testing

### Run Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# With coverage
npm run test:coverage
```

## Best Practices

1. **Always delete old files when updating**
   ```typescript
   if (user.avatarPublicId) {
     await StorageService.deleteFile(user.avatarPublicId);
   }
   ```

2. **Use responsive images**
   ```tsx
   <picture>
     <source media="(max-width: 640px)" srcSet={getResponsiveUrl(id, 'sm')} />
     <img src={getResponsiveUrl(id, 'lg')} />
   </picture>
   ```

3. **Validate files before upload**
   ```typescript
   const validation = validateFile(file, {
     maxSize: 5 * 1024 * 1024,
     allowedTypes: ['image/jpeg', 'image/png'],
   });
   ```

4. **Use tags for organization**
   ```typescript
   await StorageService.uploadFile(buffer, folder, {
     tags: ['user:123', 'type:avatar'],
   });
   ```

5. **Handle errors gracefully**
   ```typescript
   try {
     const result = await uploadAvatar(file, userId);
     if (!result.success) {
       return { error: result.error };
     }
   } catch (error) {
     console.error('Upload failed:', error);
   }
   ```

## Troubleshooting

### Common Issues

1. **"Unauthorized" error**
   - Check environment variables are set correctly
   - Verify Cloudinary credentials

2. **Upload timeout**
   - Reduce file size
   - Check network connection
   - Increase timeout if needed

3. **Images not displaying**
   - Verify URL format
   - Check Cloudinary dashboard
   - Ensure publicId is correct

4. **Migration fails**
   - Run in dry-run mode first
   - Check database connection
   - Verify file paths exist

## Resources

- **Documentation**: `/docs/cloudinary-integration.md`
- **Examples**: `/docs/cloudinary-usage-examples.md`
- **Component Docs**: `/src/components/upload/README.md`
- **Cloudinary Docs**: https://cloudinary.com/documentation

## Next Steps

1. **Set up environment variables**
2. **Run database migration**
3. **Migrate existing files** (if applicable)
4. **Update existing components** to use new upload components
5. **Test upload functionality** in development
6. **Deploy to production**

## Support

For questions or issues:
1. Check the documentation in `/docs`
2. Review usage examples
3. Check console for error messages
4. Verify environment variables
5. Contact development team

---

**Status**: ✅ Complete

**Date**: October 2025

**Version**: 1.0.0
