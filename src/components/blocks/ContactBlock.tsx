'use client';

// AIDEV-NOTE: 연락처 블록 - 신랑신부 연락처 표시
import { useState } from 'react';
import { BaseBlock } from './BaseBlock';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone, Plus, X } from 'lucide-react';
import type { ContactBlock as ContactBlockType } from '@/types/blocks';

interface ContactBlockProps {
  block: ContactBlockType;
  isEditing?: boolean;
  isPreview?: boolean;
  onUpdate?: (updates: Partial<ContactBlockType>) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSettings?: () => void;
}

export function ContactBlock({
  block,
  isEditing = false,
  isPreview = false,
  onUpdate,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onSettings,
}: ContactBlockProps) {
  // AIDEV-NOTE: Hook은 항상 동일한 순서로 호출되어야 함
  const [localData, setLocalData] = useState(block.data);

  const handleSave = () => {
    onUpdate?.({
      ...block,
      data: localData,
      isEditing: false,
    });
  };

  const handleCancel = () => {
    setLocalData(block.data);
    onUpdate?.({
      ...block,
      isEditing: false,
    });
  };

  const addContact = () => {
    setLocalData(prev => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        { name: '', relation: '', phone: '' },
      ],
    }));
  };

  const removeContact = (index: number) => {
    setLocalData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const updateContact = (index: number, field: string, value: string) => {
    setLocalData(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      ),
    }));
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

  const makePhoneCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <BaseBlock
      block={block}
      isEditing={isEditing}
      isPreview={isPreview}
      onEdit={onEdit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      onSettings={onSettings}
    >
      {isEditing ? (
        <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">
            연락처 블록 편집
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              블록 제목
            </label>
            <Input
              value={localData.title || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="연락처"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                연락처 목록
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={addContact}
              >
                <Plus className="w-4 h-4 mr-1" />
                추가
              </Button>
            </div>

            {localData.contacts.map((contact, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="col-span-3">
                  <Input
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                    placeholder="이름"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    value={contact.relation}
                    onChange={(e) => updateContact(index, 'relation', e.target.value)}
                    placeholder="관계"
                  />
                </div>
                <div className="col-span-6">
                  <Input
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    placeholder="010-1234-5678"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                    className="text-red-600 hover:text-red-700 p-0 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {localData.contacts.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                연락처를 추가하세요
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button onClick={handleSave}>
              저장
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* AIDEV-NOTE: 블록 제목 표시 */}
          {block.data.title && (
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              {block.data.title}
            </h3>
          )}

          {/* AIDEV-NOTE: 연락처 목록 표시 */}
          {block.data.contacts.length > 0 ? (
            <div className="grid gap-3">
              {block.data.contacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {contact.name || '이름'}
                      </span>
                      {contact.relation && (
                        <span className="text-sm text-gray-500">
                          ({contact.relation})
                        </span>
                      )}
                    </div>
                    {contact.phone && (
                      <div className="text-sm text-gray-600 mt-1">
                        {formatPhoneNumber(contact.phone)}
                      </div>
                    )}
                  </div>
                  
                  {/* AIDEV-NOTE: 전화 걸기 버튼 */}
                  {contact.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => makePhoneCall(contact.phone)}
                      className="ml-2"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      전화
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Phone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <div>연락처 블록을 편집하여 연락처를 추가하세요</div>
            </div>
          )}
        </div>
      )}
    </BaseBlock>
  );
}