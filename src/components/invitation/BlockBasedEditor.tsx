'use client';

// AIDEV-NOTE: 블록 기반 청첩장 편집기 - 기존 DND 시스템을 대체
import React, { useCallback, useEffect, useState } from 'react';
import { BlockEditor } from '@/components/blocks/BlockEditor';
import { useBlocks } from '@/hooks/useBlocks';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Block } from '@/types/blocks';
import type { Template } from '@/types';

interface BlockBasedEditorProps {
  invitationId?: string;
  templateId?: string;
  template?: Template;
  isPreviewMode?: boolean;
  className?: string;
}

export function BlockBasedEditor({
  invitationId,
  templateId,
  template,
  isPreviewMode = false,
  className,
}: BlockBasedEditorProps) {
  const [internalPreviewMode, setInternalPreviewMode] = useState(false);
  const currentPreviewMode = isPreviewMode ?? internalPreviewMode;
  const [isSaving, setIsSaving] = useState(false);

  // AIDEV-NOTE: 블록 상태 관리
  const { blocks, loadBlocks, validateBlocks, isDirty } =
    useBlocks(invitationId);

  // AIDEV-NOTE: tRPC queries and mutations
  const utils = api.useUtils();

  const { data: invitation, isLoading } = api.invitation.getById.useQuery(
    { id: invitationId! },
    { enabled: !!invitationId }
  );

  const createInvitationMutation = api.invitation.create.useMutation({
    onSuccess: (data) => {
      toast.success('청첩장이 생성되었습니다.');
      // Redirect to editor with the new invitation ID
      window.history.replaceState(null, '', `/invitation/edit?id=${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateInvitationMutation = api.invitation.update.useMutation({
    onSuccess: () => {
      toast.success('청첩장이 저장되었습니다.');
      utils.invitation.getById.invalidate({ id: invitationId! });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.'
      );
    },
  });

  // AIDEV-NOTE: 블록 데이터 저장 핸들러
  const handleSave = useCallback(
    async (blocksToSave: Block[]) => {
      if (!validateBlocks() || isSaving) return;

      setIsSaving(true);

      try {
        // 블록 데이터를 기존 editorState 형태로 변환
        const editorState = convertBlocksToEditorState(blocksToSave);

        if (invitationId) {
          await updateInvitationMutation.mutateAsync({
            id: invitationId,
            editorState,
          });
        } else {
          // 새 초대장 생성
          const title = extractTitleFromBlocks(blocksToSave);
          await createInvitationMutation.mutateAsync({
            title,
            templateId,
            editorState,
          });
        }
      } catch (error) {
        console.error('Save error:', error);
        toast.error('저장 중 오류가 발생했습니다.');
      } finally {
        setIsSaving(false);
      }
    },
    [
      invitationId,
      templateId,
      validateBlocks,
      isSaving,
      updateInvitationMutation,
      createInvitationMutation,
    ]
  );

  // AIDEV-NOTE: 기존 초대장 데이터를 블록 형태로 변환하여 로드
  useEffect(() => {
    if (invitation && invitation.editorState) {
      // 기존 editorState를 블록 형태로 변환
      const convertedBlocks = convertEditorStateToBlocks(
        invitation.editorState
      );
      loadBlocks(convertedBlocks);
    }
  }, [invitation, loadBlocks]);

  // AIDEV-NOTE: 자동 저장 기능
  useEffect(() => {
    if (isDirty() && invitationId && !isSaving) {
      const timer = setTimeout(() => {
        handleSave(blocks);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [blocks, invitationId, isSaving, isDirty, handleSave]);

  // AIDEV-NOTE: 미리보기 모드 토글
  const handlePreviewToggle = useCallback((isPreview: boolean) => {
    setInternalPreviewMode(isPreview);
  }, []);

  // Template이 제공된 경우 초기 블록 생성 후 에디터 렌더링
  useEffect(() => {
    if (template && blocks.length === 0) {
      // 템플릿 기반 기본 블록 생성
      const initialBlocks = createInitialBlocksFromTemplate(template);
      loadBlocks(initialBlocks);
    }
  }, [template, blocks.length, loadBlocks]);

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

/**
 * Get category label in Korean
 */
function getCategoryLabel(category: string): string {
  switch (category) {
    case 'classic':
      return '클래식';
    case 'modern':
      return '모던';
    case 'romantic':
      return '로맨틱';
    case 'minimal':
      return '미니멀';
    default:
      return '기타';
  }
}

// AIDEV-NOTE: 기존 editorState를 블록 배열로 변환
function convertEditorStateToBlocks(editorState: any): Block[] {
  const blocks: Block[] = [];
  let order = 0;

  // 웨딩 정보가 있으면 헤더 블록 생성
  if (editorState.weddingInfo) {
    const { weddingInfo } = editorState;
    blocks.push({
      id: 'header-block',
      type: 'header',
      order: order++,
      isVisible: true,
      isEditing: false,
      data: {
        brideName: weddingInfo.brideName || '',
        groomName: weddingInfo.groomName || '',
        weddingDate: weddingInfo.weddingDate || '',
        weddingTime: weddingInfo.weddingTime || '',
        subtitle: '결혼합니다',
      },
      styles: {
        textAlign: 'center',
        fontSize: 'large',
        fontWeight: 'bold',
        padding: 'large',
        margin: 'medium',
      },
    });

    // 장소 정보가 있으면 위치 블록 생성
    if (weddingInfo.venue || weddingInfo.address) {
      blocks.push({
        id: 'location-block',
        type: 'location',
        order: order++,
        isVisible: true,
        isEditing: false,
        data: {
          venueName: weddingInfo.venue || '',
          address: weddingInfo.address || '',
          detailAddress: weddingInfo.detailAddress || '',
          parkingInfo: weddingInfo.parkingInfo || '',
          transportInfo: weddingInfo.transportInfo || '',
        },
        styles: {
          textAlign: 'center',
          fontSize: 'medium',
          padding: 'medium',
          margin: 'medium',
        },
      });
    }

    // 연락처 정보가 있으면 연락처 블록 생성
    if (weddingInfo.groomContact || weddingInfo.brideContact) {
      blocks.push({
        id: 'contact-block',
        type: 'contact',
        order: order++,
        isVisible: true,
        isEditing: false,
        data: {
          title: '연락처',
          contacts: [
            ...(weddingInfo.groomContact
              ? [
                  {
                    name: weddingInfo.groomName || '신랑',
                    relation: '신랑',
                    phone: weddingInfo.groomContact,
                  },
                ]
              : []),
            ...(weddingInfo.brideContact
              ? [
                  {
                    name: weddingInfo.brideName || '신부',
                    relation: '신부',
                    phone: weddingInfo.brideContact,
                  },
                ]
              : []),
          ],
        },
        styles: {
          textAlign: 'center',
          fontSize: 'medium',
          padding: 'medium',
          margin: 'medium',
        },
      });
    }

    // RSVP 설정이 있으면 RSVP 블록 생성
    if (weddingInfo.rsvpEnabled) {
      blocks.push({
        id: 'rsvp-block',
        type: 'rsvp',
        order: order++,
        isVisible: true,
        isEditing: false,
        data: {
          title: '참석 의사 전달',
          description: '참석 여부를 알려주세요',
          dueDate: weddingInfo.rsvpDeadline || '',
          isEnabled: true,
        },
        styles: {
          textAlign: 'center',
          fontSize: 'medium',
          padding: 'medium',
          margin: 'medium',
        },
      });
    }
  }

  // 기존 elements를 블록으로 변환
  if (editorState.elements) {
    editorState.elements.forEach((element: any) => {
      if (element.type === 'text') {
        blocks.push({
          id: element.id,
          type: 'content',
          order: order++,
          isVisible: true,
          isEditing: false,
          data: {
            title: '',
            content: element.content || '',
            isRichText: false,
          },
          styles: {
            textAlign: element.style?.textAlign || 'center',
            fontSize: element.style?.fontSize === '18px' ? 'large' : 'medium',
            fontWeight:
              element.style?.fontWeight === 'bold' ? 'bold' : 'normal',
            textColor: element.style?.color || undefined,
            padding: 'medium',
            margin: 'medium',
          },
        });
      } else if (element.type === 'image') {
        blocks.push({
          id: element.id,
          type: 'image',
          order: order++,
          isVisible: true,
          isEditing: false,
          data: {
            imageUrl: element.content || '',
            alt: '이미지',
            caption: '',
            aspectRatio: 'landscape',
          },
          styles: {
            textAlign: 'center',
            padding: 'medium',
            margin: 'medium',
          },
        });
      }
    });
  }

  return blocks;
}

// AIDEV-NOTE: 블록 배열을 기존 editorState 형태로 변환
function convertBlocksToEditorState(blocks: Block[]): any {
  const elements: any[] = [];
  let weddingInfo: any = {};

  blocks.forEach((block) => {
    switch (block.type) {
      case 'header':
        weddingInfo = {
          ...weddingInfo,
          brideName: block.data.brideName,
          groomName: block.data.groomName,
          weddingDate: block.data.weddingDate,
          weddingTime: block.data.weddingTime,
        };
        break;

      case 'location':
        weddingInfo = {
          ...weddingInfo,
          venue: block.data.venueName,
          address: block.data.address,
          detailAddress: block.data.detailAddress,
          parkingInfo: block.data.parkingInfo,
          transportInfo: block.data.transportInfo,
        };
        break;

      case 'contact':
        const contacts = block.data.contacts || [];
        contacts.forEach((contact: any) => {
          if (contact.relation === '신랑') {
            weddingInfo.groomContact = contact.phone;
          } else if (contact.relation === '신부') {
            weddingInfo.brideContact = contact.phone;
          }
        });
        break;

      case 'rsvp':
        weddingInfo = {
          ...weddingInfo,
          rsvpEnabled: block.data.isEnabled,
          rsvpDeadline: block.data.dueDate,
        };
        break;

      case 'content':
        elements.push({
          id: block.id,
          type: 'text',
          content: block.data.content,
          position: { x: 50, y: 50 + block.order * 100 },
          size: { width: 200, height: 50 },
          style: {
            fontSize: block.styles?.fontSize === 'large' ? '18px' : '14px',
            fontFamily: 'Arial',
            color: block.styles?.textColor || '#000000',
            textAlign: block.styles?.textAlign || 'center',
            fontWeight: block.styles?.fontWeight || 'normal',
          },
        });
        break;

      case 'image':
        elements.push({
          id: block.id,
          type: 'image',
          content: block.data.imageUrl,
          position: { x: 50, y: 50 + block.order * 150 },
          size: { width: 200, height: 150 },
          style: {},
        });
        break;
    }
  });

  return {
    elements,
    weddingInfo,
  };
}

// AIDEV-NOTE: 블록에서 제목 추출
function extractTitleFromBlocks(blocks: Block[]): string {
  const headerBlock = blocks.find((block) => block.type === 'header');
  if (headerBlock) {
    const { brideName, groomName } = headerBlock.data;
    if (brideName && groomName) {
      return `${groomName} ♥ ${brideName}`;
    }
  }
  return '새 청첩장';
}

// AIDEV-NOTE: 템플릿을 기반으로 초기 블록 생성
function createInitialBlocksFromTemplate(template: Template): Block[] {
  const blocks: Block[] = [];
  let order = 0;

  // 1. 헤더 블록 (기본)
  blocks.push({
    id: 'header-block',
    type: 'header',
    order: order++,
    isVisible: true,
    isEditing: false,
    data: {
      brideName: '신부이름',
      groomName: '신랑이름',
      weddingDate: '',
      weddingTime: '',
      subtitle: '결혼합니다',
    },
    styles: {
      textAlign: 'center',
      fontSize: 'large',
      fontWeight: 'bold',
      padding: 'large',
      margin: 'medium',
    },
  });

  // 2. 콘텐츠 블록 (인사말)
  blocks.push({
    id: 'greeting-block',
    type: 'content',
    order: order++,
    isVisible: true,
    isEditing: false,
    data: {
      title: '결혼 인사',
      content:
        '평생 서로 사랑하며 행복하게 살겠습니다.\n부디 오셔서 축복해 주시기 바랍니다.',
      isRichText: false,
    },
    styles: {
      textAlign: 'center',
      fontSize: 'medium',
      padding: 'medium',
      margin: 'medium',
    },
  });

  // 3. 이미지 블록 (옵션)
  if (template.category !== 'minimal') {
    blocks.push({
      id: 'main-image-block',
      type: 'image',
      order: order++,
      isVisible: true,
      isEditing: false,
      data: {
        imageUrl: template.previewImageUrl || '',
        alt: '웨딩 사진',
        caption: '',
        aspectRatio: 'landscape',
      },
      styles: {
        textAlign: 'center',
        padding: 'medium',
        margin: 'medium',
      },
    });
  }

  // 4. 위치 블록
  blocks.push({
    id: 'location-block',
    type: 'location',
    order: order++,
    isVisible: true,
    isEditing: false,
    data: {
      venueName: '웨딩홀 이름',
      address: '주소를 입력해주세요',
      detailAddress: '',
      parkingInfo: '',
      transportInfo: '',
    },
    styles: {
      textAlign: 'center',
      fontSize: 'medium',
      padding: 'medium',
      margin: 'medium',
    },
  });

  // 5. 연락처 블록
  blocks.push({
    id: 'contact-block',
    type: 'contact',
    order: order++,
    isVisible: true,
    isEditing: false,
    data: {
      title: '연락처',
      contacts: [
        {
          name: '신랑이름',
          relation: '신랑',
          phone: '010-0000-0000',
        },
        {
          name: '신부이름',
          relation: '신부',
          phone: '010-0000-0000',
        },
      ],
    },
    styles: {
      textAlign: 'center',
      fontSize: 'medium',
      padding: 'medium',
      margin: 'medium',
    },
  });

  // 6. RSVP 블록
  blocks.push({
    id: 'rsvp-block',
    type: 'rsvp',
    order: order++,
    isVisible: true,
    isEditing: false,
    data: {
      title: '참석 의사 전달',
      description: '참석 여부를 알려주세요',
      dueDate: '',
      isEnabled: true,
    },
    styles: {
      textAlign: 'center',
      fontSize: 'medium',
      padding: 'medium',
      margin: 'medium',
    },
  });

  return blocks;
}
