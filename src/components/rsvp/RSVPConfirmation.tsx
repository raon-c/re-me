'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, MapPin, Users, MessageSquare, Share2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// AIDEV-NOTE: RSVP 응답 확인 컴포넌트
// 게스트가 응답을 제출한 후 확인 및 공유 기능 제공

interface RSVPConfirmationProps {
  guestName: string;
  attendanceStatus: 'attending' | 'not_attending';
  adultCount?: number;
  childCount?: number;
  message?: string;
  weddingDate: string;
  weddingVenue: string;
  groomName: string;
  brideName: string;
  invitationCode: string;
}

export function RSVPConfirmation({
  guestName,
  attendanceStatus,
  adultCount = 0,
  childCount = 0,
  message,
  weddingDate,
  weddingVenue,
  groomName,
  brideName,
  invitationCode,
}: RSVPConfirmationProps) {
  const [isSharing, setIsSharing] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const shareUrl = `${window.location.origin}/i/${invitationCode}`;
      const shareText = `${groomName}♥${brideName} 결혼식에 초대합니다!\n${formatDate(weddingDate)}\n${weddingVenue}`;

      if (navigator.share) {
        // 네이티브 공유 API 사용 (모바일)
        await navigator.share({
          title: `${groomName}♥${brideName} 결혼식 초대`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        // 클립보드 복사 (데스크톱)
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        toast.success('초대장 링크가 클립보드에 복사되었습니다.');
      }
    } catch {
      toast.error('공유에 실패했습니다.');
    } finally {
      setIsSharing(false);
    }
  };

  const getStatusBadge = () => {
    if (attendanceStatus === 'attending') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          참석
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          불참
        </Badge>
      );
    }
  };

  const totalGuests = adultCount + childCount;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 응답 완료 메시지 */}
      <Card className="text-center border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-green-800">
                응답이 전송되었습니다!
              </h2>
              <p className="text-green-700 mt-2">
                {guestName}님의 소중한 응답을 받았습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 응답 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            응답 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">응답자</div>
              <div className="font-semibold">{guestName}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">참석 여부</div>
              <div>{getStatusBadge()}</div>
            </div>
            
            {attendanceStatus === 'attending' && totalGuests > 0 && (
              <>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">참석 인원</div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">
                      {totalGuests}명
                      {adultCount > 0 && ` (성인 ${adultCount}명${childCount > 0 ? `, 어린이 ${childCount}명` : ''})`}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {message && (
            <div className="space-y-2 pt-4 border-t">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                축하 메시지
              </div>
              <div className="bg-gray-50 p-3 rounded-lg italic">
                &ldquo;{message}&rdquo;
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 결혼식 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {groomName} ♥ {brideName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <div className="font-semibold">{formatDate(weddingDate)}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-gray-700">
            <MapPin className="w-5 h-5 text-red-500" />
            <div>
              <div className="font-semibold">{weddingVenue}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <Button
          onClick={handleShare}
          disabled={isSharing}
          variant="outline"
          className="flex-1"
        >
          {isSharing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              공유 중...
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              초대장 공유하기
            </>
          )}
        </Button>
        
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="flex-1"
        >
          다른 응답 작성
        </Button>
      </div>

      {/* 감사 메시지 */}
      <Card className="bg-gradient-to-r from-pink-50 to-blue-50">
        <CardContent className="pt-6 text-center">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700">
            {attendanceStatus === 'attending' 
              ? `${guestName}님과 함께하는 소중한 시간을 기다리고 있겠습니다.`
              : `${guestName}님의 마음만으로도 충분히 감사합니다.`
            }
          </p>
          <p className="text-sm text-gray-600 mt-2">
            - {groomName} & {brideName} 올림 -
          </p>
        </CardContent>
      </Card>
    </div>
  );
}