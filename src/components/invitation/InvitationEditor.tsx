'use client';

// AIDEV-NOTE: 기존 DND 기반 편집기를 블록 기반 편집기로 교체
import { BlockBasedEditor } from './BlockBasedEditor';

interface InvitationEditorProps {
  invitationId?: string;
  templateId?: string;
  className?: string;
  onSave?: (data: any) => void | Promise<void>;
}

export function InvitationEditor({
  invitationId,
  templateId,
  className,
  onSave,
}: InvitationEditorProps) {
  return (
    <BlockBasedEditor
      invitationId={invitationId}
      templateId={templateId}
      className={className}
      onSave={onSave}
    />
  );
}
