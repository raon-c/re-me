import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { trpc } from '@/lib/trpc/server';
import { InvitationViewer } from '@/components/invitation/InvitationViewer';

// AIDEV-NOTE: 공개 청첩장 조회 페이지 - 고유 코드로 청첩장 조회

interface PublicInvitationPageProps {
  params: {
    code: string;
  };
}

// AIDEV-NOTE: SEO 최적화를 위한 동적 메타데이터 생성
export async function generateMetadata({ params }: PublicInvitationPageProps): Promise<Metadata> {
  try {
    const invitation = await trpc.invitation.getByCode({ code: params.code });
    
    const weddingDateStr = new Date(invitation.weddingDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const title = `${invitation.groomName} ❤️ ${invitation.brideName} 결혼식 청첩장`;
    const description = `${weddingDateStr} ${invitation.venueName}에서 거행되는 ${invitation.groomName}과 ${invitation.brideName}의 결혼식에 초대합니다.`;
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://re-me.vercel.app'}/i/${params.code}`;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: invitationUrl,
        siteName: 'Re:Me - 디지털 청첩장',
        images: invitation.backgroundImageUrl ? [
          {
            url: invitation.backgroundImageUrl,
            width: 1200,
            height: 630,
            alt: `${invitation.groomName}과 ${invitation.brideName}의 결혼식`,
          },
        ] : [],
        locale: 'ko_KR',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: invitation.backgroundImageUrl ? [invitation.backgroundImageUrl] : [],
      },
      alternates: {
        canonical: invitationUrl,
      },
    };
  } catch {
    return {
      title: '청첩장을 찾을 수 없습니다',
      description: 'Re:Me 디지털 청첩장',
    };
  }
}

export default async function PublicInvitationPage({ params }: PublicInvitationPageProps) {
  try {
    // AIDEV-NOTE: 서버 컴포넌트에서 청첩장 데이터 조회 및 조회 로그 기록
    const invitation = await trpc.invitation.getByCode({ code: params.code });
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* AIDEV-NOTE: 모바일 최적화된 청첩장 뷰어 컴포넌트 */}
        <InvitationViewer invitation={invitation} />
      </div>
    );
  } catch {
    // AIDEV-NOTE: 청첩장을 찾을 수 없거나 오류가 발생한 경우 404 페이지 표시
    notFound();
  }
}