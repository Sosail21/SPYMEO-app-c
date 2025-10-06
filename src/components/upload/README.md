# Upload Components

React components for file uploads with Cloudinary integration.

## Components

### AvatarUpload

Upload and preview user avatars with automatic circular cropping.

```tsx
import AvatarUpload from '@/components/upload/AvatarUpload';

<AvatarUpload
  currentAvatar={user.avatar}
  onUploadSuccess={(url, publicId) => {
    // Update user avatar
    updateUser({ avatar: url, avatarPublicId: publicId });
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
  }}
  size="lg" // 'sm' | 'md' | 'lg'
/>
```

**Props:**
- `currentAvatar?: string` - Current avatar URL
- `onUploadSuccess?: (url: string, publicId: string) => void` - Success callback
- `onUploadError?: (error: string) => void` - Error callback
- `size?: 'sm' | 'md' | 'lg'` - Avatar display size (default: 'md')

**Features:**
- Live preview
- Automatic circular crop
- Face detection
- 5MB size limit
- Accepts: JPG, PNG, WebP

### FileUpload

Generic file upload component for documents, receipts, and other files.

```tsx
import FileUpload from '@/components/upload/FileUpload';

<FileUpload
  uploadType="document"
  accept="application/pdf,.doc,.docx"
  maxSize={20}
  label="Upload Document"
  onUploadSuccess={(data) => {
    console.log('File uploaded:', data.url);
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
  }}
/>
```

**Props:**
- `uploadType: 'document' | 'receipt' | 'image'` - Type of upload
- `accept?: string` - Accepted file types (default: '*/*')
- `maxSize?: number` - Max file size in MB (default: 20)
- `entityId?: string` - Entity ID for image uploads
- `index?: number` - Image index for multiple images
- `onUploadSuccess?: (data) => void` - Success callback
- `onUploadError?: (error: string) => void` - Error callback
- `label?: string` - Button label
- `multiple?: boolean` - Allow multiple files (default: false)

**Features:**
- Drag and drop support
- File validation
- Progress indicator
- Custom size limits
- File type restrictions

### ImageGallery

Multi-image upload with preview, reordering, and management.

```tsx
import ImageGallery from '@/components/upload/ImageGallery';

<ImageGallery
  images={product.images}
  maxImages={5}
  entityType="product"
  entityId={product.id}
  onImagesChange={(images) => {
    // Update product images
    updateProduct({
      images: images.map(img => img.url),
      cloudinaryPublicIds: images.map(img => img.publicId),
    });
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
  }}
/>
```

**Props:**
- `images?: ImageData[]` - Current images
- `maxImages?: number` - Maximum images allowed (default: 5)
- `entityType: 'product' | 'article' | 'service' | 'formation' | 'annonce'` - Entity type
- `entityId: string` - Entity ID
- `onImagesChange?: (images: ImageData[]) => void` - Images change callback
- `onUploadError?: (error: string) => void` - Error callback

**ImageData Type:**
```typescript
interface ImageData {
  url: string;
  publicId: string;
  order: number;
}
```

**Features:**
- Multiple image upload
- Grid preview
- Drag to reorder
- Remove images
- Order badge
- Max limit enforcement
- 10MB per image limit
- Accepts: JPG, PNG, WebP

## Usage Examples

### User Profile Avatar

```tsx
'use client';

import { useState } from 'react';
import AvatarUpload from '@/components/upload/AvatarUpload';

export default function ProfileSettings({ user }) {
  const [avatar, setAvatar] = useState(user.avatar);

  const handleAvatarUpdate = async (url, publicId) => {
    // Update user in database
    await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: url, avatarPublicId: publicId }),
    });

    setAvatar(url);
  };

  return (
    <div>
      <h2>Profile Picture</h2>
      <AvatarUpload
        currentAvatar={avatar}
        onUploadSuccess={handleAvatarUpdate}
        size="lg"
      />
    </div>
  );
}
```

### Document Upload Form

```tsx
'use client';

import { useState } from 'react';
import FileUpload from '@/components/upload/FileUpload';

export default function DocumentUpload() {
  const [documents, setDocuments] = useState([]);

  const handleDocumentUpload = (data) => {
    setDocuments([...documents, data]);
    // Save to database
  };

  return (
    <div>
      <h2>Upload Documents</h2>
      <FileUpload
        uploadType="document"
        accept=".pdf,.doc,.docx"
        maxSize={20}
        label="Choose Document"
        onUploadSuccess={handleDocumentUpload}
        onUploadError={(error) => alert(error)}
      />

      <div className="mt-4">
        <h3>Uploaded Documents</h3>
        <ul>
          {documents.map((doc, i) => (
            <li key={i}>
              <a href={doc.url} target="_blank">
                {doc.fileName}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### Product Image Gallery

```tsx
'use client';

import { useState } from 'react';
import ImageGallery from '@/components/upload/ImageGallery';

export default function ProductImageEditor({ product }) {
  const [images, setImages] = useState(
    product.images.map((url, i) => ({
      url,
      publicId: product.cloudinaryPublicIds[i],
      order: i,
    }))
  );

  const handleImagesChange = async (newImages) => {
    setImages(newImages);

    // Update product in database
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

### Receipt Upload for Pre-Accounting

```tsx
'use client';

import FileUpload from '@/components/upload/FileUpload';

export default function ReceiptUpload() {
  const handleReceiptUpload = async (data) => {
    // Create receipt record in database
    await fetch('/api/precompta/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: data.fileName,
        fileUrl: data.url,
        cloudinaryPublicId: data.publicId,
      }),
    });

    alert('Receipt uploaded successfully!');
  };

  return (
    <div>
      <h2>Upload Receipt</h2>
      <FileUpload
        uploadType="receipt"
        accept=".pdf,.jpg,.png"
        maxSize={10}
        label="Upload Receipt"
        onUploadSuccess={handleReceiptUpload}
        onUploadError={(error) => alert(error)}
      />
    </div>
  );
}
```

## Styling

All components use Tailwind CSS classes and can be customized by wrapping them in a container with custom styles.

```tsx
<div className="custom-upload-container">
  <AvatarUpload {...props} />
</div>

<style jsx>{`
  .custom-upload-container {
    /* Custom styles */
  }
`}</style>
```

## Error Handling

All components include built-in error handling and display error messages to the user. You can also provide custom error handlers:

```tsx
<FileUpload
  {...props}
  onUploadError={(error) => {
    // Log to error tracking service
    console.error('Upload error:', error);

    // Show custom notification
    showToast({
      type: 'error',
      message: error,
    });
  }}
/>
```

## Accessibility

Components include:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus indicators

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Requires support for:
- File API
- FormData
- Fetch API
- ES6+
