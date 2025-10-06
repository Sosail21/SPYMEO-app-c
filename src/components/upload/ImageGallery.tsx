'use client';

/**
 * Image Gallery Component
 * Multi-image upload with preview and management
 */

import { useState, useRef, ChangeEvent } from 'react';

interface ImageData {
  url: string;
  publicId: string;
  order: number;
}

interface ImageGalleryProps {
  images?: ImageData[];
  maxImages?: number;
  entityType: 'product' | 'article' | 'service' | 'formation' | 'annonce';
  entityId: string;
  onImagesChange?: (images: ImageData[]) => void;
  onUploadError?: (error: string) => void;
}

export default function ImageGallery({
  images = [],
  maxImages = 5,
  entityType,
  entityId,
  onImagesChange,
  onUploadError,
}: ImageGalleryProps) {
  const [currentImages, setCurrentImages] = useState<ImageData[]>(images);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding files would exceed max
    if (currentImages.length + files.length > maxImages) {
      const errorMsg = `Maximum ${maxImages} images allowed`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setUploading(true);
    setError(null);

    const uploadedImages: ImageData[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image`);
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds 10MB`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', entityType);
        formData.append('entityId', entityId);
        formData.append('index', (currentImages.length + i).toString());

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        uploadedImages.push({
          url: data.data.url,
          publicId: data.data.publicId,
          order: currentImages.length + i,
        });
      }

      const newImages = [...currentImages, ...uploadedImages];
      setCurrentImages(newImages);
      onImagesChange?.(newImages);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to upload images';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    // Reorder remaining images
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    setCurrentImages(reorderedImages);
    onImagesChange?.(reorderedImages);
  };

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...currentImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    // Update order
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    setCurrentImages(reorderedImages);
    onImagesChange?.(reorderedImages);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentImages.map((image, index) => (
          <div
            key={image.publicId}
            className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
          >
            <img
              src={image.url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleReorderImages(index, index - 1)}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
                  title="Move Left"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              {index < currentImages.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleReorderImages(index, index + 1)}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
                  title="Move Right"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Order Badge */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Add Image Button */}
        {currentImages.length < maxImages && (
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-xs">Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-xs">Add Image</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Info Text */}
      <p className="mt-2 text-xs text-gray-500">
        {currentImages.length} / {maxImages} images
        {currentImages.length === 0 && ' - Click to add images'}
      </p>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
