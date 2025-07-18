// AIDEV-NOTE: 블록 생성 및 관리를 위한 팩토리 클래스
import { nanoid } from 'nanoid';
import type { 
  Block, 
  BlockType, 
  HeaderBlock, 
  ContentBlock, 
  ImageBlock, 
  ContactBlock, 
  LocationBlock, 
  RsvpBlock,
  BlockPaletteItem 
} from '@/types/blocks';

export class BlockFactory {
  // AIDEV-NOTE: 새로운 블록 인스턴스 생성
  static createBlock(type: BlockType, order: number = 0): Block {
    const baseBlock = {
      id: nanoid(),
      type,
      order,
      isVisible: true,
      isEditing: false,
      styles: {
        textAlign: 'center' as const,
        fontSize: 'medium' as const,
        padding: 'medium' as const,
        margin: 'medium' as const,
      },
    };

    switch (type) {
      case 'header':
        return {
          ...baseBlock,
          type: 'header',
          data: {
            brideName: '',
            groomName: '',
            weddingDate: '',
            weddingTime: '',
            subtitle: '결혼합니다',
          },
        } as HeaderBlock;

      case 'content':
        return {
          ...baseBlock,
          type: 'content',
          data: {
            title: '',
            content: '내용을 입력하세요',
            isRichText: false,
          },
        } as ContentBlock;

      case 'image':
        return {
          ...baseBlock,
          type: 'image',
          data: {
            imageUrl: '',
            alt: '',
            caption: '',
            aspectRatio: 'landscape',
          },
        } as ImageBlock;

      case 'contact':
        return {
          ...baseBlock,
          type: 'contact',
          data: {
            title: '연락처',
            contacts: [
              {
                name: '신랑',
                relation: '신랑',
                phone: '',
              },
              {
                name: '신부',
                relation: '신부',
                phone: '',
              },
            ],
          },
        } as ContactBlock;

      case 'location':
        return {
          ...baseBlock,
          type: 'location',
          data: {
            venueName: '',
            address: '',
            detailAddress: '',
            parkingInfo: '',
            transportInfo: '',
          },
        } as LocationBlock;

      case 'rsvp':
        return {
          ...baseBlock,
          type: 'rsvp',
          data: {
            title: '참석 의사 전달',
            description: '참석 여부를 알려주세요',
            isEnabled: true,
          },
        } as RsvpBlock;

      default:
        throw new Error(`Unknown block type: ${type}`);
    }
  }

  // AIDEV-NOTE: 블록 복사 생성
  static duplicateBlock(block: Block): Block {
    const newBlock = structuredClone(block);
    newBlock.id = nanoid();
    newBlock.order = block.order + 1;
    newBlock.isEditing = false;
    return newBlock;
  }

  // AIDEV-NOTE: 블록 팔레트 아이템 정의
  static getBlockPalette(): BlockPaletteItem[] {
    return [
      {
        type: 'header',
        name: '헤더',
        description: '신랑신부 이름과 날짜를 표시합니다',
        icon: '👰',
        category: 'essential',
        defaultData: {
          brideName: '신부',
          groomName: '신랑',
          weddingDate: '',
          weddingTime: '',
          subtitle: '결혼합니다',
        },
      },
      {
        type: 'content',
        name: '텍스트',
        description: '자유로운 텍스트 내용을 입력합니다',
        icon: '📝',
        category: 'content',
        defaultData: {
          title: '',
          content: '내용을 입력하세요',
          isRichText: false,
        },
      },
      {
        type: 'image',
        name: '이미지',
        description: '사진을 업로드하고 표시합니다',
        icon: '📷',
        category: 'media',
        defaultData: {
          imageUrl: '',
          alt: '',
          caption: '',
          aspectRatio: 'landscape',
        },
      },
      {
        type: 'contact',
        name: '연락처',
        description: '신랑신부 연락처를 표시합니다',
        icon: '📞',
        category: 'contact',
        defaultData: {
          title: '연락처',
          contacts: [
            { name: '신랑', relation: '신랑', phone: '' },
            { name: '신부', relation: '신부', phone: '' },
          ],
        },
      },
      {
        type: 'location',
        name: '장소',
        description: '예식장 위치와 교통정보를 표시합니다',
        icon: '📍',
        category: 'contact',
        defaultData: {
          venueName: '',
          address: '',
          detailAddress: '',
          parkingInfo: '',
          transportInfo: '',
        },
      },
      {
        type: 'rsvp',
        name: '참석 확인',
        description: '하객들의 참석 의사를 확인합니다',
        icon: '✅',
        category: 'essential',
        defaultData: {
          title: '참석 의사 전달',
          description: '참석 여부를 알려주세요',
          isEnabled: true,
        },
      },
    ];
  }

  // AIDEV-NOTE: 블록 검증 함수
  static validateBlock(block: Block): boolean {
    if (!block.id || !block.type) return false;
    
    switch (block.type) {
      case 'header':
        return !!(block as HeaderBlock).data;
      case 'content':
        return !!(block as ContentBlock).data?.content;
      case 'image':
        return !!(block as ImageBlock).data?.imageUrl;
      case 'contact':
        return !!(block as ContactBlock).data?.contacts?.length;
      case 'location':
        return !!(block as LocationBlock).data?.venueName;
      case 'rsvp':
        return !!(block as RsvpBlock).data;
      default:
        return false;
    }
  }

  // AIDEV-NOTE: 블록 순서 재정렬
  static reorderBlocks(blocks: Block[]): Block[] {
    return blocks
      .sort((a, b) => a.order - b.order)
      .map((block, index) => ({
        ...block,
        order: index,
      })) as Block[];
  }
}