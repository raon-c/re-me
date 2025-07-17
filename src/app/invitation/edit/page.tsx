'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InvitationEditor } from '@/components/invitation/InvitationEditor';

function EditorContent() {
  const searchParams = useSearchParams();
  const invitationId = searchParams.get('id');
  const templateId = searchParams.get('templateId');

  return (
    <InvitationEditor
      invitationId={invitationId || undefined}
      templateId={templateId || undefined}
    />
  );
}

export default function InvitationEditPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">편집기를 불러오는 중...</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}