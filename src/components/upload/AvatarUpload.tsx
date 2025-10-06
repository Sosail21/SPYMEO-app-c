'use client';

/**
 * Avatar Upload Component
 * Allows users to upload and preview avatar images with Cloudinary integration
 */

import { useState, useRef, ChangeEvent } from 'react';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUploadSuccess?: (url: string, publicId: string) => void;
  onUploadError?: (error: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function AvatarUpload({
  currentAvatar,
  onUploadSuccess,
  onUploadError,
  size = 'md',
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select an image file';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'Image must be less than 5MB';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadSuccess?.(data.data.url, data.data.publicId);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to upload avatar';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      setPreview(currentAvatar);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-1/2 h-1/2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Uploading...' : 'Change Avatar'}
      </button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
