'use client';

// AIDEV-NOTE: 모든 블록 컴포넌트의 기본 래퍼
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Block, BlockStyles } from '@/types/blocks';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3, Copy, ArrowUp, ArrowDown, Settings } from 'lucide-react';

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
        'relative group transition-all duration-200 w-full',
        'border-2 border-transparent hover:border-blue-200',
        isEditing && 'border-blue-400 bg-blue-50',
        blockStyles,
        className
      )}
    >
      {/* AIDEV-NOTE: 블록 편집 툴바 - 세로 레이아웃에 맞게 조정 */}
      {!isPreview && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-md shadow-sm p-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-6 w-6 p-0"
                title="편집"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
            {onMoveUp && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                className="h-6 w-6 p-0"
                title="위로 이동"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
            )}
            {onMoveDown && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                className="h-6 w-6 p-0"
                title="아래로 이동"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            )}
            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicate}
                className="h-6 w-6 p-0"
                title="복제"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
            {onSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettings}
                className="h-6 w-6 p-0"
                title="설정"
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                title="삭제"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* AIDEV-NOTE: 블록 타입 표시 (편집 모드일 때만) */}
      {isEditing && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
          {block.type}
        </div>
      )}

      {/* AIDEV-NOTE: 블록 내용 - 전체 너비 사용 */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}