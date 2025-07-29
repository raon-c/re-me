'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Users, MessageSquare, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { createRsvpResponseAction } from '@/actions/safe-rsvp-actions';

// AIDEV-NOTE: RSVP 폼 컴포넌트 - 게스트 응답 수집
// 참석 여부, 인원수, 연락처, 축하 메시지 입력

const rsvpSchema = z.object({
  guestName: z.string().min(1, '이름을 입력해주세요.').max(100, '이름은 100자 이하여야 합니다.'),
  guestPhone: z.string().optional(),
  attendanceStatus: z.enum(['attending', 'not_attending']).refine(val => val !== undefined, {
    message: '참석 여부를 선택해주세요.',
  }),
  adultCount: z.number().min(0).max(10).default(1),
  childCount: z.number().min(0).max(10).default(0),
  message: z.string().max(500, '메시지는 500자 이하여야 합니다.').optional(),
});

type RSVPFormData = z.infer<typeof rsvpSchema>;

interface RSVPFormProps {
  invitationId: string;
  groomName: string;
  brideName: string;
  onSuccess?: () => void;
}

export function RSVPForm({ invitationId, groomName, brideName, onSuccess }: RSVPFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      attendanceStatus: 'attending' as const,
      adultCount: 1,
      childCount: 0,
    },
  });

  const attendanceStatus = watch('attendanceStatus');
  const adultCount = watch('adultCount');
  const childCount = watch('childCount');

  const onSubmit = async (data: RSVPFormData) => {
    try {
      setIsSubmitting(true);

      const result = await createRsvpResponseAction({
        invitationId,
        guestName: data.guestName,
        guestPhone: data.guestPhone || '',
        attendanceStatus: data.attendanceStatus,
        adultCount: data.adultCount ?? 1,
        childCount: data.childCount ?? 0,
        message: data.message || '',
      });

      if (result?.data) {
        toast.success('참석 응답이 전송되었습니다.');
        onSuccess?.();
      } else {
        toast.error(result?.serverError || '응답 전송에 실패했습니다.');
      }
    } catch {
      toast.error('응답 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800">
          <Heart className="inline-block w-6 h-6 text-red-500 mr-2" />
          {groomName} ♥ {brideName}
        </CardTitle>
        <p className="text-gray-600 mt-2">
          소중한 시간을 함께해주세요
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="guestName" className="text-sm font-medium">
              이름 *
            </Label>
            <Input
              id="guestName"
              placeholder="성함을 입력해주세요"
              {...register('guestName')}
              className={errors.guestName ? 'border-red-500' : ''}
            />
            {errors.guestName && (
              <p className="text-sm text-red-600">{errors.guestName.message}</p>
            )}
          </div>

          {/* 연락처 입력 */}
          <div className="space-y-2">
            <Label htmlFor="guestPhone" className="text-sm font-medium">
              <Phone className="inline-block w-4 h-4 mr-1" />
              연락처 (선택사항)
            </Label>
            <Input
              id="guestPhone"
              type="tel"
              placeholder="010-1234-5678"
              {...register('guestPhone')}
            />
          </div>

          {/* 참석 여부 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">참석 여부 *</Label>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="attending"
                  value="attending"
                  {...register('attendanceStatus')}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="attending" className="cursor-pointer">
                  참석합니다
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="not_attending"
                  value="not_attending"
                  {...register('attendanceStatus')}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="not_attending" className="cursor-pointer">
                  참석하지 못합니다
                </Label>
              </div>
            </div>
            {errors.attendanceStatus && (
              <p className="text-sm text-red-600">{errors.attendanceStatus.message}</p>
            )}
          </div>

          {/* 참석하는 경우 인원수 */}
          {attendanceStatus === 'attending' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="w-4 h-4" />
                참석 인원
              </div>
              
              {/* 성인 인원 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adultCount" className="text-sm">
                    성인
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('adultCount', Math.max(0, (adultCount ?? 1) - 1))}
                      disabled={(adultCount ?? 1) <= 0}
                    >
                      -
                    </Button>
                    <Input
                      id="adultCount"
                      type="number"
                      min="0"
                      max="10"
                      className="text-center"
                      {...register('adultCount', { valueAsNumber: true })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('adultCount', Math.min(10, (adultCount ?? 1) + 1))}
                      disabled={(adultCount ?? 1) >= 10}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* 어린이 인원 */}
                <div className="space-y-2">
                  <Label htmlFor="childCount" className="text-sm">
                    어린이
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('childCount', Math.max(0, (childCount ?? 0) - 1))}
                      disabled={(childCount ?? 0) <= 0}
                    >
                      -
                    </Button>
                    <Input
                      id="childCount"
                      type="number"
                      min="0"
                      max="10"
                      className="text-center"
                      {...register('childCount', { valueAsNumber: true })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('childCount', Math.min(10, (childCount ?? 0) + 1))}
                      disabled={(childCount ?? 0) >= 10}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 축하 메시지 */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              <MessageSquare className="inline-block w-4 h-4 mr-1" />
              축하 메시지 (선택사항)
            </Label>
            <Textarea
              id="message"
              placeholder="신랑신부에게 전하고 싶은 축하 메시지를 남겨주세요"
              rows={4}
              {...register('message')}
              className={errors.message ? 'border-red-500' : ''}
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  전송 중...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  응답 전송
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}