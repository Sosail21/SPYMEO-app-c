# Cloudinary Usage Examples

Quick reference guide with practical examples for common use cases.

## Table of Contents

- [Avatar Upload](#avatar-upload)
- [Document Upload](#document-upload)
- [Receipt Upload](#receipt-upload)
- [Product Images](#product-images)
- [Article Cover Image](#article-cover-image)
- [Image Optimization](#image-optimization)
- [Responsive Images](#responsive-images)
- [Deleting Files](#deleting-files)

## Avatar Upload

### Backend Upload

```typescript
import { uploadAvatar } from '@/lib/cloudinary/upload';

// From API route
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Convert to buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload to Cloudinary
  const result = await uploadAvatar(buffer, session.user.id);

  if (result.success) {
    // Update user in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        avatar: result.secureUrl,
        avatarPublicId: result.publicId,
      },
    });

    return NextResponse.json({ success: true, url: result.secureUrl });
  }

  return NextResponse.json({ success: false, error: result.error }, { status: 500 });
}
```

### Frontend Component

```tsx
'use client';

import AvatarUpload from '@/components/upload/AvatarUpload';

export default function ProfilePage({ user }) {
  const handleAvatarUpdate = async (url: string, publicId: string) => {
    // Avatar is automatically uploaded by the component
    // Just update local state or refetch user data
    window.location.reload(); // or use SWR/React Query to refetch
  };

  return (
    <div>
      <h1>Profile Settings</h1>
      <AvatarUpload
        currentAvatar={user.avatar}
        onUploadSuccess={handleAvatarUpdate}
        onUploadError={(error) => alert(error)}
        size="lg"
      />
    </div>
  );
}
```

## Document Upload

### Upload PDF Document

```typescript
import { uploadDocument } from '@/lib/cloudinary/upload';

// Upload invoice PDF
const result = await uploadDocument(
  pdfBuffer,
  userId,
  'invoice'
);

// Save to database
await prisma.document.create({
  data: {
    userId,
    title: 'Invoice March 2025',
    fileName: 'invoice-march-2025.pdf',
    fileUrl: result.secureUrl!,
    cloudinaryPublicId: result.publicId!,
    fileType: 'application/pdf',
    fileSize: result.bytes,
    category: 'invoice',
  },
});
```

### Frontend Document Upload

```tsx
'use client';

import FileUpload from '@/components/upload/FileUpload';

export default function DocumentsPage() {
  const handleDocumentUpload = async (data) => {
    // Save document to database
    const response = await fetch('/api/user/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.fileName,
        fileName: data.fileName,
        fileUrl: data.url,
        cloudinaryPublicId: data.publicId,
      }),
    });

    if (response.ok) {
      alert('Document uploaded successfully!');
      // Refetch documents list
    }
  };

  return (
    <div>
      <h1>My Documents</h1>
      <FileUpload
        uploadType="document"
        accept=".pdf,.doc,.docx"
        maxSize={20}
        label="Upload Document"
        onUploadSuccess={handleDocumentUpload}
      />
    </div>
  );
}
```

## Receipt Upload

### Backend Receipt Upload

```typescript
import { uploadReceipt } from '@/lib/cloudinary/upload';

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  // Check if practitioner
  if (session.user.role !== 'PRACTITIONER') {
    return NextResponse.json(
      { error: 'Only practitioners can upload receipts' },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload receipt
  const result = await uploadReceipt(buffer, session.user.id);

  if (result.success) {
    // Create receipt record
    const receipt = await prisma.receipt.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileUrl: result.secureUrl!,
        cloudinaryPublicId: result.publicId!,
        fileSize: result.bytes,
      },
    });

    return NextResponse.json({ success: true, receipt });
  }

  return NextResponse.json({ error: result.error }, { status: 500 });
}
```

## Product Images

### Upload Multiple Product Images

```typescript
import { uploadProductImage } from '@/lib/cloudinary/upload';

async function uploadProductImages(productId: string, files: File[]) {
  const imageUrls: string[] = [];
  const publicIds: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadProductImage(buffer, productId, i);

    if (result.success) {
      imageUrls.push(result.secureUrl!);
      publicIds.push(result.publicId!);
    }
  }

  // Update product in database
  await prisma.product.update({
    where: { id: productId },
    data: {
      images: imageUrls,
      cloudinaryPublicIds: publicIds,
    },
  });

  return { imageUrls, publicIds };
}
```

### Frontend Image Gallery

```tsx
'use client';

import ImageGallery from '@/components/upload/ImageGallery';

export default function ProductEditor({ product }) {
  const [images, setImages] = useState(
    product.images.map((url, i) => ({
      url,
      publicId: product.cloudinaryPublicIds[i],
      order: i,
    }))
  );

  const handleImagesChange = async (newImages) => {
    setImages(newImages);

    // Update product
    await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: newImages.map(img => img.url),
        cloudinaryPublicIds: newImages.map(img => img.publicId),
      }),
    });
  };

  return (
    <div>
      <h2>Product Images</h2>
      <ImageGallery
        images={images}
        maxImages={5}
        entityType="product"
        entityId={product.id}
        onImagesChange={handleImagesChange}
      />
    </div>
  );
}
```

## Article Cover Image

### Upload Blog Article Cover

```typescript
import { uploadArticleCover } from '@/lib/cloudinary/upload';

// In API route
const buffer = Buffer.from(await coverImage.arrayBuffer());
const result = await uploadArticleCover(buffer, articleId);

await prisma.article.update({
  where: { id: articleId },
  data: {
    thumbnail: result.secureUrl,
    thumbnailPublicId: result.publicId,
  },
});
```

### Display Article Cover

```tsx
import { getTransformationUrl } from '@/lib/cloudinary/config';

export default function ArticleCard({ article }) {
  return (
    <article>
      {article.thumbnailPublicId && (
        <img
          src={getTransformationUrl(article.thumbnailPublicId, 'large')}
          alt={article.title}
          loading="lazy"
        />
      )}
      <h2>{article.title}</h2>
      <p>{article.excerpt}</p>
    </article>
  );
}
```

## Image Optimization

### Get Optimized Image URLs

```typescript
import StorageService from '@/lib/services/storage-service';

// Optimize for web
const webUrl = StorageService.optimizeImage(publicId, {
  width: 800,
  quality: 'auto',
  format: 'auto', // WebP or AVIF
});

// Generate thumbnail
const thumbUrl = StorageService.generateThumbnail(publicId, {
  width: 150,
  height: 150,
});

// Custom transformation
const customUrl = StorageService.optimizeImage(publicId, {
  width: 400,
  height: 300,
  crop: 'fill',
  gravity: 'auto',
  quality: 80,
});
```

### Display Optimized Images

```tsx
import StorageService from '@/lib/services/storage-service';

export default function ProductImage({ product }) {
  const publicId = product.cloudinaryPublicIds[0];

  return (
    <img
      src={StorageService.optimizeImage(publicId, {
        width: 600,
        quality: 'auto',
      })}
      alt={product.title}
      loading="lazy"
    />
  );
}
```

## Responsive Images

### Generate Responsive Breakpoints

```tsx
import StorageService from '@/lib/services/storage-service';

export default function ResponsiveImage({ publicId, alt }) {
  return (
    <picture>
      {/* Mobile */}
      <source
        media="(max-width: 640px)"
        srcSet={StorageService.getResponsiveUrl(publicId, 'sm')}
      />

      {/* Tablet */}
      <source
        media="(max-width: 768px)"
        srcSet={StorageService.getResponsiveUrl(publicId, 'md')}
      />

      {/* Desktop */}
      <source
        media="(max-width: 1024px)"
        srcSet={StorageService.getResponsiveUrl(publicId, 'lg')}
      />

      {/* Large Desktop */}
      <img
        src={StorageService.getResponsiveUrl(publicId, 'xl')}
        alt={alt}
        loading="lazy"
      />
    </picture>
  );
}
```

### Next.js Image Component

```tsx
import Image from 'next/image';
import StorageService from '@/lib/services/storage-service';

export default function OptimizedImage({ publicId, alt }) {
  return (
    <Image
      src={StorageService.optimizeImage(publicId)}
      alt={alt}
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL={StorageService.generateThumbnail(publicId, {
        width: 40,
        height: 30,
      })}
    />
  );
}
```

## Deleting Files

### Delete Single File

```typescript
import StorageService from '@/lib/services/storage-service';

// Delete avatar
async function deleteAvatar(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPublicId: true },
  });

  if (user?.avatarPublicId) {
    // Delete from Cloudinary
    await StorageService.deleteFile(user.avatarPublicId);

    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: null,
        avatarPublicId: null,
      },
    });
  }
}
```

### Delete Multiple Files

```typescript
import StorageService from '@/lib/services/storage-service';

// Delete all product images
async function deleteProductImages(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { cloudinaryPublicIds: true },
  });

  if (product?.cloudinaryPublicIds && product.cloudinaryPublicIds.length > 0) {
    // Delete from Cloudinary
    await StorageService.deleteFiles(product.cloudinaryPublicIds);

    // Update database
    await prisma.product.update({
      where: { id: productId },
      data: {
        images: [],
        cloudinaryPublicIds: [],
      },
    });
  }
}
```

### Delete When Updating

```typescript
// Delete old avatar before uploading new one
export async function updateAvatar(userId: string, newFile: File) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPublicId: true },
  });

  // Delete old avatar if exists
  if (user?.avatarPublicId) {
    await StorageService.deleteFile(user.avatarPublicId);
  }

  // Upload new avatar
  const buffer = Buffer.from(await newFile.arrayBuffer());
  const result = await uploadAvatar(buffer, userId);

  if (result.success) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: result.secureUrl,
        avatarPublicId: result.publicId,
      },
    });
  }

  return result;
}
```

## Advanced Examples

### Signed URLs for Private Files

```typescript
import StorageService from '@/lib/services/storage-service';

// Generate signed URL that expires in 1 hour
const signedUrl = StorageService.getSignedUrl(publicId, {
  expiresIn: 3600, // 1 hour
  transformation: {
    width: 800,
    quality: 'auto',
  },
});

// Use for private documents
return NextResponse.json({ documentUrl: signedUrl });
```

### Search Files by Tags

```typescript
import StorageService from '@/lib/services/storage-service';

// Search for all avatars of a specific user
const results = await StorageService.searchByTags(
  [`user:${userId}`, 'type:avatar'],
  50
);

console.log('Found avatars:', results.resources);
```

### PDF Thumbnail Preview

```typescript
import StorageService from '@/lib/services/storage-service';

// Generate thumbnail from first page of PDF
const pdfThumbUrl = StorageService.generateThumbnail(pdfPublicId, {
  width: 200,
  height: 280,
  page: 1, // First page
});

// Display PDF preview
<img src={pdfThumbUrl} alt="PDF Preview" />
```

### Bulk Upload with Progress

```typescript
async function bulkUploadImages(files: File[], productId: string) {
  const total = files.length;
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadProductImage(buffer, productId, i);

    if (result.success) {
      results.push(result);

      // Report progress
      console.log(`Uploaded ${i + 1}/${total}`);
    }
  }

  return results;
}
```

These examples cover the most common use cases. For more advanced features, refer to the [Cloudinary Integration Guide](./cloudinary-integration.md).
