'use client';

// AIDEV-NOTE: 블록 스타일 편집기 - 색상, 폰트, 정렬 등 스타일 옵션
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Palette, Type, AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import type { Block, BlockStyles } from '@/types/blocks';

interface BlockStyleEditorProps {
  block: Block;
  onUpdateStyles: (styles: BlockStyles) => void;
  disabled?: boolean;
}

export function BlockStyleEditor({ block, onUpdateStyles, disabled = false }: BlockStyleEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localStyles, setLocalStyles] = useState<BlockStyles>(block.styles || {});

  const handleSave = () => {
    onUpdateStyles(localStyles);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultStyles: BlockStyles = {
      textAlign: 'center',
      fontSize: 'medium',
      fontWeight: 'normal',
      padding: 'medium',
      margin: 'medium',
    };
    setLocalStyles(defaultStyles);
  };

  const colorOptions = [
    { value: '#000000', label: '검정', color: '#000000' },
    { value: '#374151', label: '회색', color: '#374151' },
    { value: '#7C2D12', label: '갈색', color: '#7C2D12' },
    { value: '#DC2626', label: '빨강', color: '#DC2626' },
    { value: '#EA580C', label: '주황', color: '#EA580C' },
    { value: '#D97706', label: '노랑', color: '#D97706' },
    { value: '#65A30D', label: '초록', color: '#65A30D' },
    { value: '#0891B2', label: '파랑', color: '#0891B2' },
    { value: '#7C3AED', label: '보라', color: '#7C3AED' },
    { value: '#DB2777', label: '핑크', color: '#DB2777' },
  ];

  const backgroundColorOptions = [
    { value: 'transparent', label: '투명', color: 'transparent' },
    { value: '#FFFFFF', label: '흰색', color: '#FFFFFF' },
    { value: '#F9FAFB', label: '연한 회색', color: '#F9FAFB' },
    { value: '#FEF3C7', label: '연한 노랑', color: '#FEF3C7' },
    { value: '#FECACA', label: '연한 빨강', color: '#FECACA' },
    { value: '#BFDBFE', label: '연한 파랑', color: '#BFDBFE' },
    { value: '#C7D2FE', label: '연한 보라', color: '#C7D2FE' },
    { value: '#FBCFE8', label: '연한 핑크', color: '#FBCFE8' },
    { value: '#BBF7D0', label: '연한 초록', color: '#BBF7D0' },
  ];

  const ColorPicker = ({ 
    value, 
    onChange, 
    options, 
    label 
  }: {
    value: string | undefined;
    onChange: (value: string) => void;
    options: typeof colorOptions;
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-5 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              w-8 h-8 rounded border-2 flex items-center justify-center
              ${value === option.value ? 'border-blue-500' : 'border-gray-200'}
              ${option.value === 'transparent' ? 'bg-gradient-to-tr from-white to-gray-100' : ''}
            `}
            style={{ 
              backgroundColor: option.value === 'transparent' ? 'transparent' : option.color 
            }}
            title={option.label}
          >
            {value === option.value && (
              <div className="w-2 h-2 rounded-full bg-white border border-gray-300" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Settings className="w-4 h-4 mr-2" />
          스타일
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            블록 스타일 편집
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* AIDEV-NOTE: 색상 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <h3 className="font-medium">색상</h3>
            </div>
            
            <ColorPicker
              value={localStyles.textColor}
              onChange={(value) => setLocalStyles(prev => ({ ...prev, textColor: value }))}
              options={colorOptions}
              label="텍스트 색상"
            />
            
            <ColorPicker
              value={localStyles.backgroundColor}
              onChange={(value) => setLocalStyles(prev => ({ ...prev, backgroundColor: value }))}
              options={backgroundColorOptions}
              label="배경 색상"
            />
          </div>

          <Separator />

          {/* AIDEV-NOTE: 텍스트 스타일 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <h3 className="font-medium">텍스트</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">글자 크기</Label>
                <Select
                  value={localStyles.fontSize || 'medium'}
                  onValueChange={(value) => setLocalStyles(prev => ({ 
                    ...prev, 
                    fontSize: value as 'small' | 'medium' | 'large' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">작게</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="large">크게</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">글자 굵기</Label>
                <Select
                  value={localStyles.fontWeight || 'normal'}
                  onValueChange={(value) => setLocalStyles(prev => ({ 
                    ...prev, 
                    fontWeight: value as 'normal' | 'bold' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">보통</SelectItem>
                    <SelectItem value="bold">굵게</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">정렬</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Button
                    variant={localStyles.textAlign === 'left' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLocalStyles(prev => ({ ...prev, textAlign: 'left' }))}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={localStyles.textAlign === 'center' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLocalStyles(prev => ({ ...prev, textAlign: 'center' }))}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={localStyles.textAlign === 'right' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLocalStyles(prev => ({ ...prev, textAlign: 'right' }))}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* AIDEV-NOTE: 간격 설정 */}
          <div className="space-y-4">
            <h3 className="font-medium">간격</h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">내부 여백</Label>
                <Select
                  value={localStyles.padding || 'medium'}
                  onValueChange={(value) => setLocalStyles(prev => ({ 
                    ...prev, 
                    padding: value as 'small' | 'medium' | 'large' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">좁게</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="large">넓게</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">외부 여백</Label>
                <Select
                  value={localStyles.margin || 'medium'}
                  onValueChange={(value) => setLocalStyles(prev => ({ 
                    ...prev, 
                    margin: value as 'small' | 'medium' | 'large' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">좁게</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="large">넓게</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* AIDEV-NOTE: 액션 버튼 */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              초기화
            </Button>
            <Button onClick={handleSave} className="flex-1">
              적용
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}