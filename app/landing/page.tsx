import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, Car, CheckCircle2, Leaf, ReceiptText, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Ridy - 함께 타는 출퇴근 카풀',
  description: '같은 회사 동료와 안전하게 출퇴근 카풀을 찾고 정산까지 한 번에 관리하는 친환경 카풀 서비스 Ridy.',
  openGraph: {
    title: 'Ridy - 함께 타는 출퇴근 카풀',
    description: '같은 회사 동료와 안전하게 출퇴근 카풀을 찾고 정산까지 한 번에 관리하세요.',
    type: 'website',
    url: '/landing',
    siteName: 'Ridy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ridy - 함께 타는 출퇴근 카풀',
    description: '같은 회사 동료와 안전하게 출퇴근 카풀을 찾고 정산까지 한 번에 관리하세요.',
  },
};

const proofStats = [
  { label: '평점 4.8', description: '검증된 동료 카풀 경험' },
  { label: '운행 12,400회', description: '누적 출퇴근 매칭' },
  { label: 'CO₂ 8.2t 절감', description: '함께 줄인 탄소 배출' },
];

const features = [
  {
    title: '카풀 매칭',
    description: '같은 회사 구성원끼리 출발지, 도착지, 시간대를 맞춰 안전하게 연결합니다.',
    icon: Car,
  },
  {
    title: '자동 정산',
    description: '탑승 후 요금과 회사 부담금을 투명하게 나누고 정산 상태를 한눈에 확인합니다.',
    icon: ReceiptText,
  },
  {
    title: '친환경 임팩트',
    description: '함께 탄 거리만큼 절감한 탄소량을 기록해 회사 ESG 활동으로 연결합니다.',
    icon: Leaf,
  },
];

const steps = [
  {
    title: '1. 초대 코드 가입',
    description: '회사에서 발급한 초대 코드로 구성원만 안전하게 시작합니다.',
  },
  {
    title: '2. 출퇴근 경로 매칭',
    description: '자주 가는 경로와 시간을 입력해 맞는 동료 카풀을 찾습니다.',
  },
  {
    title: '3. 함께 탑승하고 정산',
    description: '채팅으로 약속을 확인하고 운행 후 정산과 리뷰까지 마무리합니다.',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Ridy',
      url: '/landing',
      slogan: '함께 타는 길',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Ridy',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: metadata.description,
    },
  ],
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-muted text-text-primary">
      <script
        type="application/ld+json"
        data-testid="landing-structured-data"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/landing" className="text-h3 font-bold text-primary" aria-label="Ridy 랜딩 홈">
          Ridy
        </Link>
        <nav className="hidden items-center gap-6 text-caption font-medium text-text-tertiary sm:flex" aria-label="랜딩 내비게이션">
          <a href="#features" className="hover:text-text-primary">
            서비스
          </a>
          <a href="#how-it-works" className="hover:text-text-primary">
            이용 방법
          </a>
          <a href="#proof" className="hover:text-text-primary">
            임팩트
          </a>
        </nav>
        <Link href="/login" className={cn(buttonVariants(), 'h-10')}>
          시작하기
        </Link>
      </header>

      <section className="relative overflow-hidden px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-16" aria-labelledby="landing-hero-heading">
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/10">
              회사 전용 출퇴근 카풀
            </Badge>
            <h1 id="landing-hero-heading" className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-text-primary sm:text-6xl">
              함께 타는 출퇴근, 더 가벼운 하루
            </h1>
            <p className="mt-5 max-w-2xl text-body leading-7 text-text-secondary sm:text-lg">
              같은 회사 동료와 안전하게 매칭하고, 정산까지 한 번에 관리하세요.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-caption font-semibold text-text-secondary">
              <span className="rounded-pill bg-white/75 px-3 py-1 shadow-1">초대 코드 인증</span>
              <span className="rounded-pill bg-white/75 px-3 py-1 shadow-1">회사 단위 보호</span>
              <span className="rounded-pill bg-white/75 px-3 py-1 shadow-1">운행 후 자동 정산</span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className={cn(buttonVariants(), 'h-12 px-6 text-body')}>
                초대 코드로 시작하기 <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <a href="#how-it-works" className={cn(buttonVariants({ variant: 'secondary' }), 'h-12 px-6 text-body')}>
                서비스 보기
              </a>
            </div>
          </div>

          <Card className="border-border-default bg-surface shadow-2">
            <CardContent className="p-5 sm:p-6">
              <div className="rounded-ridy-2xl bg-primary p-5 text-white shadow-1">
                <p className="text-caption text-white/80">오늘의 추천 카풀</p>
                <p className="mt-2 text-h2">강남역 → 판교역</p>
                <p className="mt-2 text-caption text-white/80">08:30 출발 · 2석 남음 · 같은 회사 인증</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3" id="proof">
                {proofStats.map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-gray-50 p-3">
                    <p className="text-body font-semibold text-gray-900">{stat.label}</p>
                    <p className="mt-1 text-small text-gray-500">{stat.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="features" className="px-5 py-12 sm:px-8 sm:py-16" aria-labelledby="features-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-caption font-semibold text-primary">서비스 소개</p>
            <h2 id="features-heading" className="mt-2 text-h2 text-gray-900">
              출퇴근 카풀에 필요한 흐름을 하나로
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title}>
                  <CardContent className="p-5">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon aria-hidden="true" size={22} />
                    </div>
                    <h3 className="mt-4 text-h3 text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-caption leading-6 text-gray-500">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white px-5 py-12 sm:px-8 sm:py-16" aria-labelledby="steps-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-caption font-semibold text-secondary">이용 방법</p>
            <h2 id="steps-heading" className="mt-2 text-h2 text-gray-900">
              가입부터 탑승까지 3단계
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-card border border-gray-100 bg-gray-50 p-5">
                <CheckCircle2 aria-hidden="true" className="text-secondary" size={22} />
                <h3 className="mt-4 text-body font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-caption leading-6 text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16" aria-labelledby="trust-heading">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <Building2 aria-hidden="true" className="text-primary" size={26} />
              <h2 id="trust-heading" className="mt-4 text-h2 text-gray-900">
                회사 구성원만 연결되는 안전한 카풀
              </h2>
              <p className="mt-3 text-body leading-7 text-gray-500">
                초대 코드 기반 가입과 회사 단위 데이터 격리로 낯선 공개 카풀보다 예측 가능한 출퇴근 경험을 제공합니다.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-secondary text-white">
            <CardContent className="p-6">
              <Leaf aria-hidden="true" size={28} className="text-white/80" />
              <p className="mt-4 text-h2">8.2t</p>
              <p className="mt-2 text-caption text-white/80">누적 CO₂ 절감 추정치</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-24" aria-labelledby="bottom-cta-heading">
        <div className="mx-auto max-w-6xl rounded-3xl bg-gray-900 p-6 text-white sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 id="bottom-cta-heading" className="text-h2 text-white">
                오늘 출근길부터 함께 타세요
              </h2>
              <p className="mt-3 max-w-2xl text-body text-white/70">
                회사 초대 코드가 있다면 바로 시작할 수 있습니다. 동료와 경로를 맞추고 더 가벼운 출퇴근을 만들어보세요.
              </p>
            </div>
            <Link
              href="/login"
              className={cn(buttonVariants(), 'h-12 bg-white px-6 text-body text-gray-900 hover:bg-gray-100')}
            >
              Ridy 시작하기
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white px-5 py-8 sm:px-8" role="contentinfo">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-caption text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-body font-bold text-primary">Ridy</p>
            <p className="mt-1">함께 타는 길</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1"><ShieldCheck aria-hidden="true" size={14} /> 회사 전용</span>
            <span>보안</span>
            <span>문의</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
