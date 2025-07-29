'use client';

import React from 'react';
import { ShareButton } from '@/components/invitation/ShareButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ShareData } from '@/types';

export default function ShareDemoPage() {
  const sampleInvitation: ShareData = {
    id: 'demo-1',
    invitation_code: 'DEMO1234',
    groom_name: '김철수',
    bride_name: '이영희',
    wedding_date: '2024년 6월 15일',
    wedding_time: '오후 2시',
    venue_name: '서울웨딩홀',
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">공유 기능 데모</h1>
          <p className="text-gray-600">청첩장 공유 기능을 테스트해보세요.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>샘플 청첩장</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">
                {sampleInvitation.groom_name} ❤️ {sampleInvitation.bride_name}
              </h2>
              <p className="text-lg text-gray-600">
                {sampleInvitation.wedding_date} {sampleInvitation.wedding_time}
              </p>
              <p className="text-gray-600">{sampleInvitation.venue_name}</p>
            </div>

            <div className="flex justify-center pt-4">
              <ShareButton
                invitation={sampleInvitation}
                variant="default"
                size="lg"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>공유 기능 설명</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold">지원하는 공유 방법:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>
                  <strong>카카오톡:</strong> 카카오톡 SDK를 통한 리치 메시지
                  공유 (SDK 미설치 시 메시지 복사)
                </li>
                <li>
                  <strong>문자메시지:</strong> SMS 앱을 통한 메시지 전송
                </li>
                <li>
                  <strong>이메일:</strong> 기본 이메일 앱을 통한 메일 전송
                </li>
                <li>
                  <strong>더 많은 앱:</strong> Web Share API를 통한 네이티브
                  공유 (지원 기기에서만 표시)
                </li>
                <li>
                  <strong>링크 복사:</strong> 클립보드에 청첩장 URL 복사
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">기능 특징:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>플랫폼별 최적화된 메시지 템플릿</li>
                <li>성공/실패 피드백 토스트 알림</li>
                <li>로딩 상태 표시</li>
                <li>모바일 친화적 UI</li>
                <li>접근성 고려된 키보드 네비게이션</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>실제 환경에서는 유효한 청첩장 코드와 URL이 생성됩니다.</p>
        </div>
      </div>
    </div>
  );
}
