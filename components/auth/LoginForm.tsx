'use client';

import { Car, Globe2, KeyRound, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSocialJoinMutation } from '@/hooks/useAuthMutations';
import type { SocialProvider } from '@/lib/auth/auth-api';

const providerLabels: Record<SocialProvider, string> = {
  kakao: '카카오로 계속하기',
  google: '구글로 계속하기',
};

function createMockOAuthToken(provider: SocialProvider) {
  return `mock-${provider}-oauth-token`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function LoginForm() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const joinMutation = useSocialJoinMutation();

  const handleSocialLogin = async (provider: SocialProvider) => {
    const trimmedInviteCode = inviteCode.trim().toUpperCase();
    const trimmedCompanyEmail = companyEmail.trim();

    if (!trimmedInviteCode) {
      setValidationMessage('초대 코드를 입력해주세요.');
      return;
    }

    if (!trimmedCompanyEmail) {
      setValidationMessage('회사 이메일을 입력해주세요.');
      return;
    }

    if (!isValidEmail(trimmedCompanyEmail)) {
      setValidationMessage('올바른 회사 이메일을 입력해주세요.');
      return;
    }

    setValidationMessage('');

    try {
      await joinMutation.mutateAsync({
        inviteCode: trimmedInviteCode,
        companyEmail: trimmedCompanyEmail,
        provider,
        oauthToken: createMockOAuthToken(provider),
      });
      router.push('/profile/setup');
    } catch (error) {
      setValidationMessage(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-page-mobile py-8 sm:px-page-tablet">
      <Card className="border-gray-100 shadow-lg">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
            <Car className="size-8" aria-hidden="true" />
          </div>
          <h1 className="text-h1 font-bold text-gray-900">Ridy</h1>
          <CardDescription className="text-body text-gray-500">함께 타는 출퇴근</CardDescription>
        </CardHeader>
        <CardContent className="space-y-gap-normal">
          <div className="space-y-2">
            <label htmlFor="invite-code" className="text-small font-semibold text-gray-900">
              초대 코드
            </label>
            <Input
              id="invite-code"
              aria-label="초대 코드"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              placeholder="회사 초대 코드 입력"
              autoComplete="one-time-code"
              className="h-input text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company-email" className="text-small font-semibold text-gray-900">
              회사 이메일
            </label>
            <Input
              id="company-email"
              aria-label="회사 이메일"
              type="email"
              value={companyEmail}
              onChange={(event) => setCompanyEmail(event.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              className="h-input text-base"
            />
            {validationMessage ? <p className="text-small text-danger">{validationMessage}</p> : null}
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              className="h-12 w-full bg-[#FEE500] text-gray-900 hover:bg-[#FEE500]/90"
              disabled={joinMutation.isPending}
              onClick={() => void handleSocialLogin('kakao')}
            >
              <MessageCircle className="mr-2 size-4" aria-hidden="true" />
              {providerLabels.kakao}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full"
              disabled={joinMutation.isPending}
              onClick={() => void handleSocialLogin('google')}
            >
              <Globe2 className="mr-2 size-4" aria-hidden="true" />
              {providerLabels.google}
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-small text-gray-500">
            <KeyRound className="mt-0.5 size-4 text-primary" aria-hidden="true" />
            <p>Ridy는 가입 코드와 회사 이메일로만 가입할 수 있습니다.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
