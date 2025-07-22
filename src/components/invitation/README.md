# 청첩장 공유 기능 (Invitation Sharing)

## 개요

청첩장 공유 기능은 사용자가 완성된 디지털 청첩장을 다양한 플랫폼을 통해 쉽게 공유할 수 있도록 하는 기능입니다.

## 구성 요소

### 1. ShareModal 컴포넌트

- **파일**: `src/components/invitation/ShareModal.tsx`
- **기능**: 공유 옵션을 제공하는 모달 다이얼로그
- **특징**:
  - 반응형 디자인 (모바일 최적화)
  - 다양한 공유 방법 지원
  - 실시간 피드백 제공
  - 접근성 고려

### 2. ShareButton 컴포넌트

- **파일**: `src/components/invitation/ShareButton.tsx`
- **기능**: 공유 모달을 여는 버튼 컴포넌트
- **특징**:
  - 재사용 가능한 컴포넌트
  - 다양한 스타일 옵션 지원
  - ShareModal과 통합

### 3. useShare 훅

- **파일**: `src/hooks/useShare.ts`
- **기능**: 공유 관련 로직을 관리하는 커스텀 훅
- **특징**:
  - 플랫폼별 공유 로직 분리
  - 에러 처리 및 피드백
  - 타입 안전성 보장

## 지원하는 공유 방법

### 1. 카카오톡 공유

- **방식**: 카카오톡 SDK를 통한 리치 메시지 공유
- **폴백**: SDK 미설치 시 메시지 텍스트 클립보드 복사
- **특징**:
  - 이미지 포함 리치 메시지
  - 직접 링크 연결
  - 브랜딩된 메시지 템플릿

### 2. 문자메시지 (SMS) 공유

- **방식**: 기본 SMS 앱 연동
- **특징**:
  - 플랫폼 독립적
  - 간단한 텍스트 메시지
  - 청첩장 링크 포함

### 3. 이메일 공유

- **방식**: 기본 이메일 앱 연동
- **특징**:
  - 제목과 본문 자동 설정
  - 정중한 이메일 템플릿
  - 청첩장 링크 포함

### 4. 네이티브 공유 (Web Share API)

- **방식**: 브라우저의 Web Share API 활용
- **특징**:
  - 다양한 앱으로 공유 가능
  - 모바일 환경에서 최적화
  - 지원 기기에서만 표시

### 5. 링크 복사

- **방식**: 클립보드 API 활용
- **특징**:
  - 즉시 복사 가능
  - 시각적 피드백 제공
  - 모든 플랫폼 지원

## 사용 방법

### 기본 사용법

```tsx
import { ShareButton } from '@/components/invitation/ShareButton';
import type { ShareData } from '@/types';

const invitation: ShareData = {
  id: '1',
  invitationCode: 'ABC12345',
  groomName: '김철수',
  brideName: '이영희',
  weddingDate: '2024년 6월 15일',
  weddingTime: '오후 2시',
  venueName: '서울웨딩홀',
};

function MyComponent() {
  return <ShareButton invitation={invitation} variant="default" size="lg" />;
}
```

### 직접 모달 사용

```tsx
import { ShareModal } from '@/components/invitation/ShareModal';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>공유하기</button>

      <ShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        invitation={invitation}
      />
    </>
  );
}
```

### 커스텀 훅 사용

```tsx
import { useShare } from '@/hooks/useShare';

function MyComponent() {
  const {
    isSharing,
    shareToKakao,
    shareToSMS,
    copyToClipboard,
    generateInvitationUrl,
  } = useShare();

  const handleShare = async () => {
    const success = await shareToKakao(invitation);
    if (success) {
      console.log('공유 성공!');
    }
  };

  return (
    <button onClick={handleShare} disabled={isSharing}>
      {isSharing ? '공유 중...' : '카카오톡 공유'}
    </button>
  );
}
```

## 메시지 템플릿

### 기본 메시지 형식

```
{신랑이름} ❤️ {신부이름} 결혼합니다!

📅 {결혼식날짜} {결혼식시간}
📍 {예식장이름}

청첩장을 확인해 주세요 💌

{청첩장링크}
```

### 플랫폼별 최적화

- **카카오톡**: 리치 메시지 + 이미지 + 버튼
- **SMS**: 간결한 텍스트 메시지
- **이메일**: 정중한 제목과 본문
- **일반**: 표준 공유 메시지

## 에러 처리

### 공통 에러 처리

- 네트워크 오류
- 권한 거부
- 플랫폼 미지원

### 플랫폼별 에러 처리

- **카카오톡**: SDK 초기화 실패, 앱 미설치
- **클립보드**: 권한 거부, API 미지원
- **Web Share**: API 미지원, 사용자 취소

### 피드백 시스템

- 성공 시: 토스트 알림으로 성공 메시지
- 실패 시: 토스트 알림으로 에러 메시지 및 대안 제시

## 접근성 (Accessibility)

### 키보드 네비게이션

- Tab 키로 모든 버튼 접근 가능
- Enter/Space 키로 버튼 활성화
- Escape 키로 모달 닫기

### 스크린 리더 지원

- 적절한 ARIA 라벨
- 의미있는 버튼 텍스트
- 상태 변화 알림

### 시각적 피드백

- 버튼 호버/포커스 상태
- 로딩 상태 표시
- 성공/실패 시각적 피드백

## 성능 최적화

### 지연 로딩

- 모달 컴포넌트 지연 로딩
- 카카오 SDK 동적 로딩

### 메모이제이션

- useCallback으로 함수 메모이제이션
- 불필요한 리렌더링 방지

### 번들 크기 최적화

- 트리 쉐이킹 지원
- 조건부 임포트

## 테스트

### 단위 테스트

- 각 공유 함수 테스트
- 메시지 템플릿 생성 테스트
- 에러 처리 테스트

### 통합 테스트

- 컴포넌트 렌더링 테스트
- 사용자 상호작용 테스트
- 플랫폼별 공유 플로우 테스트

### 수동 테스트

- 다양한 기기에서 테스트
- 실제 공유 앱 연동 테스트
- 접근성 테스트

## 향후 개선 사항

### 기능 확장

- 더 많은 소셜 미디어 플랫폼 지원
- 공유 통계 및 분석
- 커스텀 메시지 템플릿

### 성능 개선

- 공유 성공률 추적
- 오프라인 지원
- 캐싱 최적화

### 사용자 경험

- 공유 히스토리
- 즐겨찾는 공유 방법
- 개인화된 메시지 템플릿
