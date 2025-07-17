import sharp from 'sharp';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface ProcessedImage {
  buffer: Buffer;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

// AIDEV-NOTE: 이미지 처리 및 최적화 유틸리티 (Sharp 기반)
export class ImageProcessor {
  private static readonly MAX_WIDTH = 1920;
  private static readonly MAX_HEIGHT = 1080;
  private static readonly DEFAULT_QUALITY = 80;
  private static readonly DEFAULT_FORMAT = 'webp';

  /**
   * 이미지 크기 조정 및 최적화
   */
  static async processImage(
    inputBuffer: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    const {
      width = this.MAX_WIDTH,
      height = this.MAX_HEIGHT,
      quality = this.DEFAULT_QUALITY,
      format = this.DEFAULT_FORMAT,
      fit = 'inside',
    } = options;

    try {
      // Sharp 인스턴스 생성
      const sharpInstance = sharp(inputBuffer);

      // 메타데이터 추출
      await sharpInstance.metadata();
      
      // 이미지 처리 파이프라인
      let processedImage = sharpInstance
        .resize(width, height, {
          fit,
          withoutEnlargement: true, // 원본보다 큰 크기로 확대하지 않음
        })
        .rotate(); // EXIF 정보 기반 자동 회전

      // 포맷별 처리
      switch (format) {
        case 'jpeg':
          processedImage = processedImage.jpeg({
            quality,
            progressive: true,
          });
          break;
        case 'png':
          processedImage = processedImage.png({
            compressionLevel: 9,
          });
          break;
        case 'webp':
          processedImage = processedImage.webp({
            quality,
            effort: 6,
          });
          break;
      }

      // 처리된 이미지 버퍼 생성
      const buffer = await processedImage.toBuffer();
      const processedMetadata = await sharp(buffer).metadata();

      return {
        buffer,
        metadata: {
          width: processedMetadata.width || 0,
          height: processedMetadata.height || 0,
          format: processedMetadata.format || format,
          size: buffer.length,
        },
      };
    } catch (error) {
      throw new Error(`이미지 처리 중 오류가 발생했습니다: ${error}`);
    }
  }

  /**
   * 썸네일 생성
   */
  static async createThumbnail(
    inputBuffer: Buffer,
    size: number = 300
  ): Promise<ProcessedImage> {
    return this.processImage(inputBuffer, {
      width: size,
      height: size,
      fit: 'cover',
      format: 'webp',
      quality: 70,
    });
  }

  /**
   * 이미지 파일 타입 검증
   */
  static validateImageType(mimeType: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return allowedTypes.includes(mimeType);
  }

  /**
   * 이미지 파일 크기 검증
   */
  static validateImageSize(size: number, maxSize: number = 5 * 1024 * 1024): boolean {
    return size <= maxSize;
  }

  /**
   * 이미지 메타데이터 추출
   */
  static async getImageMetadata(buffer: Buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
        hasAlpha: metadata.hasAlpha || false,
        channels: metadata.channels || 0,
      };
    } catch (error) {
      throw new Error(`이미지 메타데이터 추출 실패: ${error}`);
    }
  }

  /**
   * 파일 이름 생성 (보안을 위해 UUID 사용)
   */
  static generateFileName(originalName: string, userId: string): string {
    const extension = originalName.split('.').pop()?.toLowerCase() || 'webp';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    
    return `${userId}/${timestamp}-${randomSuffix}.${extension}`;
  }

  /**
   * 이미지 품질 점수 계산
   */
  static calculateQualityScore(metadata: Record<string, any>): number {
    const { width, height, size } = metadata;
    const pixels = width * height;
    const bytesPerPixel = size / pixels;
    
    // 품질 점수 계산 (0-100)
    let score = 100;
    
    // 해상도 점수 (낮은 해상도일수록 감점)
    if (pixels < 100000) score -= 20; // 100k 픽셀 미만
    else if (pixels < 500000) score -= 10; // 500k 픽셀 미만
    
    // 압축 점수 (과도한 압축 감점)
    if (bytesPerPixel < 0.5) score -= 15;
    else if (bytesPerPixel < 1) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }
}