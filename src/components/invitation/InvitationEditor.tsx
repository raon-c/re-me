'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useEditorState } from '@/hooks/useEditorState';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { EditorSidebar } from './EditorSidebar';
import { api } from '@/lib/trpc';
import { EditorElement } from '@/types/editor';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InvitationEditorProps {
  invitationId?: string;
  templateId?: string;
  className?: string;
}

export function InvitationEditor({
  invitationId,
  templateId,
  className,
}: InvitationEditorProps) {
  const { state, actions, canUndo, canRedo } = useEditorState();
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] =
    useState<NodeJS.Timeout | null>(null);

  // AIDEV-NOTE: tRPC queries and mutations for invitation data persistence
  const utils = api.useUtils();

  const { data: invitation, isLoading } = api.invitation.getById.useQuery(
    { id: invitationId! },
    { enabled: !!invitationId }
  );

  const createInvitationMutation = api.invitation.create.useMutation({
    onSuccess: (data: any) => {
      toast.success('청첩장이 생성되었습니다.');
      // Redirect to editor with the new invitation ID
      window.history.replaceState(null, '', `/invitation/edit?id=${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateInvitationMutation = api.invitation.update.useMutation({
    onSuccess: () => {
      actions.markSaved();
      toast.success('청첩장이 저장되었습니다.');
      utils.invitation.getById.invalidate({ id: invitationId! });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  // Load invitation data
  useEffect(() => {
    if (invitation && invitation.editorState) {
      // Convert server response to full editor state
      const fullEditorState = {
        elements: invitation.editorState.elements || [],
        selectedElementId: null,
        template: invitation.template
          ? {
              id: invitation.template.id,
              name: invitation.template.name,
              category: invitation.template.category,
              htmlContent: invitation.template.htmlStructure,
              previewImageUrl: invitation.template.previewImageUrl,
            }
          : null,
        weddingInfo: invitation.editorState.weddingInfo,
        isDirty: false,
        lastSaved: new Date(invitation.updatedAt),
      };
      actions.loadState(fullEditorState);
    }
  }, [invitation, actions]);

  // Auto-save functionality
  useEffect(() => {
    if (state.isDirty && invitationId && !isSaving) {
      if (autoSaveInterval) {
        clearTimeout(autoSaveInterval);
      }

      const interval = setTimeout(() => {
        handleSave();
      }, 3000); // Auto-save after 3 seconds of inactivity

      setAutoSaveInterval(interval);
    }

    return () => {
      if (autoSaveInterval) {
        clearTimeout(autoSaveInterval);
      }
    };
  }, [state.isDirty, invitationId, isSaving]);

  const handleSave = useCallback(async () => {
    if (!state.isDirty || isSaving) return;

    setIsSaving(true);

    try {
      const editorState = {
        elements: state.elements,
        weddingInfo: state.weddingInfo,
        templateId: state.template?.id,
      };

      if (invitationId) {
        await updateInvitationMutation.mutateAsync({
          id: invitationId,
          editorState,
        });
      } else {
        // Create new invitation
        await createInvitationMutation.mutateAsync({
          title:
            state.weddingInfo.brideName && state.weddingInfo.groomName
              ? `${state.weddingInfo.groomName} ❤ ${state.weddingInfo.brideName}`
              : '새 청첩장',
          templateId,
          editorState,
        });
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [state, invitationId, templateId, isSaving]);

  const handleAddElement = useCallback(
    (type: EditorElement['type']) => {
      // Add element to center of canvas
      const centerX = 150; // Half of canvas width (300px)
      const centerY = 200; // Approximate center considering aspect ratio
      actions.addElement(type, { x: centerX, y: centerY });
    },
    [actions]
  );

  const handlePreview = useCallback(() => {
    // TODO: Implement preview modal
    toast.info('미리보기 기능은 곧 추가될 예정입니다.');
  }, []);

  const handleExport = useCallback(() => {
    // TODO: Implement export functionality
    toast.info('내보내기 기능은 곧 추가될 예정입니다.');
  }, []);

  const selectedElement =
    state.elements.find((el) => el.id === state.selectedElementId) || null;

  if (isLoading && invitationId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">청첩장을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-screen bg-gray-100', className)}>
      {/* Toolbar */}
      <EditorToolbar
        onAddElement={handleAddElement}
        onUndo={actions.undo}
        onRedo={actions.redo}
        onSave={handleSave}
        onPreview={handlePreview}
        onExport={handleExport}
        canUndo={canUndo}
        canRedo={canRedo}
        isDirty={state.isDirty}
        isSaving={isSaving}
      />

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <EditorCanvas
            elements={state.elements}
            selectedElementId={state.selectedElementId}
            onElementUpdate={actions.updateElement}
            onElementSelect={actions.selectElement}
            onAddElement={(type, position) =>
              actions.addElement(type, position)
            }
          />
        </div>

        {/* Sidebar */}
        <EditorSidebar
          selectedElement={selectedElement}
          weddingInfo={state.weddingInfo}
          onElementUpdate={actions.updateElement}
          onElementDelete={actions.deleteElement}
          onWeddingInfoUpdate={actions.updateWeddingInfo}
        />
      </div>

      {/* Status bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-600 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>요소 {state.elements.length}개</span>
          {state.selectedElementId && (
            <span>• 선택됨: {selectedElement?.type}</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {state.isDirty && (
            <span className="text-orange-600">• 저장되지 않은 변경사항</span>
          )}
          {state.lastSaved && (
            <span>마지막 저장: {state.lastSaved.toLocaleTimeString()}</span>
          )}
          {isSaving && <span className="text-blue-600">저장 중...</span>}
        </div>
      </div>
    </div>
  );
}
