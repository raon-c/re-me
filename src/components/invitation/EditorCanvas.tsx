'use client';

import React, { useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
// import { CSS } from '@dnd-kit/utilities';
import { EditorElement } from '@/types/editor';
import { cn } from '@/lib/utils';

interface EditorCanvasProps {
  elements: EditorElement[];
  selectedElementId: string | null;
  onElementUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onElementSelect: (id: string | null) => void;
  onAddElement: (
    type: EditorElement['type'],
    position: { x: number; y: number }
  ) => void;
  className?: string;
}

// AIDEV-NOTE: Draggable element component for invitation editor canvas
function DraggableElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
}: {
  element: EditorElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<EditorElement>) => void;
}) {
  const handleContentChange = (content: string) => {
    onUpdate({ content });
  };

  const elementStyle = {
    position: 'absolute' as const,
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
    fontSize: element.style.fontSize,
    fontFamily: element.style.fontFamily,
    color: element.style.color,
    textAlign: element.style.textAlign,
    fontWeight: element.style.fontWeight,
    fontStyle: element.style.fontStyle,
  };

  return (
    <div
      id={element.id}
      className={cn(
        'cursor-pointer border-2 border-transparent transition-colors',
        isSelected && 'border-blue-500 border-dashed',
        'hover:border-gray-300'
      )}
      style={elementStyle}
      onClick={onSelect}
    >
      {element.type === 'text' && (
        <div
          contentEditable
          suppressContentEditableWarning
          className="outline-none w-full h-full"
          onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {element.content}
        </div>
      )}

      {element.type === 'image' && (
        <div className="w-full h-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500">
          {element.content ? (
            <img
              src={element.content}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm">이미지</span>
          )}
        </div>
      )}

      {element.type === 'divider' && (
        <div className="w-full h-0.5 bg-gray-400" />
      )}
    </div>
  );
}

export function EditorCanvas({
  elements,
  selectedElementId,
  onElementUpdate,
  onElementSelect,
  onAddElement,
  className,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // AIDEV-NOTE: Configure sensors for both mouse and touch interactions
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 8,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (delta.x === 0 && delta.y === 0) {
      setActiveId(null);
      return;
    }

    const element = elements.find((el) => el.id === active.id);
    if (element) {
      onElementUpdate(element.id, {
        position: {
          x: element.position.x + delta.x,
          y: element.position.y + delta.y,
        },
      });
    }

    setActiveId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onElementSelect(null);
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onAddElement('text', { x, y });
    }
  };

  const activeElement = elements.find((el) => el.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={canvasRef}
        className={cn(
          'relative bg-white border border-gray-200 overflow-hidden',
          'min-h-[600px] w-full max-w-md mx-auto',
          'shadow-lg rounded-lg',
          className
        )}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        style={{ aspectRatio: '3/4' }}
      >
        {elements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            isSelected={element.id === selectedElementId}
            onSelect={() => onElementSelect(element.id)}
            onUpdate={(updates) => onElementUpdate(element.id, updates)}
          />
        ))}

        <DragOverlay>
          {activeElement && (
            <div
              style={{
                width: activeElement.size.width,
                height: activeElement.size.height,
                fontSize: activeElement.style.fontSize,
                fontFamily: activeElement.style.fontFamily,
                color: activeElement.style.color,
                textAlign: activeElement.style.textAlign,
                fontWeight: activeElement.style.fontWeight,
                fontStyle: activeElement.style.fontStyle,
                opacity: 0.8,
              }}
              className="bg-white border border-gray-300 shadow-lg"
            >
              {activeElement.content}
            </div>
          )}
        </DragOverlay>

        {/* Canvas instructions */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-center p-4">
            <div>
              <p className="text-lg mb-2">청첩장 편집 캔버스</p>
              <p className="text-sm">더블클릭하여 텍스트를 추가하거나</p>
              <p className="text-sm">툴바에서 요소를 추가하세요</p>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
