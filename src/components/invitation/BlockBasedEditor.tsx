'use client';

// AIDEV-NOTE: 블록 기반 청첩장 편집기 - 기존 DND 시스템을 대체
import React, { useCallback, useEffect, useState } from 'react';
import { BlockEditor } from '@/components/blocks/BlockEditor';
import { LoadingSpinner } from './LoadingSpinner';
import { useBlocks } from '@/hooks/useBlocks';
import { useInvitationManager } from '@/hooks/useInvitationManager';
import { useAutoSave } from '@/hooks/useAutoSave';
import { convertEditorStateToBlocks } from '@/lib/blocks/block-converters';
import {
  createInitialBlocksFromTemplate,
  createInitialBlocksFromWeddingInfo,
} from '@/lib/blocks/block-generators';
import { cn } from '@/lib/utils';
import type { Template } from '@/types';
import type { WeddingInfoFormData } from '@/lib/wedding-validations';

interface BlockBasedEditorProps {
  invitationId?: string;
  templateId?: string;
  template?: Template;
  weddingInfo?: WeddingInfoFormData; // AIDEV-NOTE: 결혼식 정보를 블록에 전달
  isPreviewMode?: boolean;
  className?: string;
}

export function BlockBasedEditor({
  invitationId,
  templateId,
  template,
  weddingInfo,
  isPreviewMode = false,
  className,
}: BlockBasedEditorProps) {
  const [internalPreviewMode, setInternalPreviewMode] = useState(false);
  const currentPreviewMode = isPreviewMode ?? internalPreviewMode;

  // AIDEV-NOTE: 블록 상태 관리
  const { blocks, loadBlocks, validateBlocks, isDirty } =
    useBlocks(invitationId);

  // AIDEV-NOTE: 초대장 관리 (로딩, 저장)
  const { invitation, isLoading, isSaving, handleSave } = useInvitationManager({
    invitationId,
    templateId,
    validateBlocks,
  });

  // AIDEV-NOTE: 자동 저장
  useAutoSave({
    blocks,
    invitationId,
    isSaving,
    isDirty,
    onSave: handleSave,
  });

  // AIDEV-NOTE: 기존 초대장 데이터를 블록 형태로 변환하여 로드
  useEffect(() => {
    if (invitation && invitation.editorState) {
      const convertedBlocks = convertEditorStateToBlocks(
        invitation.editorState
      );
      loadBlocks(convertedBlocks);
    }
  }, [invitation, loadBlocks]);

  // AIDEV-NOTE: 미리보기 모드 토글
  const handlePreviewToggle = useCallback((isPreview: boolean) => {
    setInternalPreviewMode(isPreview);
  }, []);

  // AIDEV-NOTE: Template과 결혼식 정보가 제공된 경우 초기 블록 생성
  useEffect(() => {
    if (template && blocks.length === 0 && !invitationId) {
      const initialBlocks = weddingInfo
        ? createInitialBlocksFromWeddingInfo(weddingInfo, template)
        : createInitialBlocksFromTemplate(template);
      loadBlocks(initialBlocks);
    }
  }, [template, weddingInfo, blocks.length, loadBlocks, invitationId]);

  if (isLoading && invitationId) {
    return <LoadingSpinner message="청첩장을 불러오는 중..." />;
  }

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <BlockEditor
        invitationId={invitationId}
        initialBlocks={blocks}
        isPreviewMode={currentPreviewMode}
        onSave={handleSave}
        onPreviewToggle={handlePreviewToggle}
      />
    </div>
  );
}
