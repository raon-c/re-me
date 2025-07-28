'use client';

import { Block } from '@/types/blocks';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  FileText,
  Image,
  Users,
  MapPin,
  Calendar,
  MessageSquare,
} from 'lucide-react';

interface EditorTopInfoProps {
  selectedBlock: Block | null;
  totalBlocks: number;
  isPreviewMode: boolean;
}

const getBlockIcon = (type: string) => {
  switch (type) {
    case 'header':
      return <Calendar className="w-4 h-4" />;
    case 'content':
      return <FileText className="w-4 h-4" />;
    case 'image':
      return <Image className="w-4 h-4" />;
    case 'contact':
      return <Users className="w-4 h-4" />;
    case 'location':
      return <MapPin className="w-4 h-4" />;
    case 'rsvp':
      return <MessageSquare className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getBlockTypeLabel = (type: string) => {
  switch (type) {
    case 'header':
      return '헤더';
    case 'content':
      return '텍스트';
    case 'image':
      return '이미지';
    case 'contact':
      return '연락처';
    case 'location':
      return '위치';
    case 'rsvp':
      return 'RSVP';
    default:
      return '알 수 없음';
  }
};

const getBlockPreview = (block: Block) => {
  switch (block.type) {
    case 'header':
      const headerData = block.data as {
        brideName: string;
        groomName: string;
        weddingDate: string;
      };
      return `${headerData.groomName} ♥ ${headerData.brideName} - ${headerData.weddingDate}`;
    case 'content':
      const contentData = block.data as { title?: string; content: string };
      return (
        contentData.title ||
        contentData.content.substring(0, 50) +
          (contentData.content.length > 50 ? '...' : '')
      );
    case 'image':
      const imageData = block.data as { alt?: string; caption?: string };
      return imageData.caption || imageData.alt || '이미지';
    case 'contact':
      const contactData = block.data as {
        title?: string;
        contacts: Array<{ name: string }>;
      };
      return contactData.title || `연락처 ${contactData.contacts.length}개`;
    case 'location':
      const locationData = block.data as { venueName: string; address: string };
      return `${locationData.venueName} - ${locationData.address}`;
    case 'rsvp':
      const rsvpData = block.data as { title?: string; description?: string };
      return rsvpData.title || rsvpData.description || 'RSVP';
    default:
      return '내용 없음';
  }
};

export function EditorTopInfo({
  selectedBlock,
  totalBlocks,
  isPreviewMode,
}: EditorTopInfoProps) {
  return (
    <Card className="p-4 mb-4 bg-gray-50 border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              총 {totalBlocks}개 블록
            </Badge>
            {isPreviewMode && (
              <Badge variant="secondary" className="text-sm">
                미리보기 모드
              </Badge>
            )}
          </div>

          {selectedBlock && (
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-300">
              <div className="flex items-center space-x-2">
                {getBlockIcon(selectedBlock.type)}
                <span className="font-medium text-gray-700">
                  {getBlockTypeLabel(selectedBlock.type)}
                </span>
                <Badge variant="default" className="text-xs">
                  #{selectedBlock.order + 1}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 max-w-md truncate">
                {getBlockPreview(selectedBlock)}
              </div>
            </div>
          )}
        </div>

        {!selectedBlock && !isPreviewMode && (
          <div className="text-sm text-gray-500">
            블록을 선택하여 편집하세요
          </div>
        )}
      </div>
    </Card>
  );
}
