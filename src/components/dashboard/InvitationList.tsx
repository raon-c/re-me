'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Edit,
  Share2,
  MoreVertical,
  Calendar,
  Users,
  Heart,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getUserInvitationsAction, deleteInvitationAction } from '@/actions/safe-invitation-actions';
import type { Invitation } from '@/types';

// AIDEV-NOTE: 대시보드용 청첩장 목록 컴포넌트
// 사용자의 모든 청첩장을 목록으로 표시하고 관리 기능 제공

interface InvitationListProps {
  limit?: number;
  showHeader?: boolean;
}

interface InvitationWithStats extends Invitation {
  viewCount?: number;
  rsvpCount?: number;
}

export function InvitationList({ limit, showHeader = true }: InvitationListProps) {
  const [invitations, setInvitations] = useState<InvitationWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const result = await getUserInvitationsAction({ page: 1, limit: limit || 10 });
      
      if (result?.data) {
        setInvitations(result.data.invitations);
      }
    } catch {
      toast.error('청첩장 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (invitationId: string) => {
    if (!confirm('정말 이 청첩장을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await deleteInvitationAction({ id: invitationId });
      
      if (result?.data) {
        toast.success('청첩장이 삭제되었습니다.');
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      } else {
        toast.error('청첩장 삭제에 실패했습니다.');
      }
    } catch {
      toast.error('청첩장 삭제 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-100 text-green-800">공개됨</Badge>;
      case 'draft':
        return <Badge variant="secondary">임시저장</Badge>;
      default:
        return <Badge variant="outline">미정</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">내 청첩장</h2>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        {showHeader && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">내 청첩장</h2>
            <Link href="/templates">
              <Button>
                <Heart className="h-4 w-4 mr-2" />
                첫 청첩장 만들기
              </Button>
            </Link>
          </div>
        )}
        <div className="max-w-md mx-auto">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            아직 청첩장이 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            첫 번째 청첩장을 만들어 소중한 사람들을 초대해보세요.
          </p>
          <Link href="/templates">
            <Button size="lg">
              <Heart className="h-5 w-5 mr-2" />
              청첩장 만들기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">내 청첩장</h2>
          <Link href="/templates">
            <Button>
              <Heart className="h-4 w-4 mr-2" />
              새 청첩장 만들기
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg line-clamp-1">
                    {invitation.groomName} ♥ {invitation.brideName}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {invitation.weddingDate ? formatDate(invitation.weddingDate) : '날짜 미정'}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/invitation/edit/${invitation.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        편집
                      </Link>
                    </DropdownMenuItem>
                    {invitation.status === 'published' && (
                      <DropdownMenuItem asChild>
                        <Link href={`/i/${invitation.invitationCode}`} target="_blank">
                          <Eye className="h-4 w-4 mr-2" />
                          미리보기
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(invitation.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* 청첩장 미리보기 이미지 */}
              <div className="aspect-[3/4] bg-gradient-to-br from-pink-50 to-blue-50 rounded-lg mb-4 overflow-hidden">
                {invitation.thumbnailUrl ? (
                  <Image
                    src={invitation.thumbnailUrl}
                    alt="청첩장 미리보기"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Heart className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* 상태 및 통계 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getStatusBadge(invitation.status)}
                  <span className="text-xs text-gray-500">
                    {invitation.createdAt ? new Date(invitation.createdAt).toLocaleDateString('ko-KR') : ''}
                  </span>
                </div>

                {/* 통계 정보 */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{invitation.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{invitation.rsvpCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{invitation.weddingVenue || '장소 미정'}</span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/invitation/edit/${invitation.id}`}>
                      <Edit className="h-3 w-3 mr-1" />
                      편집
                    </Link>
                  </Button>
                  
                  {invitation.status === 'published' && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Link href={`/i/${invitation.invitationCode}`} target="_blank">
                        <Share2 className="h-3 w-3 mr-1" />
                        공유
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {limit && invitations.length >= limit && (
        <div className="text-center pt-4">
          <Link href="/dashboard">
            <Button variant="outline">
              모든 청첩장 보기
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}