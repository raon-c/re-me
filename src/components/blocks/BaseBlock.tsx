'use client';

// AIDEV-NOTE: 모든 블록 컴포넌트의 기본 래퍼
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Block, BlockStyles } from '@/types/blocks';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Edit3,
  Copy,
  ArrowUp,
  ArrowDown,
  Settings,
} from 'lucide-react';

interface BaseBlockProps {
  block: Block;
  children: ReactNode;
  isEditing?: boolean;
  isPreview?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSettings?: () => void;
  className?: string;
}

// AIDEV-NOTE: 블록 스타일을 CSS 클래스로 변환
function getBlockStyles(styles?: BlockStyles): string {
  if (!styles) return '';
  
  const classes = [];
  
  // 텍스트 색상
  if (styles.textColor) {
    classes.push(`text-[${styles.textColor}]`);
  }
  
  // 배경 색상
  if (styles.backgroundColor) {
    classes.push(`bg-[${styles.backgroundColor}]`);
  }
  
  // 폰트 크기
  switch (styles.fontSize) {
    case 'small':
      classes.push('text-sm');
      break;
    case 'large':
      classes.push('text-lg');
      break;
    default:
      classes.push('text-base');
  }
  
  // 폰트 굵기
  if (styles.fontWeight === 'bold') {
    classes.push('font-bold');
  }
  
  // 텍스트 정렬
  switch (styles.textAlign) {
    case 'left':
      classes.push('text-left');
      break;
    case 'right':
      classes.push('text-right');
      break;
    default:
      classes.push('text-center');
  }
  
  // 패딩
  switch (styles.padding) {
    case 'small':
      classes.push('p-2');
      break;
    case 'large':
      classes.push('p-6');
      break;
    default:
      classes.push('p-4');
  }
  
  // 마진
  switch (styles.margin) {
    case 'small':
      classes.push('m-1');
      break;
    case 'large':
      classes.push('m-4');
      break;
    default:
      classes.push('m-2');
  }
  
  return classes.join(' ');
}

export function BaseBlock({
  block,
  children,
  isEditing = false,
  isPreview = false,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onSettings,
  className,
}: BaseBlockProps) {
  const blockStyles = getBlockStyles(block.styles);
  
  if (isPreview) {
    return (
      <div 
        className={cn(
          'relative transition-all duration-200',
          blockStyles,
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative group transition-all duration-200 overflow-hidden',
        'border-2 border-transparent rounded-lg',
        !isEditing && 'hover:border-blue-200',
        isEditing && 'border-blue-400 bg-blue-50 shadow-sm',
        blockStyles,
        className
      )}
    >
      {/* AIDEV-NOTE: 블록 편집 툴바 오버레이 - 블록 내부를 덮는 형식 (편집 중이 아닐 때만) */}
      {!isPreview && !isEditing && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
          {/* 반투명 오버레이 배경 */}
          <div className="absolute inset-0 bg-black bg-opacity-10 rounded-lg" />

          {/* 툴바 컨테이너 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-wrap gap-1 sm:gap-2 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 sm:p-2 pointer-events-auto max-w-xs">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-100"
                  title="편집"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
              {(onMoveUp || onMoveDown) && (
                <div className="flex">
                  {onMoveUp && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMoveUp}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 rounded-r-none"
                      title="위로 이동"
                    >
                      <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                  {onMoveDown && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMoveDown}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 rounded-l-none border-l"
                      title="아래로 이동"
                    >
                      <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              )}
              {onDuplicate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDuplicate}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-green-100"
                  title="복제"
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
              {onSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSettings}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-purple-100"
                  title="설정"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                  title="삭제"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AIDEV-NOTE: 편집 모드 UI */}
      {isEditing && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
          {block.type} 편집 중
        </div>
      )}

      {/* AIDEV-NOTE: 블록 내용 - 전체 너비 사용 */}
      <div className="w-full">{children}</div>
    </div>
  );
}