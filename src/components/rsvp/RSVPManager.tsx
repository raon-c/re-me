'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Search,
  Download,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { getInvitationRsvpResponsesAction, exportRsvpDataAction } from '@/actions/safe-rsvp-actions';

// AIDEV-NOTE: RSVP 관리 컴포넌트 (신랑신부용)
// 모든 RSVP 응답을 조회하고 관리하는 기능

interface RSVPResponse {
  id: string;
  guestName: string;
  guestPhone?: string;
  attendanceStatus: 'attending' | 'not_attending';
  adultCount: number;
  childCount: number;
  dietaryRestrictions?: string;
  message?: string;
  createdAt: string;
}

interface RSVPStats {
  totalResponses: number;
  attendingCount: number;
  notAttendingCount: number;
  totalGuests: number;
  adultGuests: number;
  childGuests: number;
}

interface RSVPManagerProps {
  invitationId: string;
}

export function RSVPManager({ invitationId }: RSVPManagerProps) {
  const [responses, setResponses] = useState<RSVPResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<RSVPResponse[]>([]);
  const [stats, setStats] = useState<RSVPStats>({
    totalResponses: 0,
    attendingCount: 0,
    notAttendingCount: 0,
    totalGuests: 0,
    adultGuests: 0,
    childGuests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attending' | 'not_attending'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const loadRSVPData = async () => {
    try {
      setIsLoading(true);
      const result = await getInvitationRsvpResponsesAction({
        invitationId,
        page: 1,
        limit: 1000, // 모든 응답 로드
      });

      if (result?.data) {
        const rsvpData = result.data.responses;
        setResponses(rsvpData);
        calculateStats(rsvpData);
      }
    } catch {
      toast.error('RSVP 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (rsvpData: RSVPResponse[]) => {
    const attendingResponses = rsvpData.filter(r => r.attendanceStatus === 'attending');
    const notAttendingResponses = rsvpData.filter(r => r.attendanceStatus === 'not_attending');
    
    const totalGuests = attendingResponses.reduce((sum, r) => sum + r.adultCount + r.childCount, 0);
    const adultGuests = attendingResponses.reduce((sum, r) => sum + r.adultCount, 0);
    const childGuests = attendingResponses.reduce((sum, r) => sum + r.childCount, 0);

    setStats({
      totalResponses: rsvpData.length,
      attendingCount: attendingResponses.length,
      notAttendingCount: notAttendingResponses.length,
      totalGuests,
      adultGuests,
      childGuests,
    });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const result = await exportRsvpDataAction({ id: invitationId });
      
      if (result?.data) {
        // CSV 다운로드 처리
        const blob = new Blob([result.data.csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `rsvp-responses-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        toast.success('RSVP 데이터가 다운로드되었습니다.');
      } else {
        toast.error('데이터 내보내기에 실패했습니다.');
      }
    } catch {
      toast.error('데이터 내보내기 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'attending') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          참석
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <XCircle className="w-3 h-3 mr-1" />
          불참
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 필터링 로직
  useEffect(() => {
    let filtered = responses;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(
        response =>
          response.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          response.guestPhone?.includes(searchTerm) ||
          response.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(response => response.attendanceStatus === statusFilter);
    }

    setFilteredResponses(filtered);
  }, [responses, searchTerm, statusFilter]);

  useEffect(() => {
    loadRSVPData();
  }, [invitationId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 응답</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">참석</p>
                <p className="text-2xl font-bold text-gray-900">{stats.attendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">불참</p>
                <p className="text-2xl font-bold text-gray-900">{stats.notAttendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">참석 인원</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGuests}</p>
                <p className="text-xs text-gray-500">
                  성인 {stats.adultGuests}명, 어린이 {stats.childGuests}명
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>RSVP 응답 목록</CardTitle>
            <Button onClick={handleExport} disabled={isExporting} variant="outline">
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  내보내는 중...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  CSV 다운로드
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="이름, 연락처, 메시지로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                전체
              </Button>
              <Button
                variant={statusFilter === 'attending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('attending')}
              >
                참석
              </Button>
              <Button
                variant={statusFilter === 'not_attending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('not_attending')}
              >
                불참
              </Button>
            </div>
          </div>

          {/* 응답 테이블 */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>인원</TableHead>
                  <TableHead>메시지</TableHead>
                  <TableHead>응답일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">
                      {response.guestName}
                    </TableCell>
                    <TableCell>
                      {response.guestPhone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {response.guestPhone}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(response.attendanceStatus)}
                    </TableCell>
                    <TableCell>
                      {response.attendanceStatus === 'attending' ? (
                        <div className="text-sm">
                          <div>총 {response.adultCount + response.childCount}명</div>
                          {response.adultCount > 0 && (
                            <div className="text-gray-500">성인 {response.adultCount}명</div>
                          )}
                          {response.childCount > 0 && (
                            <div className="text-gray-500">어린이 {response.childCount}명</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {response.message ? (
                        <div className="max-w-xs">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MessageSquare className="h-3 w-3" />
                            <span className="text-sm truncate">{response.message}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(response.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredResponses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? '검색 조건에 맞는 응답이 없습니다.'
                : '아직 RSVP 응답이 없습니다.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}