import { useEffect } from 'react';
import type { Block } from '@/types/blocks';

interface UseAutoSaveProps {
  blocks: Block[];
  invitationId?: string;
  isSaving: boolean;
  isDirty: () => boolean;
  onSave: (blocks: Block[]) => Promise<void>;
  delay?: number;
}

export function useAutoSave({
  blocks,
  invitationId,
  isSaving,
  isDirty,
  onSave,
  delay = 3000,
}: UseAutoSaveProps) {
  useEffect(() => {
    if (isDirty() && invitationId && !isSaving) {
      const timer = setTimeout(() => {
        onSave(blocks);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [blocks, invitationId, isSaving, isDirty, onSave, delay]);
}
