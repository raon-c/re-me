'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Eye,
  Trash2,
  Search,
  Grid,
  List,
  FileImage,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageGalleryProps {
  onImageSelect?: (imageUrl: string, metadata: Record<string, any>) => void;
  selectable?: boolean;
  className?: string;
}

interface ImageItem {
  name: string;
  fullPath: string;
  publicUrl: string;
  size: number;
  lastModified: string;
  contentType: string;
}

export function ImageGallery({
  onImageSelect,
  selectable = false,
  className,
}: ImageGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // 이미지 목록 조회
  const {
    data: imagesData,
    isLoading,
    refetch,
  } = api.upload.getUserImages.useQuery({
    limit: 50,
    offset: 0,
  });

  // 이미지 삭제 뮤테이션
  const deleteMutation = api.upload.deleteImage.useMutation({
    onSuccess: () => {
      toast.success('이미지가 삭제되었습니다.');
      refetch();
    },
    onError: (error) => {
      toast.error(`삭제 실패: ${error.message}`);
    },
  });

  // 검색 필터
  const filteredImages = imagesData?.images?.filter((image) =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // 이미지 선택 핸들러
  const handleImageSelect = (image: ImageItem) => {
    if (selectable) {
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(image.publicUrl)) {
          newSet.delete(image.publicUrl);
        } else {
          newSet.add(image.publicUrl);
        }
        return newSet;
      });
    }
    onImageSelect?.(image.publicUrl, {
      name: image.name,
      size: image.size,
      contentType: image.contentType,
    });
  };

  // 이미지 삭제 핸들러
  const handleDeleteImage = async (image: ImageItem) => {
    if (confirm('이미지를 삭제하시겠습니까?')) {
      await deleteMutation.mutateAsync({ fileName: image.fullPath });
    }
  };

  // URL 복사 핸들러
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('URL이 클립보드에 복사되었습니다.');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error('URL 복사에 실패했습니다.');
    }
  };

  // 이미지 다운로드 핸들러
  const handleDownloadImage = (image: ImageItem) => {
    const link = document.createElement('a');
    link.href = image.publicUrl;
    link.download = image.name;
    link.target = '_blank';
    link.click();
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }


  return (
    <Card className={cn('p-6', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">이미지 갤러리</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="이미지 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 이미지 목록 */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileImage className="h-12 w-12 mx-auto mb-2" />
          <p>업로드된 이미지가 없습니다.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.fullPath}
              className={cn(
                'relative group cursor-pointer border-2 border-transparent rounded-lg overflow-hidden transition-all hover:shadow-lg',
                selectable && selectedImages.has(image.publicUrl) && 'border-blue-500'
              )}
              onClick={() => handleImageSelect(image)}
            >
              <div className="aspect-square bg-gray-100">
                <img
                  src={image.publicUrl}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 오버레이 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(image.publicUrl, '_blank');
                      }}
                      className="h-8 w-8 p-0 bg-white"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(image.publicUrl);
                      }}
                      className="h-8 w-8 p-0 bg-white"
                    >
                      {copiedUrl === image.publicUrl ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadImage(image);
                      }}
                      className="h-8 w-8 p-0 bg-white"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image);
                      }}
                      className="h-8 w-8 p-0 bg-white text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 이미지 정보 */}
              <div className="p-2 bg-white">
                <p className="text-xs text-gray-900 truncate">{image.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(image.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredImages.map((image) => (
            <div
              key={image.fullPath}
              className={cn(
                'flex items-center space-x-4 p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50',
                selectable && selectedImages.has(image.publicUrl) && 'bg-blue-50 border-blue-500'
              )}
              onClick={() => handleImageSelect(image)}
            >
              <div className="flex-shrink-0">
                <img
                  src={image.publicUrl}
                  alt={image.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {image.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(image.size)} • {formatDate(image.lastModified)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(image.publicUrl, '_blank');
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyUrl(image.publicUrl);
                  }}
                  className="h-8 w-8 p-0"
                >
                  {copiedUrl === image.publicUrl ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadImage(image);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(image);
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 선택된 이미지 개수 표시 */}
      {selectable && selectedImages.size > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {selectedImages.size}개의 이미지가 선택되었습니다.
          </p>
        </div>
      )}
    </Card>
  );
}