'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { NEXT_PUBLIC_API_URL } from '../lib/config';

export default function ImageUploader({
  onImageUpload,
  onImageRemove,
  currentImageUrl,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadKey, setUploadKey] = useState(0); // Key to force input re-mount

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/posts/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.ok && data.imageUrl) {
        onImageUpload(data.imageUrl, 'cloudinary');
        // Reset file input by changing key to force re-mount
        setUploadKey(prev => prev + 1);
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        Post Image
      </h3>

      {/* Upload Area */}
      <div className="mb-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-slate-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 text-slate-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-sm text-slate-600">
                {uploading ? 'Uploading...' : 'Click to upload image'}
              </p>
              <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
            </div>
            <input
              key={uploadKey}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}
        </div>

      {/* Current Image Preview */}
      {currentImageUrl && (
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-2">Current Image:</p>
          <div className="relative inline-block">
            <img
              src={currentImageUrl}
              alt="Post preview"
              className="max-h-48 rounded-lg border border-slate-200"
            />
            <button
              type="button"
              onClick={onImageRemove}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
