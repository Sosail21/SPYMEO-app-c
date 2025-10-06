'use client';

/**
 * Generic File Upload Component
 * Supports documents, receipts, and other file types
 */

import { useState, useRef, ChangeEvent } from 'react';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  uploadType: 'document' | 'receipt' | 'image';
  entityId?: string;
  index?: number;
  onUploadSuccess?: (data: {
    url: string;
    publicId: string;
    fileName: string;
  }) => void;
  onUploadError?: (error: string) => void;
  label?: string;
  multiple?: boolean;
}

export default function FileUpload({
  accept = '*/*',
  maxSize = 20,
  uploadType,
  entityId,
  index = 0,
  onUploadSuccess,
  onUploadError,
  label = 'Upload File',
  multiple = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadEndpoint = () => {
    switch (uploadType) {
      case 'document':
        return '/api/upload/document';
      case 'receipt':
        return '/api/upload/receipt';
      case 'image':
        return '/api/upload/image';
      default:
        return '/api/upload/document';
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `File must be less than ${maxSize}MB`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Upload file
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (uploadType === 'image' && entityId) {
        formData.append('type', 'product'); // or other types
        formData.append('entityId', entityId);
        formData.append('index', index.toString());
      }

      const response = await fetch(getUploadEndpoint(), {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadSuccess?.({
        url: data.data.url,
        publicId: data.data.publicId,
        fileName: file.name,
      });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to upload file';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <div>
              <button
                type="button"
                onClick={handleButtonClick}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {label}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                or drag and drop
              </p>
            </div>

            <p className="text-xs text-gray-500">
              Max size: {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {selectedFile && !uploading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
              clipRule="evenodd"
            />
          </svg>
          <span>{selectedFile.name}</span>
        </div>
      )}

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
