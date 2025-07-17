'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  MapPin,
  Phone,
  Users,
  MessageCircle,
  Settings,
  Save,
  Eye,
  EyeOff,
  Info,
  Heart,
  Car,
  Utensils,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  weddingInfoSchema,
  type WeddingInfoFormData,
  FORM_FIELD_CONFIG,
  formatPhoneNumber,
  formatDate,
  formatTime,
} from '@/lib/wedding-validations';

interface WeddingInfoFormProps {
  initialData?: Partial<WeddingInfoFormData>;
  onSubmit: (data: WeddingInfoFormData) => void;
  onSave?: (data: Partial<WeddingInfoFormData>) => void;
  isLoading?: boolean;
  className?: string;
}

interface FormSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  fields: (keyof WeddingInfoFormData)[];
  expanded?: boolean;
}

// AIDEV-NOTE: 결혼식 정보 폼 섹션 구성 - 사용자 친화적 그룹화
const FORM_SECTIONS: FormSection[] = [
  {
    id: 'basic',
    title: '기본 정보',
    icon: <Heart className="h-5 w-5" />,
    description: '신랑신부와 결혼식 기본 정보를 입력하세요.',
    fields: ['groomName', 'brideName', 'weddingDate', 'weddingTime'],
    expanded: true,
  },
  {
    id: 'venue',
    title: '예식장 정보',
    icon: <MapPin className="h-5 w-5" />,
    description: '결혼식이 열릴 장소 정보를 입력하세요.',
    fields: ['venueName', 'venueAddress', 'venueHall'],
    expanded: true,
  },
  {
    id: 'contact',
    title: '연락처 정보',
    icon: <Phone className="h-5 w-5" />,
    description: '연락처와 부모님 성함을 입력하세요.',
    fields: ['groomContact', 'brideContact', 'groomParents', 'brideParents'],
    expanded: false,
  },
  {
    id: 'additional',
    title: '추가 정보',
    icon: <Info className="h-5 w-5" />,
    description: '드레스코드, 주차 안내 등 추가 정보를 입력하세요.',
    fields: ['customMessage', 'dressCode', 'parkingInfo', 'mealInfo', 'specialNotes'],
    expanded: false,
  },
  {
    id: 'rsvp',
    title: 'RSVP 설정',
    icon: <MessageCircle className="h-5 w-5" />,
    description: '참석 여부 확인 기능을 설정하세요.',
    fields: ['rsvpEnabled', 'rsvpDeadline'],
    expanded: false,
  },
  {
    id: 'other',
    title: '기타 설정',
    icon: <Settings className="h-5 w-5" />,
    description: '계좌 정보, 배경 이미지 등을 설정하세요.',
    fields: ['accountInfo', 'backgroundImageUrl'],
    expanded: false,
  },
];

export function WeddingInfoForm({
  initialData,
  onSubmit,
  onSave,
  isLoading = false,
  className,
}: WeddingInfoFormProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(FORM_SECTIONS.filter(s => s.expanded).map(s => s.id))
  );
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<WeddingInfoFormData>({
    resolver: zodResolver(weddingInfoSchema) as any,
    defaultValues: {
      groomName: initialData?.groomName || '',
      brideName: initialData?.brideName || '',
      weddingDate: initialData?.weddingDate || '',
      weddingTime: initialData?.weddingTime || '',
      venueName: initialData?.venueName || '',
      venueAddress: initialData?.venueAddress || '',
      venueHall: initialData?.venueHall || '',
      groomContact: initialData?.groomContact || '',
      brideContact: initialData?.brideContact || '',
      groomParents: initialData?.groomParents || '',
      brideParents: initialData?.brideParents || '',
      customMessage: initialData?.customMessage || '',
      dressCode: initialData?.dressCode || '',
      parkingInfo: initialData?.parkingInfo || '',
      mealInfo: initialData?.mealInfo || '',
      specialNotes: initialData?.specialNotes || '',
      rsvpEnabled: initialData?.rsvpEnabled ?? true,
      rsvpDeadline: initialData?.rsvpDeadline || '',
      accountInfo: initialData?.accountInfo || '',
      backgroundImageUrl: initialData?.backgroundImageUrl || '',
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // 섹션 확장/축소 토글
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // 폼 제출 핸들러
  const handleFormSubmit = (data: WeddingInfoFormData) => {
    onSubmit(data);
    toast.success('결혼식 정보가 저장되었습니다.');
  };

  // 임시 저장 핸들러
  const handleSave = () => {
    if (onSave) {
      onSave(watchedValues);
      toast.success('임시 저장되었습니다.');
    }
  };

  // 연락처 포맷팅
  const handlePhoneChange = (field: 'groomContact' | 'brideContact') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue(field, formatted);
  };

  // 필드 렌더링
  const renderField = (fieldName: keyof WeddingInfoFormData) => {
    const config = FORM_FIELD_CONFIG[fieldName];
    const error = errors[fieldName];

    const commonProps = {
      id: fieldName,
      ...register(fieldName),
      placeholder: config.placeholder,
      className: cn(
        'transition-colors',
        error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
      ),
    };

    switch (config.type) {
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {config.label}
              {config.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <textarea
              {...commonProps}
              rows={3}
              className={cn(
                'w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                commonProps.className
              )}
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                {error.message}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                {...commonProps}
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor={fieldName} className="text-sm font-medium">
                {config.label}
              </Label>
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                {error.message}
              </p>
            )}
          </div>
        );

      case 'tel':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {config.label}
              {config.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="tel"
              onChange={handlePhoneChange(fieldName as 'groomContact' | 'brideContact')}
              className="h-10"
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                {error.message}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {config.label}
              {config.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type={config.type}
              className="h-10"
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                {error.message}
              </p>
            )}
          </div>
        );
    }
  };

  // 미리보기 모드 렌더링
  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {watchedValues.groomName && watchedValues.brideName
            ? `${watchedValues.groomName} ❤ ${watchedValues.brideName}`
            : '신랑 ❤ 신부'}
        </h2>
        {watchedValues.weddingDate && (
          <p className="text-lg text-gray-600 mb-1">
            {formatDate(watchedValues.weddingDate)}
          </p>
        )}
        {watchedValues.weddingTime && (
          <p className="text-lg text-gray-600 mb-4">
            {formatTime(watchedValues.weddingTime)}
          </p>
        )}
        {watchedValues.venueName && (
          <p className="text-lg text-gray-700 font-medium">
            {watchedValues.venueName}
            {watchedValues.venueHall && ` • ${watchedValues.venueHall}`}
          </p>
        )}
        {watchedValues.venueAddress && (
          <p className="text-sm text-gray-600 mt-2">
            {watchedValues.venueAddress}
          </p>
        )}
      </div>

      {watchedValues.customMessage && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-gray-700 text-center leading-relaxed">
            {watchedValues.customMessage}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(watchedValues.groomContact || watchedValues.brideContact) && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              연락처
            </h3>
            <div className="space-y-2 text-sm">
              {watchedValues.groomContact && (
                <p>신랑: {watchedValues.groomContact}</p>
              )}
              {watchedValues.brideContact && (
                <p>신부: {watchedValues.brideContact}</p>
              )}
            </div>
          </Card>
        )}

        {(watchedValues.groomParents || watchedValues.brideParents) && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              부모님
            </h3>
            <div className="space-y-2 text-sm">
              {watchedValues.groomParents && (
                <p>신랑: {watchedValues.groomParents}</p>
              )}
              {watchedValues.brideParents && (
                <p>신부: {watchedValues.brideParents}</p>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        {watchedValues.dressCode && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">드레스코드</h3>
            <p className="text-sm text-gray-600">{watchedValues.dressCode}</p>
          </Card>
        )}

        {watchedValues.parkingInfo && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Car className="h-4 w-4 mr-2" />
              주차 안내
            </h3>
            <p className="text-sm text-gray-600">{watchedValues.parkingInfo}</p>
          </Card>
        )}

        {watchedValues.mealInfo && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Utensils className="h-4 w-4 mr-2" />
              식사 정보
            </h3>
            <p className="text-sm text-gray-600">{watchedValues.mealInfo}</p>
          </Card>
        )}

        {watchedValues.specialNotes && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">특별 안내사항</h3>
            <p className="text-sm text-gray-600">{watchedValues.specialNotes}</p>
          </Card>
        )}

        {watchedValues.accountInfo && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              계좌 정보
            </h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {watchedValues.accountInfo}
            </p>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">결혼식 정보</h1>
          <p className="text-gray-600 mt-1">
            청첩장에 표시될 결혼식 정보를 입력하세요
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2"
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{previewMode ? '편집' : '미리보기'}</span>
          </Button>
          {onSave && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSave}
              disabled={!isDirty || isLoading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>임시저장</span>
            </Button>
          )}
        </div>
      </div>

      {previewMode ? (
        renderPreview()
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6">
          {FORM_SECTIONS.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {section.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {expandedSections.has(section.id) && (
                <div className="p-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((field) => (
                      <div key={field} className={cn(
                        FORM_FIELD_CONFIG[field].type === 'textarea' ? 'md:col-span-2' : ''
                      )}>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  저장 중...
                </>
              ) : (
                '저장하기'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}