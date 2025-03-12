import { useState } from 'react';
import { filesToBase64 } from '@/utils/fileUpload';

interface UseImageUploadReturn {
  uploadImages: (files: File[]) => Promise<string[]>;
  isUploading: boolean;
  error: string | null;
}

/**
 * Custom hook for handling image uploads
 * This is a client-side implementation that converts images to base64 strings
 * In a real application, you would upload the files to a server
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];

    setIsUploading(true);
    setError(null);

    try {
      // In a real implementation, you would upload the files to a server
      // and get back URLs. For now, we'll convert them to base64 strings.
      const base64Urls = await filesToBase64(files);
      return base64Urls;
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Failed to process images');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImages, isUploading, error };
};
