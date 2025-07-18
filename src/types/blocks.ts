// AIDEV-NOTE: 모듈식 블록 시스템을 위한 타입 정의
export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
  styles?: BlockStyles;
  isVisible?: boolean;
  isEditing?: boolean;
}

export type BlockType = 
  | 'header'
  | 'content'
  | 'image'
  | 'contact'
  | 'location'
  | 'rsvp';

export interface BlockStyles {
  textColor?: string;
  backgroundColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  padding?: 'small' | 'medium' | 'large';
  margin?: 'small' | 'medium' | 'large';
}

// AIDEV-NOTE: 각 블록 타입별 데이터 구조
export interface HeaderBlock extends BaseBlock {
  type: 'header';
  data: {
    brideName: string;
    groomName: string;
    weddingDate: string;
    weddingTime: string;
    subtitle?: string;
  };
}

export interface ContentBlock extends BaseBlock {
  type: 'content';
  data: {
    title?: string;
    content: string;
    isRichText?: boolean;
  };
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  data: {
    imageUrl: string;
    alt?: string;
    caption?: string;
    aspectRatio?: 'square' | 'portrait' | 'landscape';
  };
}

export interface ContactBlock extends BaseBlock {
  type: 'contact';
  data: {
    title?: string;
    contacts: Array<{
      name: string;
      relation: string;
      phone: string;
    }>;
  };
}

export interface LocationBlock extends BaseBlock {
  type: 'location';
  data: {
    venueName: string;
    address: string;
    detailAddress?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    parkingInfo?: string;
    transportInfo?: string;
  };
}

export interface RsvpBlock extends BaseBlock {
  type: 'rsvp';
  data: {
    title?: string;
    description?: string;
    dueDate?: string;
    isEnabled: boolean;
  };
}

// AIDEV-NOTE: 통합 블록 타입 (Union Type)
export type Block = 
  | HeaderBlock
  | ContentBlock
  | ImageBlock
  | ContactBlock
  | LocationBlock
  | RsvpBlock;

// AIDEV-NOTE: 블록 컬렉션 상태 관리
export interface BlockCollection {
  blocks: Block[];
  invitationId?: string;
  templateId?: string;
  lastModified: string;
}

// AIDEV-NOTE: 블록 액션 타입
export type BlockAction = 
  | { type: 'ADD_BLOCK'; payload: { blockType: BlockType; afterBlockId?: string } }
  | { type: 'REMOVE_BLOCK'; payload: { blockId: string } }
  | { type: 'UPDATE_BLOCK'; payload: { blockId: string; updates: Partial<Block> } }
  | { type: 'REORDER_BLOCKS'; payload: { blockId: string; newOrder: number } }
  | { type: 'TOGGLE_EDIT'; payload: { blockId: string } }
  | { type: 'DUPLICATE_BLOCK'; payload: { blockId: string } }
  | { type: 'LOAD_BLOCKS'; payload: { blocks: Block[] } };

// AIDEV-NOTE: 블록 편집 컨텍스트
export interface BlockEditContext {
  collection: BlockCollection;
  selectedBlockId?: string;
  isPreviewMode: boolean;
  isDirty: boolean;
  dispatch: (action: BlockAction) => void;
  saveBlocks: () => Promise<void>;
  loadBlocks: (invitationId: string) => Promise<void>;
}

// AIDEV-NOTE: 블록 팔레트 아이템
export interface BlockPaletteItem {
  type: BlockType;
  name: string;
  description: string;
  icon: string;
  category: 'essential' | 'content' | 'media' | 'contact';
  defaultData: Record<string, unknown>;
}