'use client';

// AIDEV-NOTE: 블록 설정 모달 - 고급 블록 설정 옵션
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Settings, Smartphone, Tablet, Monitor, Trash2 } from 'lucide-react';
import { BlockStyleEditor } from './BlockStyleEditor';
import type { Block, BlockStyles } from '@/types/blocks';

interface BlockSettingsProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function BlockSettings({ block, onUpdate, onDelete, disabled = false }: BlockSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localBlock, setLocalBlock] = useState(block);

  const handleSave = () => {
    onUpdate(localBlock);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalBlock(block);
    setIsOpen(false);
  };

  const handleStyleUpdate = (styles: BlockStyles) => {
    setLocalBlock(prev => ({ ...prev, styles }));
  };

  const handleVisibilityToggle = () => {
    setLocalBlock(prev => ({ ...prev, isVisible: !prev.isVisible }));
  };

  const handleDelete = () => {
    if (confirm('이 블록을 삭제하시겠습니까?')) {
      onDelete();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Settings className="w-4 h-4 mr-2" />
          설정
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            블록 설정 - {block.type}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">일반</TabsTrigger>
            <TabsTrigger value="style">스타일</TabsTrigger>
            <TabsTrigger value="responsive">반응형</TabsTrigger>
          </TabsList>
          
          {/* AIDEV-NOTE: 일반 설정 */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">기본 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">블록 표시</Label>
                    <div className="text-xs text-gray-500">
                      이 블록을 청첩장에 표시할지 설정합니다
                    </div>
                  </div>
                  <Switch
                    checked={localBlock.isVisible}
                    onCheckedChange={handleVisibilityToggle}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">블록 정보</Label>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>타입: {block.type}</div>
                    <div>ID: {block.id}</div>
                    <div>순서: {block.order + 1}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  위험 구역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">블록 삭제</Label>
                    <div className="text-xs text-gray-500">
                      이 블록을 완전히 제거합니다. 이 작업은 되돌릴 수 없습니다.
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* AIDEV-NOTE: 스타일 설정 */}
          <TabsContent value="style" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">디자인 설정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">현재 스타일</Label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">텍스트 색상:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: localBlock.styles?.textColor || '#000000' }}
                          />
                          <span>{localBlock.styles?.textColor || '기본'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">배경 색상:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: localBlock.styles?.backgroundColor || 'transparent' }}
                          />
                          <span>{localBlock.styles?.backgroundColor || '투명'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">폰트 크기:</span>
                        <span className="ml-2">{localBlock.styles?.fontSize || '보통'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">정렬:</span>
                        <span className="ml-2">{localBlock.styles?.textAlign || '가운데'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <BlockStyleEditor
                      block={localBlock}
                      onUpdateStyles={handleStyleUpdate}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* AIDEV-NOTE: 반응형 설정 */}
          <TabsContent value="responsive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">반응형 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  다양한 화면 크기에서 블록이 어떻게 표시될지 설정합니다.
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm font-medium">모바일에서 표시</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tablet className="w-4 h-4" />
                      <span className="text-sm font-medium">태블릿에서 표시</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span className="text-sm font-medium">데스크톱에서 표시</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Separator />
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    💡 반응형 팁
                  </div>
                  <div className="text-sm text-blue-700">
                    모바일 우선 디자인을 권장합니다. 대부분의 사용자가 모바일에서 청첩장을 확인합니다.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button onClick={handleSave}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}