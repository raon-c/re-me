import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getInvitationByIdAction,
  createInvitationAction,
  updateInvitationAction,
} from '@/actions/safe-invitation-actions';
import {
  convertBlocksToEditorState,
  extractTitleFromBlocks,
} from '@/lib/blocks/block-converters';
import type { Block } from '@/types/blocks';

interface UseInvitationManagerProps {
  invitationId?: string;
  templateId?: string;
  validateBlocks: () => boolean;
}

export function useInvitationManager({
  invitationId,
  templateId,
  validateBlocks,
}: UseInvitationManagerProps) {
  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 초대장 데이터 로드
  useEffect(() => {
    const loadInvitation = async () => {
      if (!invitationId) return;

      setIsLoading(true);
      try {
        const result = await getInvitationByIdAction({ id: invitationId });
        if (result?.data) {
          setInvitation(result.data);
        }
      } catch (error) {
        console.error('Failed to load invitation:', error);
        toast.error('청첩장을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitation();
  }, [invitationId]);

  // 블록 데이터 저장 핸들러
  const handleSave = useCallback(
    async (blocksToSave: Block[]) => {
      if (!validateBlocks() || isSaving) return;

      setIsSaving(true);

      try {
        // 블록 데이터를 기존 editorState 형태로 변환
        const editorState = convertBlocksToEditorState(blocksToSave);

        if (invitationId) {
          const result = await updateInvitationAction({
            id: invitationId,
            data: editorState,
          });

          if (result?.data) {
            toast.success('청첩장이 저장되었습니다.');
            setInvitation(result.data);
          } else {
            throw new Error(result?.serverError || '저장에 실패했습니다.');
          }
        } else {
          // 새 초대장 생성
          const title = extractTitleFromBlocks(blocksToSave);
          const result = await createInvitationAction({
            title,
            template_id: templateId || '',
            ...editorState,
          });

          if (result?.data) {
            toast.success('청첩장이 생성되었습니다.');
            // Redirect to editor with the new invitation ID
            window.history.replaceState(
              null,
              '',
              `/invitation/edit?id=${result.data.invitation.id}`
            );
            setInvitation(result.data.invitation);
          } else {
            throw new Error(result?.serverError || '생성에 실패했습니다.');
          }
        }
      } catch (error) {
        console.error('Save error:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : '저장 중 오류가 발생했습니다.'
        );
      } finally {
        setIsSaving(false);
      }
    },
    [invitationId, templateId, validateBlocks, isSaving]
  );

  return {
    invitation,
    isLoading,
    isSaving,
    handleSave,
  };
}
