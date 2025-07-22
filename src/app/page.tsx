'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  Smartphone,
  Leaf,
  Share2,
  Users,
  Calendar,
  MapPin,
  MessageCircle,
  Star,
  CheckCircle,
  Play,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-full px-4 py-2 mb-8 shadow-lg">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">
                한국 1위 모바일 청첩장 서비스
              </span>
              <Award className="w-4 h-4 text-pink-500" />
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                사랑을 전하는
              </span>
              <br />
              <span className="text-gray-800">디지털 청첩장</span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-4 leading-relaxed max-w-3xl mx-auto">
              스마트폰으로 3분만에 완성하는 아름다운 청첩장
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              환경친화적이고 비용 효율적인 새로운 방식으로 소중한 순간을
              공유하세요
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link href="/templates" className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  무료로 시작하기
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 px-10 py-4 text-lg font-semibold backdrop-blur-sm bg-white/80"
              >
                <Link href="/templates" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  라이브 데모 보기
                </Link>
              </Button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl font-bold text-pink-600 mb-2">15+</div>
                <div className="text-sm text-gray-600 font-medium">
                  프리미엄 템플릿
                </div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  5,000+
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  행복한 커플
                </div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  99.9%
                </div>
                <div className="text-sm text-gray-600 font-medium">만족도</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  24/7
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  고객 지원
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>SSL 보안 인증</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>개인정보보호 인증</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>월 성장률 150%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              왜 모바일 청첩장인가요?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              전통적인 종이 청첩장의 한계를 뛰어넘는 스마트한 선택
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  환경친화적
                </h3>
                <p className="text-gray-600">
                  종이 사용 없이 디지털로 제작하여 환경을 보호하고 지속가능한
                  결혼식을 만들어보세요.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  모바일 최적화
                </h3>
                <p className="text-gray-600">
                  스마트폰에서 완벽하게 작동하는 터치 친화적 인터페이스로 언제
                  어디서나 쉽게 편집하세요.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Share2 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  간편한 공유
                </h3>
                <p className="text-gray-600">
                  카카오톡, SMS, 이메일로 한 번에 전송하고 실시간으로 참석
                  여부를 확인하세요.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  실시간 RSVP
                </h3>
                <p className="text-gray-600">
                  게스트들의 참석 여부와 메시지를 실시간으로 확인하고 관리할 수
                  있습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  위치 정보
                </h3>
                <p className="text-gray-600">
                  카카오맵 연동으로 예식장 위치와 교통편 정보를 쉽게 제공할 수
                  있습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  일정 관리
                </h3>
                <p className="text-gray-600">
                  결혼식 일정을 게스트들의 캘린더에 자동으로 추가할 수 있는
                  기능을 제공합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              3단계로 완성하는 청첩장
            </h2>
            <p className="text-lg text-gray-600">
              복잡한 과정 없이 간단하게 나만의 청첩장을 만들어보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                템플릿 선택
              </h3>
              <p className="text-gray-600">
                15가지 아름다운 템플릿 중에서 마음에 드는 디자인을 선택하세요.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                내용 편집
              </h3>
              <p className="text-gray-600">
                신랑신부 정보, 예식 일정, 장소 등을 간단하게 입력하고
                편집하세요.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                공유하기
              </h3>
              <p className="text-gray-600">
                완성된 청첩장을 카카오톡, SMS, 이메일로 손쉽게 공유하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Preview Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              다양한 템플릿
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              클래식부터 모던까지, 당신의 스타일에 맞는 완벽한 디자인
            </p>
            <Button
              asChild
              variant="outline"
              className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              <Link href="/templates">모든 템플릿 보기</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: '클래식',
                gradient: 'from-amber-100 to-orange-200',
                icon: '💒',
                count: '4개',
                description: '전통적이고 우아한',
              },
              {
                name: '모던',
                gradient: 'from-blue-100 to-indigo-200',
                icon: '✨',
                count: '4개',
                description: '세련되고 현대적인',
              },
              {
                name: '로맨틱',
                gradient: 'from-pink-100 to-rose-200',
                icon: '🌹',
                count: '4개',
                description: '감성적이고 따뜻한',
              },
              {
                name: '미니멀',
                gradient: 'from-gray-100 to-slate-200',
                icon: '🤍',
                count: '4개',
                description: '깔끔하고 심플한',
              },
            ].map((category, index) => (
              <Card
                key={category.name}
                className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group overflow-hidden"
              >
                <CardContent className="p-6">
                  <div
                    className={`aspect-[3/4] bg-gradient-to-br ${category.gradient} rounded-xl mb-4 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}
                  >
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <div className="text-6xl opacity-10 absolute -bottom-4 -right-4 group-hover:rotate-12 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-600">
                      {category.count}
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-center mb-1 text-lg">
                    {category.name}
                  </h4>
                  <p className="text-sm text-gray-500 text-center">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              간단하고 투명한 가격
            </h2>
            <p className="text-lg text-gray-600">
              필요한 기능만 선택해서 사용하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    무료 플랜
                  </h3>
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    ₩0
                  </div>
                  <p className="text-gray-600">시작하기에 완벽한</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">기본 템플릿 5개</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">기본 편집 기능</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">URL 링크 공유</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">기본 RSVP 기능</span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full h-12 font-semibold"
                  variant="outline"
                >
                  <Link href="/templates">무료로 시작하기</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-pink-500 shadow-2xl relative bg-white transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  🔥 가장 인기
                </span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    프리미엄
                  </h3>
                  <div className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    ₩29,000
                  </div>
                  <p className="text-gray-600">모든 기능이 포함된</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">프리미엄 템플릿 15개</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">고급 편집 도구</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">카카오톡/SMS 공유</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">실시간 RSVP 관리</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">카카오맵 연동</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">상세 통계 및 분석</span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/templates">프리미엄 시작하기</Link>
                </Button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  💳 30일 환불 보장
                </p>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    기업 플랜
                  </h3>
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    맞춤
                  </div>
                  <p className="text-gray-600">대량 사용자를 위한</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">무제한 커스텀 템플릿</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">브랜딩 완전 제거</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">전담 고객 지원</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">API 및 웹훅 접근</span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full h-12 font-semibold"
                  variant="outline"
                >
                  <Link href="/contact">상담 문의하기</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              실제 후기
            </h2>
            <p className="text-lg text-gray-600">
              모바일 청첩장을 사용한 커플들의 생생한 후기
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: '김○○ & 이○○',
                content:
                  '정말 간편하고 예뻤어요! 게스트들도 모바일로 보기 편하다고 좋아했습니다.',
                rating: 5,
              },
              {
                name: '박○○ & 최○○',
                content:
                  '환경도 생각하고 비용도 절약할 수 있어서 만족합니다. 추천해요!',
                rating: 5,
              },
              {
                name: '정○○ & 강○○',
                content:
                  'RSVP 기능이 정말 유용했어요. 실시간으로 참석 여부를 확인할 수 있어서 좋았습니다.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}&quot;
                  </p>
                  <p className="font-semibold text-gray-900">
                    - {testimonial.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-lg text-gray-600">
              궁금한 점이 있으시면 언제든 문의해주세요
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {[
              {
                question: '정말 무료로 사용할 수 있나요?',
                answer:
                  '네, 기본 기능은 완전히 무료입니다. 5개의 기본 템플릿과 기본 편집 기능, URL 공유, 기본 RSVP 기능을 무료로 이용하실 수 있습니다.',
              },
              {
                question: '모바일에서도 편집이 가능한가요?',
                answer:
                  '물론입니다! 모바일 최적화된 터치 친화적 인터페이스로 스마트폰에서도 쉽게 편집할 수 있습니다. 언제 어디서나 청첩장을 수정하고 관리할 수 있어요.',
              },
              {
                question: '카카오톡으로 공유할 수 있나요?',
                answer:
                  '프리미엄 플랜에서 카카오톡, SMS, 이메일 공유 기능을 제공합니다. 무료 플랜에서는 URL 링크 공유가 가능합니다.',
              },
              {
                question: 'RSVP 응답을 어떻게 관리하나요?',
                answer:
                  '실시간으로 게스트들의 참석 여부와 메시지를 확인할 수 있는 대시보드를 제공합니다. 프리미엄 플랜에서는 더 자세한 통계와 분석 기능도 이용하실 수 있어요.',
              },
              {
                question: '템플릿을 커스터마이징할 수 있나요?',
                answer:
                  '모든 템플릿은 색상, 폰트, 레이아웃을 자유롭게 수정할 수 있습니다. 기업 플랜에서는 완전히 커스텀 템플릿 제작도 가능합니다.',
              },
              {
                question: '결제는 어떻게 하나요?',
                answer:
                  '신용카드, 계좌이체, 카카오페이 등 다양한 결제 수단을 지원합니다. 프리미엄 플랜은 일회성 결제로 평생 이용 가능합니다.',
              },
            ].map((faq, index) => (
              <Card key={index} className="mb-4 border-0 shadow-md">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                  >
                    <h3 className="font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">더 궁금한 점이 있으시나요?</p>
            <Button asChild variant="outline">
              <Link href="/contact" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                문의하기
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-pink-500 via-purple-600 to-pink-500 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-white font-medium">
                지금 시작하면 첫 달 50% 할인
              </span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              당신의 특별한 순간을
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                세상과 공유하세요
              </span>
            </h2>

            <p className="text-xl lg:text-2xl text-pink-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              5,000명 이상의 커플이 선택한 모바일 청첩장으로
              <br />
              소중한 사람들에게 사랑을 전하세요
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                <Clock className="w-8 h-8 mx-auto mb-3" />
                <div className="font-bold text-lg mb-2">3분 완성</div>
                <div className="text-pink-100 text-sm">
                  복잡한 과정 없이 빠르게
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                <Shield className="w-8 h-8 mx-auto mb-3" />
                <div className="font-bold text-lg mb-2">안전 보장</div>
                <div className="text-pink-100 text-sm">
                  SSL 암호화로 데이터 보호
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                <Heart className="w-8 h-8 mx-auto mb-3" />
                <div className="font-bold text-lg mb-2">99.9% 만족</div>
                <div className="text-pink-100 text-sm">검증된 고객 만족도</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white text-pink-600 hover:bg-gray-50 px-12 py-4 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link href="/templates" className="flex items-center gap-3">
                  <Zap className="w-6 h-6" />
                  지금 무료로 시작하기
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-12 py-4 text-xl font-bold backdrop-blur-sm transition-all duration-300"
              >
                <Link href="/templates" className="flex items-center gap-3">
                  <Play className="w-6 h-6" />
                  라이브 데모 보기
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-pink-200 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>신용카드 등록 불필요</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>30일 환불 보장</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>24시간 고객 지원</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Heart className="w-8 h-8 text-pink-400 mr-3" />
                <span className="text-2xl font-bold">모바일 청첩장</span>
              </div>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                스마트폰으로 쉽게 만드는 아름다운 디지털 청첩장
                <br />
                환경친화적이고 비용 효율적인 새로운 방식의 청첩장 서비스
              </p>
              <div className="flex gap-4">
                <Button
                  asChild
                  size="sm"
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Link href="/templates">무료 체험</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/contact">문의하기</Link>
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">서비스</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link
                    href="/templates"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    템플릿
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    대시보드
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    요금제
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    도움말
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">고객지원</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    문의하기
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    이용약관
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2024 모바일 청첩장. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-gray-400 text-sm">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  SSL 보안
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  99.9% 가동률
                </span>
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  Made in Korea
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
