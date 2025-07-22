'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ShareData {
  id: string;
  invitationCode: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
}

export interface ShareMessageTemplate {
  subject?: string;
  body: string;
}

export type SharePlatform = 'kakao' | 'sms' | 'email' | 'general';

export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  // Generate invitation URL
  const generateInvitationUrl = useCallback((invitationCode: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/invitation/${invitationCode}`;
  }, []);

  // Create sharing message template
  const createShareMessage = useCallback(
    (shareData: ShareData, platform: SharePlatform): ShareMessageTemplate => {
      const baseMessage = `${shareData.groomName} ❤️ ${shareData.brideName} 결혼합니다!

📅 ${shareData.weddingDate} ${shareData.weddingTime}
📍 ${shareData.venueName}

청첩장을 확인해 주세요 💌`;

      const invitationUrl = generateInvitationUrl(shareData.invitationCode);

      switch (platform) {
        case 'kakao':
          return {
            body: `${baseMessage}\n\n${invitationUrl}`,
          };
        case 'sms':
          return {
            body: `${baseMessage}\n\n${invitationUrl}`,
          };
        case 'email':
          return {
            subject: `${shareData.groomName} ❤️ ${shareData.brideName} 결혼식 초대`,
            body: `${baseMessage}\n\n청첩장 링크: ${invitationUrl}`,
          };
        case 'general':
          return {
            body: `${baseMessage}\n\n${invitationUrl}`,
          };
        default:
          return {
            body: baseMessage,
          };
      }
    },
    [generateInvitationUrl]
  );

  // Copy to clipboard
  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('클립보드에 복사되었습니다!');
        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        toast.error('복사에 실패했습니다.');
        return false;
      }
    },
    []
  );

  // Share via KakaoTalk
  const shareToKakao = useCallback(
    async (shareData: ShareData): Promise<boolean> => {
      setIsSharing(true);

      try {
        // Check if Kakao SDK is available
        if (
          typeof window !== 'undefined' &&
          (window as unknown as { Kakao?: unknown }).Kakao
        ) {
          const kakao = (window as unknown as { Kakao: unknown }).Kakao as {
            isInitialized: () => boolean;
            Share: {
              sendDefault: (options: {
                objectType: string;
                content: {
                  title: string;
                  description: string;
                  imageUrl: string;
                  link: {
                    mobileWebUrl: string;
                    webUrl: string;
                  };
                };
                buttons: Array<{
                  title: string;
                  link: {
                    mobileWebUrl: string;
                    webUrl: string;
                  };
                }>;
                success: () => void;
                fail: (error: unknown) => void;
              }) => void;
            };
          };

          if (!kakao.isInitialized()) {
            throw new Error('Kakao SDK not initialized');
          }

          const invitationUrl = generateInvitationUrl(shareData.invitationCode);

          await new Promise<void>((resolve, reject) => {
            kakao.Share.sendDefault({
              objectType: 'feed',
              content: {
                title: `${shareData.groomName} ❤️ ${shareData.brideName} 결혼식 초대`,
                description: `${shareData.weddingDate} ${shareData.weddingTime}\n${shareData.venueName}`,
                imageUrl: `${window.location.origin}/api/og-image/${shareData.invitationCode}`,
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
              success: () => {
                toast.success('카카오톡으로 공유되었습니다!');
                resolve();
              },
              fail: (error: unknown) => {
                console.error('KakaoTalk share failed:', error);
                reject(error);
              },
            });
          });

          return true;
        } else {
          // Fallback: Copy message to clipboard
          const message = createShareMessage(shareData, 'kakao');
          const success = await copyToClipboard(message.body);
          if (success) {
            toast.success(
              '카카오톡 메시지가 복사되었습니다. 카카오톡에서 붙여넣기 해주세요.'
            );
          }
          return success;
        }
      } catch (error) {
        console.error('KakaoTalk share failed:', error);
        toast.error('카카오톡 공유에 실패했습니다.');
        return false;
      } finally {
        setIsSharing(false);
      }
    },
    [generateInvitationUrl, createShareMessage, copyToClipboard]
  );

  // Share via SMS
  const shareToSMS = useCallback(
    async (shareData: ShareData): Promise<boolean> => {
      setIsSharing(true);

      try {
        const message = createShareMessage(shareData, 'sms');
        const smsUrl = `sms:?body=${encodeURIComponent(message.body)}`;

        if (typeof window !== 'undefined') {
          window.location.href = smsUrl;
          toast.success('문자 메시지 앱이 열렸습니다!');
          return true;
        }
        return false;
      } catch (error) {
        console.error('SMS share failed:', error);
        toast.error('문자 공유에 실패했습니다.');
        return false;
      } finally {
        setIsSharing(false);
      }
    },
    [createShareMessage]
  );

  // Share via Email
  const shareToEmail = useCallback(
    async (shareData: ShareData): Promise<boolean> => {
      setIsSharing(true);

      try {
        const emailData = createShareMessage(shareData, 'email');
        const emailUrl = `mailto:?subject=${encodeURIComponent(emailData.subject || '')}&body=${encodeURIComponent(emailData.body)}`;

        if (typeof window !== 'undefined') {
          window.location.href = emailUrl;
          toast.success('이메일 앱이 열렸습니다!');
          return true;
        }
        return false;
      } catch (error) {
        console.error('Email share failed:', error);
        toast.error('이메일 공유에 실패했습니다.');
        return false;
      } finally {
        setIsSharing(false);
      }
    },
    [createShareMessage]
  );

  // Native Web Share API
  const shareNative = useCallback(
    async (shareData: ShareData): Promise<boolean> => {
      setIsSharing(true);

      try {
        if (navigator.share) {
          const message = createShareMessage(shareData, 'general');
          const invitationUrl = generateInvitationUrl(shareData.invitationCode);

          const sharePayload = {
            title: `${shareData.groomName} ❤️ ${shareData.brideName} 결혼식 초대`,
            text: message.body,
            url: invitationUrl,
          };

          await navigator.share(sharePayload);
          toast.success('공유가 완료되었습니다!');
          return true;
        } else {
          // Fallback to copy URL
          const invitationUrl = generateInvitationUrl(shareData.invitationCode);
          return await copyToClipboard(invitationUrl);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Native share failed:', error);
          toast.error('공유에 실패했습니다.');
        }
        return false;
      } finally {
        setIsSharing(false);
      }
    },
    [generateInvitationUrl, createShareMessage, copyToClipboard]
  );

  // Check if Web Share API is supported
  const isNativeShareSupported = useCallback(() => {
    return typeof window !== 'undefined' && 'share' in navigator;
  }, []);

  return {
    isSharing,
    generateInvitationUrl,
    createShareMessage,
    copyToClipboard,
    shareToKakao,
    shareToSMS,
    shareToEmail,
    shareNative,
    isNativeShareSupported,
  };
}
