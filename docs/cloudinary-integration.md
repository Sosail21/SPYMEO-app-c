# Cloudinary Integration Guide

Complete guide for SPYMEO's Cloudinary file storage integration.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Configuration](#configuration)
- [Upload Types](#upload-types)
- [API Routes](#api-routes)
- [Client Components](#client-components)
- [Backend Services](#backend-services)
- [Image Transformations](#image-transformations)
- [Database Schema](#database-schema)
- [Migration](#migration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

SPYMEO uses Cloudinary as its primary file storage solution for:

- User avatars
- Documents (PDFs, Word files, images)
- Pre-accounting receipts
- Product images
- Article cover images
- Service images
- Formation/training images
- Shared office announcement images
- Practitioner shared resources

### Benefits

- **Automatic optimization**: Images are automatically optimized for web delivery
- **Responsive images**: Automatic format conversion (WebP, AVIF)
- **CDN delivery**: Fast global content delivery
- **Transformations**: On-the-fly image resizing, cropping, and effects
- **Security**: Signed uploads and private resources
- **OCR**: Text extraction from PDFs and images

## Setup

### 1. Install Dependencies

```bash
npm install cloudinary next-cloudinary multer @types/multer
```

### 2. Environment Variables

Create or update your `.env` file:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important**: The `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is exposed to the client for direct uploads and URL generation.

### 3. Get Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Navigate to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env` file

## Configuration

### Folder Structure

Files are organized in Cloudinary with the following structure:

```
spymeo/
├── avatars/          # User avatars
├── documents/        # User documents
├── receipts/         # Pre-accounting receipts
├── products/         # Product images
├── articles/         # Blog article covers
├── services/         # Service images
├── formations/       # Training images
├── annonces/         # Shared office announcements
└── resources/        # Practitioner shared resources
```

### Upload Presets

Different file types have specific upload presets with transformations:

#### Avatar
- Size: 200x200px
- Crop: Circle (face detection)
- Quality: Auto
- Format: Auto (WebP/AVIF)

#### Product Images
- Max size: 800x800px
- Crop: Limit (maintain aspect ratio)
- Quality: Auto

#### Thumbnails
- Size: 150x150px
- Crop: Fill
- Quality: Auto

#### Documents
- Supported formats: PDF, DOC, DOCX, images
- Max size: 20MB
- No transformations

#### Receipts
- Supported formats: PDF, images
- Max size: 10MB
- Quality optimization

## Upload Types

### 1. Avatar Upload

```typescript
import { uploadAvatar } from '@/lib/cloudinary/upload';

const result = await uploadAvatar(fileBuffer, userId);

if (result.success) {
  console.log('Avatar URL:', result.secureUrl);
  console.log('Public ID:', result.publicId);
}
```

### 2. Document Upload

```typescript
import { uploadDocument } from '@/lib/cloudinary/upload';

const result = await uploadDocument(fileBuffer, userId, 'invoice');

if (result.success) {
  console.log('Document URL:', result.secureUrl);
}
```

### 3. Receipt Upload

```typescript
import { uploadReceipt } from '@/lib/cloudinary/upload';

const result = await uploadReceipt(fileBuffer, userId);
```

### 4. Product Image Upload

```typescript
import { uploadProductImage } from '@/lib/cloudinary/upload';

const result = await uploadProductImage(fileBuffer, productId, imageIndex);
```

### 5. Generic Image Upload

For articles, services, formations, announcements:

```typescript
import {
  uploadArticleCover,
  uploadServiceImage,
  uploadFormationImage,
  uploadAnnonceImage
} from '@/lib/cloudinary/upload';

// Article cover
const result = await uploadArticleCover(fileBuffer, articleId);

// Service image
const result = await uploadServiceImage(fileBuffer, serviceId, index);
```

## API Routes

### POST /api/upload/avatar

Upload user avatar.

**Authentication**: Required
**Max size**: 5MB
**Allowed formats**: JPG, PNG, WebP

**Request**:
```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload/avatar', {
  method: 'POST',
  body: formData,
});
```

**Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "spymeo/avatars/user_123",
    "format": "jpg",
    "width": 200,
    "height": 200
  }
}
```

### POST /api/upload/document

Upload document (PDF, Word, images).

**Authentication**: Required
**Max size**: 20MB
**Allowed formats**: PDF, DOC, DOCX, JPG, PNG, WebP

**Request**:
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'invoice'); // Optional

const response = await fetch('/api/upload/document', {
  method: 'POST',
  body: formData,
});
```

### POST /api/upload/receipt

Upload receipt for pre-accounting.

**Authentication**: Required (Practitioner only)
**Max size**: 10MB
**Allowed formats**: PDF, JPG, PNG, WebP

### POST /api/upload/image

Generic image upload for products, articles, etc.

**Authentication**: Required
**Max size**: 10MB
**Allowed formats**: JPG, PNG, WebP

**Request**:
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'product'); // product, article, service, formation, annonce
formData.append('entityId', 'product_123');
formData.append('index', '0'); // For multiple images

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData,
});
```

## Client Components

### AvatarUpload Component

```tsx
import AvatarUpload from '@/components/upload/AvatarUpload';

<AvatarUpload
  currentAvatar={user.avatar}
  onUploadSuccess={(url, publicId) => {
    // Handle success
    updateUser({ avatar: url, avatarPublicId: publicId });
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
  }}
  size="lg"
/>
```

### FileUpload Component

```tsx
import FileUpload from '@/components/upload/FileUpload';

<FileUpload
  uploadType="document"
  accept="application/pdf,.doc,.docx"
  maxSize={20}
  label="Upload Document"
  onUploadSuccess={(data) => {
    console.log('Uploaded:', data.url);
  }}
  onUploadError={(error) => {
    console.error('Error:', error);
  }}
/>
```

### ImageGallery Component

```tsx
import ImageGallery from '@/components/upload/ImageGallery';

<ImageGallery
  images={product.images}
  maxImages={5}
  entityType="product"
  entityId={product.id}
  onImagesChange={(images) => {
    // Update product images
    updateProduct({ images: images.map(img => img.url) });
  }}
  onUploadError={(error) => {
    console.error('Error:', error);
  }}
/>
```

## Backend Services

### StorageService

High-level abstraction for file operations:

```typescript
import StorageService from '@/lib/services/storage-service';

// Upload file with transformations
const result = await StorageService.uploadFile(
  buffer,
  'spymeo/custom',
  {
    transformations: {
      width: 600,
      height: 400,
      crop: 'fill',
      quality: 'auto',
    },
    tags: ['user:123', 'type:profile'],
  }
);

// Delete file
await StorageService.deleteFile(publicId);

// Get optimized URL
const url = StorageService.optimizeImage(publicId, {
  width: 400,
  quality: 'auto',
});

// Generate thumbnail
const thumbUrl = StorageService.generateThumbnail(publicId, {
  width: 150,
  height: 150,
});

// Get signed URL (expires in 1 hour)
const signedUrl = StorageService.getSignedUrl(publicId, {
  expiresIn: 3600,
});

// Get responsive URLs
const mobileUrl = StorageService.getResponsiveUrl(publicId, 'sm');
const desktopUrl = StorageService.getResponsiveUrl(publicId, 'lg');
```

## Image Transformations

### Responsive Breakpoints

```typescript
const breakpoints = {
  xs: 320,   // Mobile portrait
  sm: 640,   // Mobile landscape
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1280,  // Large desktop
};

// Get image for specific breakpoint
const mobileImage = StorageService.getResponsiveUrl(publicId, 'sm');
```

### Custom Transformations

```typescript
import { getTransformationUrl } from '@/lib/cloudinary/config';

// Avatar (circular, 200x200)
const avatarUrl = getTransformationUrl(publicId, 'avatar');

// Thumbnail (square, 150x150)
const thumbUrl = getTransformationUrl(publicId, 'thumbnail');

// Medium size (max 400x400)
const mediumUrl = getTransformationUrl(publicId, 'medium');

// Large size (max 800x800)
const largeUrl = getTransformationUrl(publicId, 'large');

// Original with optimization
const originalUrl = getTransformationUrl(publicId, 'original');
```

### On-the-Fly Transformations

Cloudinary supports on-the-fly transformations via URL parameters:

```
https://res.cloudinary.com/CLOUD_NAME/image/upload/
  w_300,h_200,c_fill,g_auto,q_auto,f_auto/
  spymeo/products/product_123_0.jpg
```

Parameters:
- `w_300`: Width 300px
- `h_200`: Height 200px
- `c_fill`: Crop mode (fill, fit, limit, scale, pad)
- `g_auto`: Gravity (auto, face, center, etc.)
- `q_auto`: Automatic quality
- `f_auto`: Automatic format (WebP, AVIF)

## Database Schema

The following fields have been added to support Cloudinary:

### User Model
```prisma
model User {
  avatar         String?
  avatarPublicId String? // Cloudinary public ID
}
```

### Receipt Model
```prisma
model Receipt {
  fileUrl            String
  cloudinaryPublicId String?
}
```

### Document Model
```prisma
model Document {
  fileUrl            String
  cloudinaryPublicId String?
}
```

### ClientDocument Model
```prisma
model ClientDocument {
  fileUrl            String
  cloudinaryPublicId String?
}
```

### Product Model
```prisma
model Product {
  images             String[]
  cloudinaryPublicIds String[]
}
```

### Service Model
```prisma
model Service {
  images             String[]
  cloudinaryPublicIds String[]
}
```

### Formation Model
```prisma
model Formation {
  images             String[]
  cloudinaryPublicIds String[]
}
```

### Article Model
```prisma
model Article {
  thumbnail         String?
  thumbnailPublicId String?
}
```

### Annonce Model
```prisma
model Annonce {
  images             String[]
  cloudinaryPublicIds String[]
}
```

### Resource Model
```prisma
model Resource {
  fileUrl            String
  cloudinaryPublicId String?
}
```

## Migration

Migrate existing mock files to Cloudinary using the migration script.

### Run Migration

```bash
# Dry run (preview changes without applying)
npm run migrate:cloudinary -- --dry-run

# Migrate all files
npm run migrate:cloudinary

# Migrate specific type
npm run migrate:cloudinary -- --type=avatars
npm run migrate:cloudinary -- --type=receipts
npm run migrate:cloudinary -- --type=documents
npm run migrate:cloudinary -- --type=products
```

### Add to package.json

```json
{
  "scripts": {
    "migrate:cloudinary": "tsx scripts/migrate-files-to-cloudinary.ts"
  }
}
```

### Migration Process

1. **Backup your database** before running migration
2. Run in dry-run mode first to preview changes
3. Migrate in stages (avatars → receipts → documents → products)
4. Monitor the console output for errors
5. Review the migration summary

### What Gets Migrated

- User avatars → spymeo/avatars/
- Documents → spymeo/documents/
- Receipts → spymeo/receipts/
- Product images → spymeo/products/
- Article thumbnails → spymeo/articles/
- Service images → spymeo/services/
- Formation images → spymeo/formations/
- Annonce images → spymeo/annonces/
- Resources → spymeo/resources/

## Best Practices

### 1. Always Use Signed Uploads for Sensitive Files

```typescript
import { generateSignedUploadParams } from '@/lib/cloudinary/client';

const params = generateSignedUploadParams({
  folder: 'spymeo/private',
  tags: ['user:123'],
});
```

### 2. Delete Old Files When Updating

```typescript
// When updating avatar
if (user.avatarPublicId) {
  await StorageService.deleteFile(user.avatarPublicId);
}

// Upload new avatar
const result = await uploadAvatar(newFile, userId);
```

### 3. Use Responsive Images

```tsx
<picture>
  <source
    srcSet={StorageService.getResponsiveUrl(publicId, 'sm')}
    media="(max-width: 640px)"
  />
  <source
    srcSet={StorageService.getResponsiveUrl(publicId, 'md')}
    media="(max-width: 768px)"
  />
  <img src={StorageService.getResponsiveUrl(publicId, 'lg')} alt="..." />
</picture>
```

### 4. Validate Files Before Upload

```typescript
import { validateFile } from '@/lib/middleware/file-upload';

const validation = validateFile(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png'],
});

if (!validation.valid) {
  return { error: validation.error };
}
```

### 5. Use Tags for Organization

```typescript
await StorageService.uploadFile(buffer, folder, {
  tags: [
    `user:${userId}`,
    `type:avatar`,
    `date:${new Date().toISOString().split('T')[0]}`,
  ],
});

// Later, search by tags
const results = await StorageService.searchByTags(['user:123', 'type:avatar']);
```

### 6. Implement Error Handling

```typescript
try {
  const result = await uploadAvatar(file, userId);

  if (!result.success) {
    // Handle upload failure
    console.error('Upload failed:', result.error);
    return { error: result.error };
  }

  // Success
  return { url: result.secureUrl };
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
  return { error: 'An unexpected error occurred' };
}
```

### 7. Optimize for Performance

```typescript
// Use lazy loading for images
<img
  src={StorageService.optimizeImage(publicId)}
  loading="lazy"
  alt="..."
/>

// Preload critical images
<link
  rel="preload"
  as="image"
  href={StorageService.optimizeImage(publicId)}
/>
```

## Troubleshooting

### Issue: Upload fails with "Unauthorized"

**Solution**: Check your environment variables are correctly set:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Issue: Images not displaying

**Solution**: Check if the URL is correct. Cloudinary URLs should start with:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/...
```

### Issue: Upload timeout

**Solution**: Increase timeout for large files or reduce file size:
```typescript
// Reduce image quality before upload
const compressedImage = await compressImage(file, 0.8);
```

### Issue: "File size exceeds limit"

**Solution**: Check file size before upload and compress if needed:
```typescript
if (file.size > 5 * 1024 * 1024) {
  // Compress or reject
}
```

### Issue: Migration script fails

**Solution**:
1. Check database connection
2. Ensure Cloudinary credentials are correct
3. Run in dry-run mode first: `npm run migrate:cloudinary -- --dry-run`
4. Check console output for specific errors

### Issue: Images not optimized

**Solution**: Ensure you're using the transformation URLs:
```typescript
// Wrong: Using direct URL
<img src={user.avatar} />

// Correct: Using optimized URL
<img src={StorageService.optimizeImage(user.avatarPublicId)} />
```

## Security Considerations

1. **Never expose API Secret**: Keep `CLOUDINARY_API_SECRET` server-side only
2. **Use signed uploads**: For sensitive files, use signed upload URLs
3. **Validate file types**: Always validate MIME types server-side
4. **Limit file sizes**: Enforce size limits to prevent abuse
5. **Implement rate limiting**: Limit uploads per user/IP
6. **Scan for malware**: Consider integrating virus scanning for user uploads
7. **Use private resources**: For sensitive documents, use Cloudinary's private delivery

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js Cloudinary Guide](https://next-cloudinary.dev/)
- [Image Optimization Best Practices](https://cloudinary.com/blog/image_optimization_best_practices)
- [Responsive Images](https://cloudinary.com/documentation/responsive_images)

## Support

For issues or questions:
1. Check this documentation
2. Review Cloudinary's documentation
3. Check the console for error messages
4. Contact the development team
