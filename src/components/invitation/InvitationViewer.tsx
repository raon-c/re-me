'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Database } from '@/types/database';

// AIDEV-NOTE: 모바일 최적화된 공개 청첩장 뷰어 컴포넌트

type Invitation = Database['public']['Tables']['invitations']['Row'];
type Template = Database['public']['Tables']['templates']['Row'];

interface InvitationWithTemplate extends Invitation {
  template?: Template | null;
}

interface InvitationViewerProps {
  invitation: InvitationWithTemplate;
}

export function InvitationViewer({ invitation }: InvitationViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // AIDEV-NOTE: 날짜 포맷팅 함수
  const formatWeddingDate = (date: Date) => {
    return format(date, 'yyyy년 M월 d일 EEEE', { locale: ko });
  };
  
  const formatWeddingTime = (time: Date) => {
    return format(time, 'a h시 mm분', { locale: ko });
  };
  
  // AIDEV-NOTE: 카카오맵 길찾기 기능
  const handleDirections = () => {
    const query = encodeURIComponent(invitation.venue_address || invitation.venue_name || '');
    const kakaoMapUrl = `https://map.kakao.com/link/search/${query}`;
    window.open(kakaoMapUrl, '_blank');
  };
  
  // AIDEV-NOTE: 공유 기능
  const handleShare = async () => {
    const shareData = {
      title: `${invitation.groom_name} ❤️ ${invitation.bride_name} 결혼식`,
      text: `${invitation.groom_name}과 ${invitation.bride_name}의 결혼식에 초대합니다.`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // 공유가 취소된 경우 무시
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      // Web Share API를 지원하지 않는 경우 URL 복사
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('청첩장 링크가 복사되었습니다.');
      } catch {
        alert('링크 복사에 실패했습니다.');
      }
    }
  };
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-50">
      {/* AIDEV-NOTE: 모바일 최적화 - 9:16 세로 레이아웃 */}
      <div className="max-w-md mx-auto relative">
        
        {/* 배경 이미지 */}
        {invitation.background_image_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
            style={{ backgroundImage: `url(${invitation.background_image_url})` }}
          />
        )}
        
        <div className="relative z-10 p-4 space-y-6">
          
          {/* 헤더 섹션 */}
          <Card className="p-6 text-center bg-white/90 backdrop-blur-sm border-rose-200">
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-rose-500 mr-2" />
                <span className="text-rose-600 font-medium">WEDDING INVITATION</span>
                <Heart className="h-6 w-6 text-rose-500 ml-2" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  {invitation.groom_name} <span className="text-rose-500">♥</span> {invitation.bride_name}
                </h1>
                <p className="text-gray-600">
                  {formatWeddingDate(new Date(invitation.wedding_date))}
                </p>
                <p className="text-gray-600">
                  {formatWeddingTime(new Date(invitation.wedding_time))}
                </p>
              </div>
            </div>
          </Card>
          
          {/* 메시지 섹션 */}
          {invitation.custom_message && (
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-rose-200">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">💌 초대의 말씀</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {invitation.custom_message}
                </p>
              </div>
            </Card>
          )}
          
          {/* 웨딩 정보 섹션 */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-rose-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-rose-500 mr-2" />
              예식 정보
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-rose-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">{invitation.venue_name}</p>
                  <p className="text-sm text-gray-600">{invitation.venue_address}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-rose-500" />
                <p className="text-gray-700">
                  {formatWeddingDate(new Date(invitation.wedding_date))} {formatWeddingTime(new Date(invitation.wedding_time))}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleDirections}
              className="w-full mt-4 bg-rose-500 hover:bg-rose-600"
            >
              <MapPin className="h-4 w-4 mr-2" />
              길찾기
            </Button>
          </Card>
          
          {/* 추가 정보 */}
          {(invitation.dress_code || invitation.parking_info || invitation.meal_info || invitation.special_notes) && (
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-rose-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📝 안내사항</h2>
              
              <div className="space-y-3">
                {invitation.dress_code && (
                  <div>
                    <p className="font-medium text-gray-800">드레스코드</p>
                    <p className="text-sm text-gray-600">{invitation.dress_code}</p>
                  </div>
                )}
                
                {invitation.parking_info && (
                  <div>
                    <p className="font-medium text-gray-800">주차 안내</p>
                    <p className="text-sm text-gray-600">{invitation.parking_info}</p>
                  </div>
                )}
                
                {invitation.meal_info && (
                  <div>
                    <p className="font-medium text-gray-800">식사 안내</p>
                    <p className="text-sm text-gray-600">{invitation.meal_info}</p>
                  </div>
                )}
                
                {invitation.special_notes && (
                  <div>
                    <p className="font-medium text-gray-800">특별 안내</p>
                    <p className="text-sm text-gray-600">{invitation.special_notes}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
          
          {/* RSVP 섹션 */}
          {invitation.rsvp_enabled && (
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-rose-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">💌 참석 의사 전달</h2>
              
              <div className="space-y-4">
                {invitation.rsvp_deadline && (
                  <p className="text-sm text-gray-600">
                    📅 응답 기한: {format(new Date(invitation.rsvp_deadline), 'yyyy년 M월 d일', { locale: ko })}
                  </p>
                )}
                
                <Button 
                  className="w-full bg-rose-500 hover:bg-rose-600"
                  onClick={() => {
                    // AIDEV-TODO: RSVP 폼 모달 구현 또는 별도 페이지로 이동
                    alert('RSVP 기능은 곧 추가됩니다.');
                  }}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  참석 여부 알려주기
                </Button>
              </div>
            </Card>
          )}
          
          {/* 공유 버튼 */}
          <Card className="p-4 bg-white/90 backdrop-blur-sm border-rose-200">
            <Button 
              onClick={handleShare}
              variant="outline"
              className="w-full border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              💕 청첩장 공유하기
            </Button>
          </Card>
          
          {/* 푸터 */}
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              소중한 분들과 함께하고 싶습니다
            </p>
            <div className="mt-2 flex items-center justify-center">
              <span className="text-rose-500 text-xl">♥</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}