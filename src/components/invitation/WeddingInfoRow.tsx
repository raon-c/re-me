'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeddingInfoFormData } from '@/lib/wedding-validations';

interface WeddingInfoRowProps {
  weddingInfo: WeddingInfoFormData | null;
}

export function WeddingInfoRow({ weddingInfo }: WeddingInfoRowProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* 결혼식 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">결혼식 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {weddingInfo ? (
            <>
              <div>
                <label className="text-sm font-medium">신랑신부</label>
                <p className="text-sm text-muted-foreground">
                  {weddingInfo.groomName} ❤ {weddingInfo.brideName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">예식일시</label>
                <p className="text-sm text-muted-foreground">
                  {weddingInfo.weddingDate} {weddingInfo.weddingTime}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">예식장</label>
                <p className="text-sm text-muted-foreground">
                  {weddingInfo.venueName}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              결혼식 정보를 입력해주세요.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 도움말 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">도움말</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 블록을 클릭하여 내용을 편집할 수 있습니다</p>
          <p>• 블록 순서를 변경하려면 드래그하세요</p>
          <p>• 새로운 블록을 추가하려면 + 버튼을 클릭하세요</p>
          <p>• 미리보기로 최종 결과를 확인하세요</p>
        </CardContent>
      </Card>
    </div>
  );
}
