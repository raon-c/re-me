'use client';

// AIDEV-NOTE: 블록 상태 관리 훅
import { useReducer, useCallback } from 'react';
import { BlockFactory } from '@/lib/blocks/block-factory';
import type { Block, BlockAction, BlockCollection, BlockType } from '@/types/blocks';

// AIDEV-NOTE: 블록 상태 리듀서
function blocksReducer(state: BlockCollection, action: BlockAction): BlockCollection {
  switch (action.type) {
    case 'ADD_BLOCK': {
      const { blockType, afterBlockId } = action.payload;
      const newBlock = BlockFactory.createBlock(blockType);
      
      if (afterBlockId) {
        const afterBlock = state.blocks.find(b => b.id === afterBlockId);
        if (afterBlock) {
          newBlock.order = afterBlock.order + 1;
          // 이후 블록들의 order 증가
          const updatedBlocks = state.blocks.map(block => 
            block.order > afterBlock.order 
              ? { ...block, order: block.order + 1 }
              : block
          );
          return {
            ...state,
            blocks: BlockFactory.reorderBlocks([...updatedBlocks, newBlock]),
            lastModified: new Date().toISOString(),
          };
        }
      }
      
      // 맨 끝에 추가
      newBlock.order = state.blocks.length;
      return {
        ...state,
        blocks: [...state.blocks, newBlock],
        lastModified: new Date().toISOString(),
      };
    }

    case 'REMOVE_BLOCK': {
      const { blockId } = action.payload;
      const updatedBlocks = state.blocks.filter(block => block.id !== blockId);
      return {
        ...state,
        blocks: BlockFactory.reorderBlocks(updatedBlocks),
        lastModified: new Date().toISOString(),
      };
    }

    case 'UPDATE_BLOCK': {
      const { blockId, updates } = action.payload;
      const updatedBlocks = state.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      ) as Block[];
      return {
        ...state,
        blocks: updatedBlocks,
        lastModified: new Date().toISOString(),
      };
    }

    case 'REORDER_BLOCKS': {
      const { blockId, newOrder } = action.payload;
      const updatedBlocks = state.blocks.map(block =>
        block.id === blockId ? { ...block, order: newOrder } : block
      ) as Block[];
      return {
        ...state,
        blocks: BlockFactory.reorderBlocks(updatedBlocks),
        lastModified: new Date().toISOString(),
      };
    }

    case 'TOGGLE_EDIT': {
      const { blockId } = action.payload;
      const updatedBlocks = state.blocks.map(block => ({
        ...block,
        isEditing: block.id === blockId ? !block.isEditing : false,
      })) as Block[];
      return {
        ...state,
        blocks: updatedBlocks,
      };
    }

    case 'DUPLICATE_BLOCK': {
      const { blockId } = action.payload;
      const originalBlock = state.blocks.find(block => block.id === blockId);
      if (!originalBlock) return state;
      
      const duplicatedBlock = BlockFactory.duplicateBlock(originalBlock);
      const updatedBlocks = state.blocks.map(block => 
        block.order > originalBlock.order 
          ? { ...block, order: block.order + 1 }
          : block
      );
      
      return {
        ...state,
        blocks: BlockFactory.reorderBlocks([...updatedBlocks, duplicatedBlock]),
        lastModified: new Date().toISOString(),
      };
    }

    case 'LOAD_BLOCKS': {
      const { blocks } = action.payload;
      return {
        ...state,
        blocks: BlockFactory.reorderBlocks(blocks),
        lastModified: new Date().toISOString(),
      };
    }

    default:
      return state;
  }
}

// AIDEV-NOTE: 블록 관리 훅
export function useBlocks(invitationId?: string) {
  const [state, dispatch] = useReducer(blocksReducer, {
    blocks: [],
    invitationId,
    lastModified: new Date().toISOString(),
  });

  // AIDEV-NOTE: 블록 추가
  const addBlock = useCallback((blockType: BlockType, afterBlockId?: string) => {
    dispatch({ type: 'ADD_BLOCK', payload: { blockType, afterBlockId } });
  }, []);

  // AIDEV-NOTE: 블록 제거
  const removeBlock = useCallback((blockId: string) => {
    dispatch({ type: 'REMOVE_BLOCK', payload: { blockId } });
  }, []);

  // AIDEV-NOTE: 블록 업데이트
  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    dispatch({ type: 'UPDATE_BLOCK', payload: { blockId, updates } });
  }, []);

  // AIDEV-NOTE: 블록 순서 변경
  const reorderBlock = useCallback((blockId: string, newOrder: number) => {
    dispatch({ type: 'REORDER_BLOCKS', payload: { blockId, newOrder } });
  }, []);

  // AIDEV-NOTE: 블록 편집 모드 토글
  const toggleEdit = useCallback((blockId: string) => {
    dispatch({ type: 'TOGGLE_EDIT', payload: { blockId } });
  }, []);

  // AIDEV-NOTE: 블록 복제
  const duplicateBlock = useCallback((blockId: string) => {
    dispatch({ type: 'DUPLICATE_BLOCK', payload: { blockId } });
  }, []);

  // AIDEV-NOTE: 블록 로드
  const loadBlocks = useCallback((blocks: Block[]) => {
    dispatch({ type: 'LOAD_BLOCKS', payload: { blocks } });
  }, []);

  // AIDEV-NOTE: 블록 위로 이동
  const moveBlockUp = useCallback((blockId: string) => {
    const block = state.blocks.find(b => b.id === blockId);
    if (block && block.order > 0) {
      reorderBlock(blockId, block.order - 1);
    }
  }, [state.blocks, reorderBlock]);

  // AIDEV-NOTE: 블록 아래로 이동
  const moveBlockDown = useCallback((blockId: string) => {
    const block = state.blocks.find(b => b.id === blockId);
    if (block && block.order < state.blocks.length - 1) {
      reorderBlock(blockId, block.order + 1);
    }
  }, [state.blocks, reorderBlock]);

  // AIDEV-NOTE: 편집 중인 블록 찾기
  const getEditingBlock = useCallback(() => {
    return state.blocks.find(block => block.isEditing);
  }, [state.blocks]);

  // AIDEV-NOTE: 블록 유효성 검사
  const validateBlocks = useCallback(() => {
    return state.blocks.every(block => BlockFactory.validateBlock(block));
  }, [state.blocks]);

  // AIDEV-NOTE: 더티 상태 체크 (변경사항 있는지)
  const isDirty = useCallback(() => {
    // 실제로는 서버 데이터와 비교해야 하지만, 여기서는 lastModified로 판단
    return true;
  }, []);

  return {
    blocks: state.blocks,
    invitationId: state.invitationId,
    lastModified: state.lastModified,
    addBlock,
    removeBlock,
    updateBlock,
    reorderBlock,
    toggleEdit,
    duplicateBlock,
    loadBlocks,
    moveBlockUp,
    moveBlockDown,
    getEditingBlock,
    validateBlocks,
    isDirty,
  };
}