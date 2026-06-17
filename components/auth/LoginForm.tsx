'use client';

import { Car, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useCompleteSignupMutation,
  useLoginMutation,
  useRequestEmailVerificationMutation,
} from '@/hooks/useAuthMutations';

type AuthMode = 'login' | 'signup';

interface VerificationChallengeState {
  id: string;
  companyEmail: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeInviteCode(inviteCode: string) {
  return inviteCode.trim().toUpperCase();
}

function isStrongPassword(password: string) {
  return password.length >= 10 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const requestVerificationMutation = useRequestEmailVerificationMutation();
  const completeSignupMutation = useCompleteSignupMutation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [challenge, setChallenge] = useState<VerificationChallengeState | null>(null);

  const isLoginPending = loginMutation.isPending;
  const isRequestPending = requestVerificationMutation.isPending;
  const isSignupPending = completeSignupMutation.isPending;

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setValidationMessage('');
  };

  const handleLogin = async () => {
    const companyEmail = normalizeEmail(loginEmail);
    const password = loginPassword;

    if (!companyEmail) {
      setValidationMessage('회사 이메일을 입력해주세요.');
      return;
    }

    if (!isValidEmail(companyEmail)) {
      setValidationMessage('올바른 회사 이메일을 입력해주세요.');
      return;
    }

    if (!password) {
      setValidationMessage('비밀번호를 입력해주세요.');
      return;
    }

    setValidationMessage('');

    try {
      await loginMutation.mutateAsync({ companyEmail, password });
      router.push('/');
    } catch (error) {
      setValidationMessage(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    }
  };

  const handleRequestVerification = async () => {
    const normalizedInviteCode = normalizeInviteCode(inviteCode);
    const companyEmail = normalizeEmail(signupEmail);

    if (!normalizedInviteCode) {
      setValidationMessage('초대 코드를 입력해주세요.');
      return;
    }

    if (!companyEmail) {
      setValidationMessage('회사 이메일을 입력해주세요.');
      return;
    }

    if (!isValidEmail(companyEmail)) {
      setValidationMessage('올바른 회사 이메일을 입력해주세요.');
      return;
    }

    setValidationMessage('');

    try {
      const nextChallenge = await requestVerificationMutation.mutateAsync({
        inviteCode: normalizedInviteCode,
        companyEmail,
      });
      setInviteCode(normalizedInviteCode);
      setSignupEmail(companyEmail);
      setChallenge({ id: nextChallenge.id, companyEmail: nextChallenge.companyEmail });
    } catch (error) {
      setValidationMessage(error instanceof Error ? error.message : '인증코드 요청에 실패했습니다.');
    }
  };

  const handleCompleteSignup = async () => {
    const code = verificationCode.trim();

    if (!challenge) {
      setValidationMessage('먼저 인증코드를 요청해주세요.');
      return;
    }

    if (!code) {
      setValidationMessage('인증코드를 입력해주세요.');
      return;
    }

    if (!isStrongPassword(signupPassword)) {
      setValidationMessage('비밀번호는 10자 이상이며 영문과 숫자를 포함해야 합니다.');
      return;
    }

    if (signupPassword !== signupPasswordConfirm) {
      setValidationMessage('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setValidationMessage('');

    try {
      await completeSignupMutation.mutateAsync({
        challengeId: challenge.id,
        verificationCode: code,
        password: signupPassword,
      });
      router.push('/profile/setup');
    } catch (error) {
      setValidationMessage(error instanceof Error ? error.message : '가입에 실패했습니다.');
    }
  };

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center overflow-hidden bg-surface-muted px-page-mobile py-8 sm:px-page-tablet">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.20),transparent_36%),radial-gradient(circle_at_82%_8%,rgba(16,185,129,0.15),transparent_30%)]" />
      <Card className="relative border-white/70 bg-white/90 shadow-4 backdrop-blur-xl">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_18px_36px_rgba(37,99,235,0.28)]">
            <Car className="size-8" aria-hidden="true" />
          </div>
          <h1 className="text-h1 font-bold text-text-primary">Ridy</h1>
          <CardDescription className="text-body text-text-secondary">회사 이메일로 안전하게 이용하세요</CardDescription>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-small font-semibold text-text-secondary">
            <span className="rounded-pill bg-primary-subtle px-3 py-1 text-primary">회사 인증</span>
            <span className="rounded-pill bg-secondary/10 px-3 py-1 text-secondary">안전한 동료 카풀</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-gap-normal">
          <div role="tablist" aria-label="인증 방식" className="grid grid-cols-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                mode === 'login' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary'
              }`}
              onClick={() => handleModeChange('login')}
            >
              로그인
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                mode === 'signup' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary'
              }`}
              onClick={() => handleModeChange('signup')}
            >
              가입
            </button>
          </div>

          {mode === 'login' ? (
            <div role="tabpanel" aria-label="로그인" className="space-y-gap-normal">
              <div className="space-y-2">
                <label htmlFor="login-company-email" className="text-small font-semibold text-gray-900">
                  회사 이메일
                </label>
                <Input
                  id="login-company-email"
                  aria-label="로그인 회사 이메일"
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="h-input text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="text-small font-semibold text-gray-900">
                  비밀번호
                </label>
                <Input
                  id="login-password"
                  aria-label="로그인 비밀번호"
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="비밀번호 입력"
                  autoComplete="current-password"
                  className="h-input text-base"
                />
              </div>

              {validationMessage ? <p className="text-small text-danger">{validationMessage}</p> : null}

              <Button type="button" className="h-12 w-full" disabled={isLoginPending} onClick={() => void handleLogin()}>
                <KeyRound className="mr-2 size-4" aria-hidden="true" />
                로그인
              </Button>
            </div>
          ) : (
            <div role="tabpanel" aria-label="가입" className="space-y-gap-normal">
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
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="h-input text-base"
                />
              </div>

              <Button
                type="button"
                variant={challenge ? 'outline' : 'default'}
                className="h-12 w-full"
                disabled={isRequestPending || Boolean(challenge)}
                onClick={() => void handleRequestVerification()}
              >
                <Mail className="mr-2 size-4" aria-hidden="true" />
                {challenge ? '인증코드 재발송 대기' : '인증코드 받기'}
              </Button>

              {challenge ? (
                <div className="space-y-gap-normal rounded-xl bg-gray-50 p-3">
                  <div className="flex items-start gap-2 text-small text-gray-500">
                    <ShieldCheck className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                    <p>{challenge.companyEmail}로 발송된 인증코드를 입력해주세요.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="verification-code" className="text-small font-semibold text-gray-900">
                      인증코드
                    </label>
                    <Input
                      id="verification-code"
                      aria-label="인증코드"
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value)}
                      placeholder="6자리 코드"
                      autoComplete="one-time-code"
                      className="h-input text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="text-small font-semibold text-gray-900">
                      비밀번호
                    </label>
                    <Input
                      id="signup-password"
                      aria-label="가입 비밀번호"
                      type="password"
                      value={signupPassword}
                      onChange={(event) => setSignupPassword(event.target.value)}
                      placeholder="영문과 숫자를 포함해 10자 이상"
                      autoComplete="new-password"
                      className="h-input text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="signup-password-confirm" className="text-small font-semibold text-gray-900">
                      비밀번호 확인
                    </label>
                    <Input
                      id="signup-password-confirm"
                      aria-label="비밀번호 확인"
                      type="password"
                      value={signupPasswordConfirm}
                      onChange={(event) => setSignupPasswordConfirm(event.target.value)}
                      placeholder="비밀번호 재입력"
                      autoComplete="new-password"
                      className="h-input text-base"
                    />
                  </div>

                  <Button
                    type="button"
                    className="h-12 w-full"
                    disabled={isSignupPending}
                    onClick={() => void handleCompleteSignup()}
                  >
                    가입 완료
                  </Button>
                </div>
              ) : null}

              {validationMessage ? <p className="text-small text-danger">{validationMessage}</p> : null}

              <div className="flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-small text-gray-500">
                <KeyRound className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                <p>Ridy는 초대 코드와 회사 이메일 인증을 완료한 사용자만 가입할 수 있습니다.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
