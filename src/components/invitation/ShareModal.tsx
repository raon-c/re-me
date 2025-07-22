'use client';

import React, { useState } from 'react';
import { Copy, Share2, MessageCircle, Mail, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useShare, type ShareData } from '@/hooks/useShare';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: ShareData;
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  action: () => Promise<void>;
  disabled?: boolean;
}

export function ShareModal({ isOpen, onClose, invitation }: ShareModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const {
    isSharing,
    generateInvitationUrl,
    copyToClipboard,
    shareToKakao,
    shareToSMS,
    shareToEmail,
    shareNative,
    isNativeShareSupported,
  } = useShare();

  // Generate invitation URL
  const invitationUrl = generateInvitationUrl(invitation.invitationCode);

  // Copy URL to clipboard with visual feedback
  const handleCopyUrl = async () => {
    const success = await copyToClipboard(invitationUrl);
    if (success) {
      setCopiedUrl(true);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Handle share actions with loading states
  const handleShareAction = async (shareFunction: () => Promise<boolean>) => {
    await shareFunction();
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'kakao',
      name: '카카오톡',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      action: async () => handleShareAction(() => shareToKakao(invitation)),
      disabled: isSharing,
    },
    {
      id: 'sms',
      name: '문자메시지',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      action: async () => handleShareAction(() => shareToSMS(invitation)),
      disabled: isSharing,
    },
    {
      id: 'email',
      name: '이메일',
      icon: <Mail className="h-5 w-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: async () => handleShareAction(() => shareToEmail(invitation)),
      disabled: isSharing,
    },
  ];

  // Add native share option if available
  if (isNativeShareSupported()) {
    shareOptions.push({
      id: 'native',
      name: '더 많은 앱',
      icon: <Share2 className="h-5 w-5" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: async () => handleShareAction(() => shareNative(invitation)),
      disabled: isSharing,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>청첩장 공유하기</DialogTitle>
          <DialogDescription>
            소중한 분들에게 청첩장을 공유해보세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL Copy Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">청첩장 링크</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 rounded-md text-sm text-gray-600 truncate">
                {invitationUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="shrink-0"
                disabled={isSharing}
              >
                {copiedUrl ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Share Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">공유 방법 선택</label>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  className={`h-12 flex flex-col items-center justify-center space-y-1 text-white ${option.color} border-0 disabled:opacity-50`}
                  onClick={option.action}
                  disabled={option.disabled}
                >
                  {option.icon}
                  <span className="text-xs">{option.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Loading indicator */}
          {isSharing && (
            <div className="text-center text-sm text-gray-500">공유 중...</div>
          )}

          {/* Additional Info */}
          <div className="text-xs text-gray-500 text-center">
            링크를 통해 청첩장을 확인할 수 있습니다.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
