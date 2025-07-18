'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { MessageCircle, Calendar, AlertCircle, Info } from 'lucide-react';

interface RsvpSettingsProps {
  rsvpEnabled: boolean;
  rsvpDeadline: string;
  onRsvpEnabledChange: (enabled: boolean) => void;
  onRsvpDeadlineChange: (deadline: string) => void;
  weddingDate?: string; // Added to validate deadline against wedding date
  className?: string;
}

export function RsvpSettings({
  rsvpEnabled,
  rsvpDeadline,
  onRsvpEnabledChange,
  onRsvpDeadlineChange,
  weddingDate,
  className,
}: RsvpSettingsProps) {
  // Calculate minimum date (today) and maximum date (wedding date)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  // AIDEV-NOTE: RSVP deadline should not exceed wedding date
  const maxDate = weddingDate || '2030-12-31'; // Default max date if no wedding date set
  
  // Validation states
  const isDeadlineAfterToday = rsvpDeadline && new Date(rsvpDeadline) >= today;
  const isDeadlineBeforeWedding = !weddingDate || !rsvpDeadline || new Date(rsvpDeadline) <= new Date(weddingDate);
  const isValidDeadline = isDeadlineAfterToday && isDeadlineBeforeWedding;
  
  // Auto-clear invalid deadline
  React.useEffect(() => {
    if (rsvpDeadline && !isValidDeadline) {
      onRsvpDeadlineChange('');
    }
  }, [rsvpDeadline, isValidDeadline, onRsvpDeadlineChange]);

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="font-semibold text-lg mb-4 flex items-center">
        <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
        RSVP 설정
      </h3>

      <div className="space-y-4">
        {/* RSVP 활성화/비활성화 토글 */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="rsvp-enabled" className="font-medium">
              RSVP 기능 활성화
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              하객들이 참석 여부를 알릴 수 있는 기능을 활성화합니다.
            </p>
          </div>
          <Switch
            id="rsvp-enabled"
            checked={rsvpEnabled}
            onCheckedChange={onRsvpEnabledChange}
          />
        </div>

        {/* RSVP 마감일 설정 */}
        <div
          className={
            rsvpEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'
          }
        >
          <div className="flex items-center mb-2">
            <Calendar className="h-4 w-4 mr-2 text-gray-600" />
            <Label htmlFor="rsvp-deadline" className="font-medium">
              RSVP 마감일
            </Label>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            하객들이 참석 여부를 알릴 수 있는 마지막 날짜를 설정합니다.
          </p>
          <Input
            id="rsvp-deadline"
            type="date"
            value={rsvpDeadline}
            onChange={(e) => onRsvpDeadlineChange(e.target.value)}
            min={minDate}
            max={maxDate}
            disabled={!rsvpEnabled}
            className={`h-10 ${rsvpDeadline && !isValidDeadline ? 'border-red-500 focus:border-red-500' : ''}`}
            aria-describedby="rsvp-deadline-help"
          />
          
          {/* Validation feedback */}
          {rsvpDeadline && !isValidDeadline && (
            <div className="flex items-center text-red-600 text-sm mt-1" id="rsvp-deadline-help">
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>
                {!isDeadlineAfterToday 
                  ? '마감일은 오늘 이후 날짜여야 합니다.'
                  : '마감일은 결혼식 날짜 이전이어야 합니다.'}
              </span>
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className={`p-3 rounded-md border mt-4 ${
          rsvpEnabled 
            ? 'bg-blue-50 border-blue-100' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-start">
            <Info className={`h-4 w-4 mr-2 mt-0.5 flex-shrink-0 ${
              rsvpEnabled ? 'text-blue-600' : 'text-gray-500'
            }`} />
            <p className={`text-sm ${
              rsvpEnabled ? 'text-blue-700' : 'text-gray-600'
            }`}>
              {rsvpEnabled
                ? rsvpDeadline && isValidDeadline
                  ? `${new Date(rsvpDeadline).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}까지 하객들이 참석 여부를 알릴 수 있습니다.`
                  : weddingDate 
                    ? `마감일을 설정하지 않으면 ${new Date(weddingDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })} 전날까지 응답을 받습니다.`
                    : '마감일을 설정하지 않으면 결혼식 전날까지 응답을 받습니다.'
                : 'RSVP 기능이 비활성화되어 있습니다. 하객들은 참석 여부를 알릴 수 없습니다.'}
            </p>
          </div>
        </div>
        
        {/* Additional help text */}
        {rsvpEnabled && (
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 mt-2">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-yellow-600" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">RSVP 기능 안내</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>하객들이 청첩장을 통해 참석 여부를 응답할 수 있습니다</li>
                  <li>동반자 수와 축하 메시지도 함께 받을 수 있습니다</li>
                  <li>실시간으로 응답 현황을 확인할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
