import { Car, CheckCircle2, Leaf, Link2, ShieldCheck, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const brandKeywords = [
  { label: '안전', icon: ShieldCheck },
  { label: '편리', icon: CheckCircle2 },
  { label: '친환경', icon: Leaf },
  { label: '연결', icon: Link2 },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-page-mobile py-8 sm:px-page-tablet lg:px-page-desktop">
      <section className="space-y-gap-loose" aria-labelledby="brand-heading">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-3xl bg-primary text-white shadow-lg shadow-blue-600/20">
            <Car aria-hidden="true" size={40} strokeWidth={2.4} />
          </div>
          <h1 id="brand-heading" className="text-h1 text-gray-900">
            Ridy
          </h1>
          <p className="mt-2 text-h3 text-primary">함께 타는 길</p>
          <p className="mt-3 text-caption text-gray-500">안전하고 편리한 카풀을 더 친환경적으로 연결해요.</p>
        </div>

        <Card>
          <CardContent className="space-y-gap-normal p-4">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Sparkles aria-hidden="true" size={20} />
              </div>
              <div>
                <h2 className="text-h3 text-gray-900">오늘의 이동을 가볍게</h2>
                <p className="mt-1 text-caption text-gray-500">검증된 소셜 계정으로 빠르게 시작하세요.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-gap-tight" aria-label="Ridy 핵심 가치">
              {brandKeywords.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-caption font-medium text-gray-900">
                  <Icon aria-hidden="true" className="text-primary" size={18} />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-gap-tight pt-1">
              <Button className="h-12 w-full bg-[#FEE500] text-gray-900 font-semibold hover:bg-[#F7DC00] active:bg-[#E5CC00]">
                카카오 로그인
              </Button>
              <Button variant="outline" className="h-12 w-full font-semibold">
                구글 로그인
              </Button>
            </div>

            <p className="text-center text-small text-gray-500">회원가입 없이 소셜 계정으로 바로 시작</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
