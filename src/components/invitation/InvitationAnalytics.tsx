'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Share2, Users, Calendar, Download, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  views: number;
  shares: number;
  rsvpResponses: number;
  totalGuests: number;
  viewsByDate: { date: string; count: number }[];
  sharesByPlatform: { platform: string; count: number }[];
}

interface InvitationAnalyticsProps {
  invitationId: string;
}

// AIDEV-NOTE: 청첩장 분석 컴포넌트 - 조회수, 공유 현황, RSVP 통계 제공
export function InvitationAnalytics({ invitationId }: InvitationAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'all'>('7d');

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement analytics loading from API
      // const result = await getInvitationAnalyticsAction({ invitationId, period: selectedPeriod });
      
      // Mock data for now
      const mockData: AnalyticsData = {
        views: 156,
        shares: 23,
        rsvpResponses: 45,
        totalGuests: 67,
        viewsByDate: [
          { date: '2024-01-01', count: 12 },
          { date: '2024-01-02', count: 18 },
          { date: '2024-01-03', count: 25 },
          { date: '2024-01-04', count: 31 },
          { date: '2024-01-05', count: 22 },
          { date: '2024-01-06', count: 28 },
          { date: '2024-01-07', count: 20 },
        ],
        sharesByPlatform: [
          { platform: '카카오톡', count: 15 },
          { platform: '문자메시지', count: 5 },
          { platform: '이메일', count: 3 },
        ],
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [invitationId, selectedPeriod]);

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = [
      ['구분', '값'],
      ['총 조회수', analytics.views.toString()],
      ['총 공유수', analytics.shares.toString()],
      ['RSVP 응답수', analytics.rsvpResponses.toString()],
      ['총 게스트수', analytics.totalGuests.toString()],
      [''],
      ['날짜별 조회수', ''],
      ...analytics.viewsByDate.map(item => [item.date, item.count.toString()]),
      [''],
      ['플랫폼별 공유수', ''],
      ...analytics.sharesByPlatform.map(item => [item.platform, item.count.toString()]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `invitation_analytics_${invitationId}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">분석 데이터를 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">분석</h2>
          <p className="text-gray-600">청첩장 조회 및 응답 현황을 확인하세요</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | 'all')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
            <option value="all">전체</option>
          </select>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 조회수</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.views}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Share2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 공유수</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.shares}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">RSVP 응답</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.rsvpResponses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 게스트</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalGuests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views by Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              날짜별 조회수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.viewsByDate.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString('ko-KR')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-2 bg-blue-500 rounded"
                      style={{ width: `${(item.count / Math.max(...analytics.viewsByDate.map(d => d.count))) * 100}px` }}
                    />
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shares by Platform */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              플랫폼별 공유
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.sharesByPlatform.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.platform}</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-2 bg-green-500 rounded"
                      style={{ width: `${(item.count / Math.max(...analytics.sharesByPlatform.map(p => p.count))) * 80}px` }}
                    />
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Rate */}
      <Card>
        <CardHeader>
          <CardTitle>응답률 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalGuests > 0 ? Math.round((analytics.rsvpResponses / analytics.totalGuests) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">전체 응답률</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{analytics.rsvpResponses}</p>
              <p className="text-sm text-gray-600">응답 완료</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">
                {analytics.totalGuests - analytics.rsvpResponses}
              </p>
              <p className="text-sm text-gray-600">응답 대기</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${analytics.totalGuests > 0 ? (analytics.rsvpResponses / analytics.totalGuests) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}