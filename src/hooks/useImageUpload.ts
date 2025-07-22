'use client';

// AIDEV-NOTE: 이미지 업로드 훅 - Safe Actions를 사용한 파일 업로드 및 상태 관리
import { useState, useCallback } from 'react';
import { uploadImageAction, deleteImageAction } from '@/actions/safe-upload-actions';

export interface UploadedImage {
  url: string;
  path: string;
  originalName: string;
  size: number;
  type: string;
}

export interface UploadError {
  message: string;
  code?: string;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: UploadError | null;
  uploadedImage: UploadedImage | null;
}

export function useImageUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedImage: null,
  });

  // AIDEV-NOTE: 파일 업로드 메인 함수
  const uploadImage = useCallback(async (
    file: File,
    folder: 'invitations' | 'templates' | 'avatars' = 'invitations',
    options?: {
      onProgress?: (progress: number) => void;
    }
  ): Promise<UploadedImage | null> => {
    try {
      // AIDEV-NOTE: 업로드 상태 초기화
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        uploadedImage: null,
      });

      // AIDEV-NOTE: 파일 크기 검증
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('파일 크기는 5MB 이하여야 합니다.');
      }

      // AIDEV-NOTE: 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드할 수 있습니다.');
      }

      // 진행률 업데이트
      setUploadState(prev => ({ ...prev, progress: 10 }));
      options?.onProgress?.(10);

      // Safe Action을 통한 이미지 업로드
      const result = await uploadImageAction({ file, folder });

      if (!result?.data) {
        throw new Error(result?.serverError || '업로드에 실패했습니다.');
      }

      const uploadedImage: UploadedImage = {
        url: result.data.url,
        path: result.data.path,
        originalName: result.data.originalName,
        size: result.data.size,
        type: result.data.type,
      };

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        uploadedImage,
      });

      options?.onProgress?.(100);
      return uploadedImage;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.';
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: { message: errorMessage },
        uploadedImage: null,
      });

      console.error('이미지 업로드 실패:', error);
      return null;
    }
  }, []);

  // AIDEV-NOTE: 이미지 삭제 함수
  const deleteImage = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      const result = await deleteImageAction({ filePath });
      
      if (!result?.data) {
        throw new Error(result?.serverError || '삭제에 실패했습니다.');
      }

      return true;
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      return false;
    }
  }, []);

  // AIDEV-NOTE: 상태 초기화 함수
  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedImage: null,
    });
  }, []);

  // AIDEV-NOTE: 파일 크기 포맷팅 유틸리티
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // AIDEV-NOTE: 이미지 미리보기 URL 생성
  const createPreviewUrl = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  // AIDEV-NOTE: 미리보기 URL 해제
  const revokePreviewUrl = useCallback((url: string): void => {
    URL.revokeObjectURL(url);
  }, []);

  return {
    // 상태
    uploadState,
    isUploading: uploadState.isUploading,
    progress: uploadState.progress,
    error: uploadState.error,
    uploadedImage: uploadState.uploadedImage,
    
    // 함수
    uploadImage,
    deleteImage,
    resetUploadState,
    
    // 유틸리티
    formatFileSize,
    createPreviewUrl,
    revokePreviewUrl,
  };
}