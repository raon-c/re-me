'use client';

// AIDEV-NOTE: 블록 팔레트 - 사용 가능한 블록 목록 및 추가 인터페이스
import { useState } from 'react';
import { BlockFactory } from '@/lib/blocks/block-factory';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BlockType } from '@/types/blocks';

interface BlockPaletteProps {
  onAddBlock: (blockType: BlockType) => void;
  disabled?: boolean;
}

export function BlockPalette({ onAddBlock, disabled = false }: BlockPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);

  const paletteItems = BlockFactory.getBlockPalette();

  // AIDEV-NOTE: 검색 및 필터링 로직
  const filteredItems = paletteItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddBlock = (blockType: BlockType) => {
    onAddBlock(blockType);
    setIsOpen(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'bg-red-100 text-red-800';
      case 'content':
        return 'bg-blue-100 text-blue-800';
      case 'media':
        return 'bg-green-100 text-green-800';
      case 'contact':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'essential':
        return '필수';
      case 'content':
        return '콘텐츠';
      case 'media':
        return '미디어';
      case 'contact':
        return '연락처';
      default:
        return '기타';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button disabled={disabled} className="gap-2">
          <Plus className="w-4 h-4" />
          블록 추가
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>블록 추가</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {/* AIDEV-NOTE: 검색 및 필터 */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="블록 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                <SelectItem value="essential">필수 블록</SelectItem>
                <SelectItem value="content">콘텐츠 블록</SelectItem>
                <SelectItem value="media">미디어 블록</SelectItem>
                <SelectItem value="contact">연락처 블록</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AIDEV-NOTE: 블록 목록 */}
          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <Card key={item.type} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div 
                      className="flex items-start gap-3"
                      onClick={() => handleAddBlock(item.type)}
                    >
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                            {getCategoryName(item.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-lg mb-2">😔</div>
                <div className="text-sm">
                  검색 결과가 없습니다
                </div>
              </div>
            )}
          </div>

          {/* AIDEV-NOTE: 카테고리별 빠른 추가 버튼 */}
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-700 mb-3">빠른 추가</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBlock('header')}
                className="justify-start gap-2"
              >
                <span>👰</span>
                헤더
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBlock('content')}
                className="justify-start gap-2"
              >
                <span>📝</span>
                텍스트
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBlock('image')}
                className="justify-start gap-2"
              >
                <span>📷</span>
                이미지
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBlock('rsvp')}
                className="justify-start gap-2"
              >
                <span>✅</span>
                RSVP
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}