import { ComponentType } from 'react';
import type { Block } from '@/types/blocks';

// AIDEV-NOTE: 블록 컴포넌트 통합 Export
export { BaseBlock } from './BaseBlock';
export { HeaderBlock } from './HeaderBlock';
export { ContentBlock } from './ContentBlock';
export { ImageBlock } from './ImageBlock';
export { ContactBlock } from './ContactBlock';
export { LocationBlock } from './LocationBlock';
export { RsvpBlock } from './RsvpBlock';

// AIDEV-NOTE: 블록 타입에 따른 동적 컴포넌트 렌더링
import { HeaderBlock } from './HeaderBlock';
import { ContentBlock } from './ContentBlock';
import { ImageBlock } from './ImageBlock';
import { ContactBlock } from './ContactBlock';
import { LocationBlock } from './LocationBlock';
import { RsvpBlock } from './RsvpBlock';

// AIDEV-NOTE: 블록 컴포넌트 매핑
export const blockComponentMap: Record<string, ComponentType<any>> = {
  header: HeaderBlock,
  content: ContentBlock,
  image: ImageBlock,
  contact: ContactBlock,
  location: LocationBlock,
  rsvp: RsvpBlock,
};

// AIDEV-NOTE: 블록 타입에 따른 컴포넌트 가져오기
export function getBlockComponent(blockType: string): ComponentType<any> | null {
  return blockComponentMap[blockType] || null;
}

// AIDEV-NOTE: 블록 렌더링 헬퍼 함수
import { createElement } from 'react';

export function renderBlock(block: Block, props: Record<string, unknown> = {}) {
  const Component = getBlockComponent(block.type);
  if (!Component) {
    console.warn(`Unknown block type: ${block.type}`);
    return null;
  }
  
  return createElement(Component, { key: block.id, block, ...props });
}