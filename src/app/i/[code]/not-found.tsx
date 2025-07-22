import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartCrack, Home } from 'lucide-react';
import Link from 'next/link';

// AIDEV-NOTE: 청첩장을 찾을 수 없을 때 표시되는 커스텀 404 페이지

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-rose-200">
          <div className="mb-6">
            <HeartCrack className="h-16 w-16 text-rose-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              청첩장을 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 mb-6">
              요청하신 청첩장이 존재하지 않거나 더 이상 사용할 수 없습니다.
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              올바른 링크를 다시 확인해 주시거나,<br />
              청첩장을 보내주신 분께 문의해 주세요.
            </p>
            
            <Link href="/" className="block">
              <Button className="w-full bg-rose-500 hover:bg-rose-600">
                <Home className="h-4 w-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}