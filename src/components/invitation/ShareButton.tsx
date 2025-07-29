'use client';

import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareModal } from './ShareModal';
import type { ShareData } from '@/types';

interface ShareButtonProps {
  invitation: ShareData;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ShareButton({
  invitation,
  variant = 'default',
  size = 'default',
  className,
}: ShareButtonProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShareClick}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-2" />
        공유하기
      </Button>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        invitationCode={invitation.invitation_code}
        groomName={invitation.groom_name}
        brideName={invitation.bride_name}
        weddingDate={invitation.wedding_date}
        weddingVenue={invitation.venue_name}
      />
    </>
  );
}
