import { Card, CardContent } from '@/components/ui/card';
import type { EcoImpactDashboardQuery } from '@/src/graphql/generated/graphql';

type MonthlyPoint = EcoImpactDashboardQuery['carbonHistory']['monthly'][number];

interface CarbonMonthlyChartProps {
  monthly: ReadonlyArray<MonthlyPoint>;
}

export function CarbonMonthlyChart({ monthly }: CarbonMonthlyChartProps) {
  const maxCo2SavedKg = Math.max(...monthly.map((point) => point.co2SavedKg), 0);

  return (
    <section className="mt-5" aria-labelledby="carbon-monthly-chart-heading">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-caption text-gray-500">최근 카풀 성과</p>
          <h2 id="carbon-monthly-chart-heading" className="text-body font-semibold text-gray-900">
            월별 절감 추이
          </h2>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {monthly.length === 0 ? (
            <div className="rounded-card bg-secondary/5 px-4 py-6 text-center">
              <p className="text-body font-semibold text-gray-900">아직 월별 임팩트가 없습니다</p>
              <p className="mt-1 text-caption text-gray-500">첫 카풀을 완료하면 절감 추이가 쌓입니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthly.map((point) => {
                const width = maxCo2SavedKg === 0 ? 0 : Math.max(8, (point.co2SavedKg / maxCo2SavedKg) * 100);

                return (
                  <div key={point.period} className="space-y-1.5">
                    <div className="flex items-center justify-between text-caption">
                      <span className="font-medium text-gray-700">{point.period}</span>
                      <span className="text-gray-500">{point.totalRides.toLocaleString('ko-KR')}회</span>
                    </div>
                    <div
                      className="h-8 rounded-full bg-gray-100"
                      aria-label={`${point.period} ${formatCarbon(point.co2SavedKg)} CO₂ 절감`}
                    >
                      <div
                        className="flex h-full items-center rounded-full bg-secondary px-3 text-caption font-semibold text-white"
                        style={{ width: `${width}%` }}
                      >
                        {formatCarbon(point.co2SavedKg)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function formatCarbon(value: number): string {
  return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}kg`;
}
