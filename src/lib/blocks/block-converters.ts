import type { Block } from '@/types/blocks';

/**
 * 기존 editorState를 블록 배열로 변환
 */
export function convertEditorStateToBlocks(editorState: any): Block[] {
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

/**
 * 블록 배열을 기존 editorState 형태로 변환
 */
export function convertBlocksToEditorState(blocks: Block[]): any {
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

/**
 * 블록에서 제목 추출
 */
export function extractTitleFromBlocks(blocks: Block[]): string {
  const headerBlock = blocks.find((block) => block.type === 'header');
  if (headerBlock) {
    const { brideName, groomName } = headerBlock.data;
    if (brideName && groomName) {
      return `${groomName} ♥ ${brideName}`;
    }
  }
  return '새 청첩장';
}
