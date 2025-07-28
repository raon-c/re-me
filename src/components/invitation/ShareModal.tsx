'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Share2, MessageCircle, Mail, Check, Smartphone, Globe, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ShareModalProps {
  invitationCode: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingVenue: string;
  onClose: () => void;
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  action: () => Promise<void>;
  disabled?: boolean;
  recommended?: boolean;
}

// AIDEV-NOTE: 모바일 친화적 공유 모달 - 한국 서비스 통합
export function ShareModal({
  invitationCode,
  groomName,
  brideName,
  weddingDate,
  weddingVenue,
  onClose,
}: ShareModalProps) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'quick' | 'social' | 'advanced'>('quick');
  const [isMobile, setIsMobile] = useState(false);
  
  const invitationUrl = `${window.location.origin}/i/${invitationCode}`;
  const shareTitle = `${groomName} ♥ ${brideName} 결혼식에 초대합니다`;
  const shareText = `${shareTitle}\n\n📅 ${new Date(weddingDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })}\n📍 ${weddingVenue}\n\n따뜻한 마음으로 참석해 주시면 감사하겠습니다.`;

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      toast.success('클립보드에 복사되었습니다.');
      
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'kakao',
      name: '카카오톡',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'bg-yellow-400 hover:bg-yellow-500',
      description: '카카오톡으로 전송 (가장 인기)',
      recommended: true,
      action: async () => {
        try {
          // Check if Kakao SDK is available
          const kakao = (window as { Kakao?: { Share?: { sendDefault: (options: unknown) => void } } }).Kakao;
          if (kakao?.Share) {
            kakao.Share.sendDefault({
              objectType: 'feed',
              content: {
                title: shareTitle,
                description: `${new Date(weddingDate).toLocaleDateString('ko-KR')} | ${weddingVenue}`,
                imageUrl: `${window.location.origin}/api/og?invitation=${invitationCode}`,
                link: {
                  mobileWebUrl: invitationUrl,
                  webUrl: invitationUrl,
                },
              },
              buttons: [
                {
                  title: '청첩장 보기',
                  link: {
                    mobileWebUrl: invitationUrl,
                    webUrl: invitationUrl,
                  },
                },
              ],
            });
          } else {
            // 카카오 SDK 없는 경우 링크 복사로 대체
            await copyToClipboard(invitationUrl, 'kakao-fallback');
            toast.info('카카오톡이 설치되지 않았습니다. 링크가 복사되었으니 직접 공유해주세요.');
          }
        } catch {
          await copyToClipboard(invitationUrl, 'kakao-error');
          toast.error('카카오톡 공유에 실패했습니다. 링크가 복사되었습니다.');
        }
      },
    },
    {
      id: 'sms',
      name: '문자메시지',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'SMS로 전송',
      action: async () => {
        const smsText = `${shareText}\n\n${invitationUrl}`;
        if (isMobile) {
          window.location.href = `sms:?body=${encodeURIComponent(smsText)}`;
        } else {
          await copyToClipboard(smsText, 'sms');
          toast.info('문자 내용이 복사되었습니다. 문자앱에서 붙여넣기 해주세요.');
        }
      },
    },
    {
      id: 'email',
      name: '이메일',
      icon: <Mail className="h-5 w-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: '이메일로 전송',
      action: async () => {
        const emailBody = shareText.replace(/\n/g, '%0D%0A');
        const emailSubject = encodeURIComponent(shareTitle);
        window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}%0D%0A%0D%0A${encodeURIComponent(invitationUrl)}`;
      },
    },
    {
      id: 'native',
      name: '기본 공유',
      icon: <Share2 className="h-5 w-5" />,
      color: 'bg-gray-500 hover:bg-gray-600',
      description: '시스템 공유 메뉴',
      action: async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: shareTitle,
              text: shareText,
              url: invitationUrl,
            });
          } catch (error: unknown) {
            if (error instanceof Error && error.name !== 'AbortError') {
              await copyToClipboard(invitationUrl, 'native-error');
              toast.error('공유에 실패했습니다. 링크가 복사되었습니다.');
            }
          }
        } else {
          await copyToClipboard(invitationUrl, 'native-fallback');
          toast.info('시스템 공유를 지원하지 않습니다. 링크가 복사되었습니다.');
        }
      },
    },
  ];

  const quickCopyOptions = [
    {
      label: '링크만 복사',
      value: invitationUrl,
      key: 'url',
    },
    {
      label: '초대 메시지와 함께 복사',
      value: `${shareText}\n\n${invitationUrl}`,
      key: 'full',
    },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            청첩장 공유하기
          </DialogTitle>
          <DialogDescription className="text-center">
            소중한 분들에게 청첩장을 공유해보세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 청첩장 미리보기 */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg">{shareTitle}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {new Date(weddingDate).toLocaleDateString('ko-KR')} | {weddingVenue}
                </p>
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  {invitationUrl}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 탭 메뉴 */}
          <div className="flex border-b">
            {[
              { key: 'quick' as const, label: '빠른 공유' },
              { key: 'social' as const, label: '소셜 공유' },
              { key: 'advanced' as const, label: '기타' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 빠른 공유 */}
          {activeTab === 'quick' && (
            <div className="space-y-3">
              {quickCopyOptions.map(option => (
                <div key={option.key} className="space-y-2">
                  <Label className="text-sm font-medium">{option.label}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={option.value}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(option.value, option.key)}
                      className="shrink-0"
                    >
                      {copiedStates[option.key] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 소셜 공유 */}
          {activeTab === 'social' && (
            <div className="grid grid-cols-1 gap-3">
              {shareOptions.map(option => (
                <button
                  key={option.id}
                  onClick={option.action}
                  disabled={option.disabled}
                  className={`flex items-center p-4 rounded-lg text-white transition-colors ${option.color} ${
                    option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {option.icon}
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        {option.name}
                        {option.recommended && (
                          <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                            추천
                          </span>
                        )}
                      </div>
                      <div className="text-sm opacity-90">{option.description}</div>
                    </div>
                  </div>
                  <Share2 className="h-4 w-4 opacity-70" />
                </button>
              ))}
            </div>
          )}

          {/* 고급 기능 */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div className="text-center text-gray-600">
                <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">QR 코드 생성 기능은 곧 제공될 예정입니다.</p>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(invitationUrl, '_blank')}
              >
                <Globe className="h-4 w-4 mr-2" />
                새 창에서 청첩장 보기
              </Button>
            </div>
          )}

          {/* 닫기 버튼 */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
