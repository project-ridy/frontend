import { Award, Share2, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { EcoImpactDashboardQuery } from '@/src/graphql/generated/graphql';

type Impact = EcoImpactDashboardQuery['myCarbonImpact'];
type Badge = Impact['badges'][number];

interface CarbonBadgesShareProps {
  impact: Impact;
}

export function CarbonBadgesShare({ impact }: CarbonBadgesShareProps) {
  const [shareStatus, setShareStatus] = useState<string>('');

  const handleShare = async () => {
    const text = createShareText(impact);

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: 'Ridy 친환경 임팩트',
          text,
        });
        setShareStatus('친환경 임팩트를 공유했습니다.');
        return;
      }

      await navigator.clipboard.writeText(text);
      setShareStatus('공유 문구를 클립보드에 복사했습니다.');
    } catch {
      setShareStatus('공유를 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <section className="mt-5" aria-labelledby="carbon-badges-heading">
      <Card className="border-secondary/20 bg-white">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-caption text-gray-500">현재 레벨</p>
              <p className="mt-1 text-h3 text-gray-900">{impact.level}</p>
            </div>
            <Button type="button" size="sm" onClick={handleShare} aria-label="임팩트 공유하기">
              <Share2 aria-hidden="true" size={16} />
              공유
            </Button>
          </div>
          {shareStatus ? (
            <p className="mt-3 rounded-lg bg-secondary/10 px-3 py-2 text-caption text-secondary" role="status" aria-live="polite">
              {shareStatus}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="mb-3 mt-5 flex items-center justify-between">
        <div>
          <p className="text-caption text-gray-500">누적 성취</p>
          <h2 id="carbon-badges-heading" className="text-body font-semibold text-gray-900">
            친환경 배지
          </h2>
        </div>
        <Award aria-hidden="true" size={18} className="text-secondary" />
      </div>

      {impact.badges.length === 0 ? (
        <Card>
          <CardContent className="p-5 text-center">
            <Sparkles aria-hidden="true" size={22} className="mx-auto text-secondary" />
            <p className="mt-2 text-body font-semibold text-gray-900">아직 획득한 배지가 없습니다</p>
            <p className="mt-1 text-caption text-gray-500">카풀을 더 완료하면 친환경 배지를 받을 수 있어요.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {impact.badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </section>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <Award aria-hidden="true" size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-body font-semibold text-gray-900">{badge.label}</p>
          <p className="mt-1 text-caption text-gray-500">{badge.description}</p>
          {badge.achievedAt ? <p className="mt-2 text-caption text-gray-400">{formatBadgeDate(badge.achievedAt)} 획득</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function createShareText(impact: Impact): string {
  return `Ridy에서 ${formatNumber(impact.co2SavedKg)}kg CO₂를 절감하고 ${formatNumber(impact.treeEquivalent)}그루만큼의 임팩트를 만들었어요.`;
}

function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR', {
    maximumFractionDigits: 2,
  });
}

function formatBadgeDate(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return '날짜 정보 없음';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
