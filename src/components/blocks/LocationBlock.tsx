'use client';

// AIDEV-NOTE: 위치 블록 - 예식장 위치 및 교통 정보 표시
import { useState } from 'react';
import { BaseBlock } from './BaseBlock';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Car, Bus } from 'lucide-react';
import type { LocationBlock as LocationBlockType } from '@/types/blocks';

interface LocationBlockProps {
  block: LocationBlockType;
  isEditing?: boolean;
  isPreview?: boolean;
  onUpdate?: (updates: Partial<LocationBlockType>) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSettings?: () => void;
}

export function LocationBlock({
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
}: LocationBlockProps) {
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

  const openMap = () => {
    const { venueName, address, coordinates } = block.data;
    
    if (coordinates) {
      // AIDEV-NOTE: 좌표가 있는 경우 좌표로 지도 열기
      window.open(`https://map.kakao.com/link/map/${venueName},${coordinates.lat},${coordinates.lng}`);
    } else if (address) {
      // AIDEV-NOTE: 주소로 지도 열기
      window.open(`https://map.kakao.com/link/search/${encodeURIComponent(address)}`);
    }
  };

  const getDirections = () => {
    const { venueName, address, coordinates } = block.data;
    
    if (coordinates) {
      window.open(`https://map.kakao.com/link/to/${venueName},${coordinates.lat},${coordinates.lng}`);
    } else if (address) {
      window.open(`https://map.kakao.com/link/to/${encodeURIComponent(venueName)},${encodeURIComponent(address)}`);
    }
  };

  const copyAddress = () => {
    const fullAddress = `${block.data.address}${block.data.detailAddress ? ' ' + block.data.detailAddress : ''}`;
    navigator.clipboard.writeText(fullAddress);
    // AIDEV-NOTE: 토스트 메시지 표시 (실제 구현 시 toast 라이브러리 사용)
    alert('주소가 복사되었습니다.');
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
            위치 블록 편집
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              예식장 이름
            </label>
            <Input
              value={localData.venueName}
              onChange={(e) => setLocalData(prev => ({ ...prev, venueName: e.target.value }))}
              placeholder="예식장 이름"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              주소
            </label>
            <Input
              value={localData.address}
              onChange={(e) => setLocalData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="서울시 강남구 테헤란로 123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상세 주소 (선택사항)
            </label>
            <Input
              value={localData.detailAddress || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, detailAddress: e.target.value }))}
              placeholder="3층 그랜드홀"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                위도 (선택사항)
              </label>
              <Input
                type="number"
                step="any"
                value={localData.coordinates?.lat || ''}
                onChange={(e) => setLocalData(prev => ({ 
                  ...prev, 
                  coordinates: { 
                    ...prev.coordinates,
                    lat: parseFloat(e.target.value) || 0,
                    lng: prev.coordinates?.lng || 0
                  }
                }))}
                placeholder="37.5665"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                경도 (선택사항)
              </label>
              <Input
                type="number"
                step="any"
                value={localData.coordinates?.lng || ''}
                onChange={(e) => setLocalData(prev => ({ 
                  ...prev, 
                  coordinates: { 
                    ...prev.coordinates,
                    lat: prev.coordinates?.lat || 0,
                    lng: parseFloat(e.target.value) || 0
                  }
                }))}
                placeholder="126.9780"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              주차 안내
            </label>
            <Textarea
              value={localData.parkingInfo || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, parkingInfo: e.target.value }))}
              placeholder="주차 가능, 발렛 서비스 이용 가능"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              교통 안내
            </label>
            <Textarea
              value={localData.transportInfo || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, transportInfo: e.target.value }))}
              placeholder="지하철 2호선 강남역 3번 출구 도보 5분"
              rows={3}
            />
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
          {/* AIDEV-NOTE: 예식장 정보 표시 */}
          {block.data.venueName && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {block.data.venueName}
              </h3>
              
              {/* AIDEV-NOTE: 주소 표시 */}
              <div className="text-gray-600 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{block.data.address}</span>
                </div>
                {block.data.detailAddress && (
                  <div className="text-sm text-gray-500 mt-1">
                    {block.data.detailAddress}
                  </div>
                )}
              </div>

              {/* AIDEV-NOTE: 지도 및 길찾기 버튼 */}
              <div className="flex gap-2 justify-center mb-4">
                <Button variant="outline" size="sm" onClick={openMap}>
                  <MapPin className="w-4 h-4 mr-1" />
                  지도 보기
                </Button>
                <Button variant="outline" size="sm" onClick={getDirections}>
                  <Navigation className="w-4 h-4 mr-1" />
                  길찾기
                </Button>
                <Button variant="outline" size="sm" onClick={copyAddress}>
                  주소 복사
                </Button>
              </div>
            </div>
          )}

          {/* AIDEV-NOTE: 추가 정보 표시 */}
          <div className="space-y-3">
            {/* AIDEV-NOTE: 주차 안내 */}
            {block.data.parkingInfo && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Car className="w-4 h-4" />
                  주차 안내
                </div>
                <div className="text-sm text-gray-600">
                  {block.data.parkingInfo}
                </div>
              </div>
            )}

            {/* AIDEV-NOTE: 교통 안내 */}
            {block.data.transportInfo && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Bus className="w-4 h-4" />
                  교통 안내
                </div>
                <div className="text-sm text-gray-600">
                  {block.data.transportInfo}
                </div>
              </div>
            )}
          </div>

          {/* AIDEV-NOTE: 빈 상태 표시 */}
          {!block.data.venueName && !block.data.address && (
            <div className="text-gray-400 text-sm text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <div>위치 블록을 편집하여 예식장 정보를 추가하세요</div>
            </div>
          )}
        </div>
      )}
    </BaseBlock>
  );
}