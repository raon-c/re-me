import type { Block } from '@/types/blocks';
import type { Template } from '@/types';
import type { WeddingInfoFormData } from '@/lib/wedding-validations';

/**
 * 템플릿을 기반으로 초기 블록 생성
 */
export function createInitialBlocksFromTemplate(template: Template): Block[] {
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

/**
 * 결혼식 정보를 기반으로 초기 블록 생성 (실제 데이터로 채움)
 */
export function createInitialBlocksFromWeddingInfo(
  weddingInfo: WeddingInfoFormData,
  template: Template
): Block[] {
  const blocks: Block[] = [];
  let order = 0;

  // 1. 헤더 블록 - 실제 신랑신부 이름과 날짜로 채움
  blocks.push({
    id: 'header-block',
    type: 'header',
    order: order++,
    isVisible: true,
    isEditing: false,
    data: {
      brideName: weddingInfo.brideName || '신부이름',
      groomName: weddingInfo.groomName || '신랑이름',
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

  // 2. 콘텐츠 블록 - 사용자 메시지가 있으면 사용, 없으면 기본 메시지
  blocks.push({
    id: 'greeting-block',
    type: 'content',
    order: order++,
    isVisible: true,
    isEditing: false,
    data: {
      title: '결혼 인사',
      content:
        weddingInfo.customMessage ||
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

  // 3. 이미지 블록 - 배경 이미지가 있으면 사용
  if (template.category !== 'minimal') {
    blocks.push({
      id: 'main-image-block',
      type: 'image',
      order: order++,
      isVisible: true,
      isEditing: false,
      data: {
        imageUrl:
          weddingInfo.backgroundImageUrl || template.previewImageUrl || '',
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

  // 4. 위치 블록 - 실제 예식장 정보로 채움
  blocks.push({
    id: 'location-block',
    type: 'location',
    order: order++,
    isVisible: true,
    isEditing: false,
    data: {
      venueName: weddingInfo.venueName || '웨딩홀 이름',
      address: weddingInfo.venueAddress || '주소를 입력해주세요',
      detailAddress: weddingInfo.venueHall || '',
      parkingInfo: weddingInfo.parkingInfo || '',
      transportInfo: '', // 교통 정보는 별도 필드가 없어서 비워둠
    },
    styles: {
      textAlign: 'center',
      fontSize: 'medium',
      padding: 'medium',
      margin: 'medium',
    },
  });

  // 5. 연락처 블록 - 실제 연락처 정보로 채움
  const contacts = [];
  if (weddingInfo.groomContact) {
    contacts.push({
      name: weddingInfo.groomName || '신랑이름',
      relation: '신랑',
      phone: weddingInfo.groomContact,
    });
  }
  if (weddingInfo.brideContact) {
    contacts.push({
      name: weddingInfo.brideName || '신부이름',
      relation: '신부',
      phone: weddingInfo.brideContact,
    });
  }

  // 연락처가 하나도 없으면 기본값 사용
  if (contacts.length === 0) {
    contacts.push(
      {
        name: weddingInfo.groomName || '신랑이름',
        relation: '신랑',
        phone: '010-0000-0000',
      },
      {
        name: weddingInfo.brideName || '신부이름',
        relation: '신부',
        phone: '010-0000-0000',
      }
    );
  }

  blocks.push({
    id: 'contact-block',
    type: 'contact',
    order: order++,
    isVisible: true,
    isEditing: false,
    data: {
      title: '연락처',
      contacts,
    },
    styles: {
      textAlign: 'center',
      fontSize: 'medium',
      padding: 'medium',
      margin: 'medium',
    },
  });

  // 6. 추가 정보 블록들 - 데이터가 있는 경우에만 추가
  if (weddingInfo.dressCode) {
    blocks.push({
      id: 'dresscode-block',
      type: 'content',
      order: order++,
      isVisible: true,
      isEditing: false,
      data: {
        title: '드레스코드',
        content: weddingInfo.dressCode,
        isRichText: false,
      },
      styles: {
        textAlign: 'center',
        fontSize: 'medium',
        padding: 'medium',
        margin: 'medium',
      },
    });
  }

  if (weddingInfo.mealInfo) {
    blocks.push({
      id: 'meal-block',
      type: 'content',
      order: order++,
      isVisible: true,
      isEditing: false,
      data: {
        title: '식사 안내',
        content: weddingInfo.mealInfo,
        isRichText: false,
      },
      styles: {
        textAlign: 'center',
        fontSize: 'medium',
        padding: 'medium',
        margin: 'medium',
      },
    });
  }

  if (weddingInfo.specialNotes) {
    blocks.push({
      id: 'notes-block',
      type: 'content',
      order: order++,
      isVisible: true,
      isEditing: false,
      data: {
        title: '특별 안내사항',
        content: weddingInfo.specialNotes,
        isRichText: false,
      },
      styles: {
        textAlign: 'center',
        fontSize: 'medium',
        padding: 'medium',
        margin: 'medium',
      },
    });
  }

  // 7. RSVP 블록 - RSVP 설정 반영
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
        isEnabled: weddingInfo.rsvpEnabled,
      },
      styles: {
        textAlign: 'center',
        fontSize: 'medium',
        padding: 'medium',
        margin: 'medium',
      },
    });
  }

  return blocks;
}
