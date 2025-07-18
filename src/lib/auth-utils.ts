import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface UserData {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  name?: string | null;
  provider?: string | null;
  created_at?: string | null;
}

// AIDEV-NOTE: 서버 컴포넌트에서 사용자 인증 상태를 확인하고 데이터를 가져오는 유틸리티
export async function getUserData(): Promise<UserData | null> {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Supabase auth에서 기본 사용자 정보 가져오기
  const userData: UserData = {
    id: user.id,
    email: user.email!,
    email_confirmed_at: user.email_confirmed_at || null,
  };

  // 프로필 정보가 필요한 경우 users 테이블에서 추가 정보 조회
  try {
    const { data: profile } = await supabase
      .from('users')
      .select('name, provider, created_at')
      .eq('id', user.id)
      .single();

    if (profile) {
      userData.name = profile.name || null;
      userData.provider = profile.provider || null;
      userData.created_at = profile.created_at || null;
    }
  } catch (error) {
    // AIDEV-NOTE: users 테이블이 없는 경우를 처리
    console.warn('Users table not found, using auth data only:', error);
    userData.name = user.user_metadata?.name || null;
    userData.provider = user.app_metadata?.provider || 'email';
    userData.created_at = user.created_at || null;
  }

  return userData;
}

// AIDEV-NOTE: 인증이 필요한 페이지에서 사용자 확인 및 리다이렉트 처리
export async function requireAuth(): Promise<UserData> {
  const userData = await getUserData();
  
  if (!userData) {
    redirect('/login');
  }
  
  return userData;
}