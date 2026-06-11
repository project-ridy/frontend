# Rules — Ridy Frontend

이 파일은 프론트엔드 레포의 코딩 규칙과 프레임워크 컨벤션을 정의합니다.

---

## TypeScript

### 타입 시스템
- **`any` 사용 금지** — 모든 값은 명시적 타입 또는 타입 추론에 의존
- **`interface` 우선** — 객체 타입은 `interface` 사용, 유니온/유틸리티 타입만 `type` 사용
- **`enum` 금지** — `as const` 객체 + 타입 추출 패턴 사용
- **인라인 타입 금지** — 컴포넌트 Props, API 응답은 반드시 별도 파일에 정의

```typescript
// ✅ Good
export const MATCHING_STATUS = {
  OPEN: 'OPEN',
  MATCHED: 'MATCHED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type MatchingStatus = (typeof MATCHING_STATUS)[keyof typeof MATCHING_STATUS];

// ✅ Good — interface for objects
interface MatchingCardProps {
  matching: Matching;
  onRequest: (id: string) => void;
}

// ❌ Bad
enum Status { OPEN, MATCHED }
const data: any = await fetch('/');
function Card({ matching }: any) { ... }
```

### 널러블 처리
- **`null` 대신 `undefined`** — TypeScript 관례 준수
- **옵셔널 체이닝 적극 활용** — `user?.name`
- **null 아님 단언 금지** — `!` 연산자 사용 최소화, 가드로 대체

```typescript
// ✅ Good
const name = user?.profile?.name ?? '익명';

// ❌ Bad
const name = user!.profile!.name;
```

---

## React

### 컴포넌트 원칙
- **단일 책임** — 한 컴포넌트당 하나의 역할, 150줄 초과 시 분리 검토
- **서버 컴포넌트가 기본** — `'use client'`는 상태/이펙트/이벤트 핸들러/API 호출이 필요할 때만
- **Props는 interface로 정의** — `type Props = {}` 대신 `interface Props {}`
- **children은 명시적** — `{ children: React.ReactNode }`

```tsx
// ✅ Good — 서버 컴포넌트 (기본)
interface MatchingListProps {
  matchings: Matching[];
}
export default function MatchingList({ matchings }: MatchingListProps) {
  return (
    <ul>
      {matchings.map((m) => <MatchingCard key={m.id} matching={m} />)}
    </ul>
  );
}

// ✅ Good — 클라이언트 컴포넌트 (필요 시에만)
'use client';
import { useState } from 'react';
```

### 조건부 렌더링
- **early return** — 중첩 삼항 연산자 금지
- **&& 단락 평가 주의** — falsy 값(0, '') 렌더링 방지 위해 `!!` 또는 삼항 사용

```tsx
// ✅ Good
function MatchingCard({ matching }: MatchingCardProps) {
  if (!matching.availableSeats) return <SoldOutCard />;
  if (matching.status === MATCHING_STATUS.CANCELLED) return null;
  return <AvailableCard matching={matching} />;
}

// ❌ Bad
function MatchingCard({ matching }: any) {
  return matching.availableSeats ? <AvailableCard /> : <SoldOutCard />;
}
```

### 이벤트 핸들러
- **`handle` 접두사** — `handleClick`, `handleSubmit`, `handleSearch`
- **컴포넌트 내에 정의** — 별도 함수 파일로 분리하지 않음
- **타입 명시** — `React.MouseEvent<HTMLButtonElement>`

```tsx
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  onSubmit(formData);
};
```

### 상태 관리
- **서버 상태**: TanStack Query (`useQuery`, `useMutation`)
- **클라이언트 상태**: Zustand (전역), `useState` (지역)
- **폼 상태**: React Hook Form + Zod 검증
- **URL 상태**: `useSearchParams`, `useRouter`

---

## Next.js (App Router)

### 라우팅 구조
```
src/app/
├── (auth)/              # 인증 그룹 레이아웃
│   ├── login/page.tsx
│   └── profile/setup/page.tsx
├── (main)/              # 메인 앱 그룹 레이아웃
│   ├── home/page.tsx
│   ├── matching/
│   │   ├── page.tsx          # 매칭 검색
│   │   └── [id]/page.tsx     # 매칭 상세
│   ├── chat/
│   │   └── [roomId]/page.tsx
│   └── my/page.tsx
├── layout.tsx           # 루트 레이아웃
└── page.tsx             # 랜딩/리다이렉트
```

### 렌더링 전략
| 패턴 | 사용 시나리오 |
|---|---|
| 서버 컴포넌트 (기본) | 정적 콘텐츠, SEO 필요 페이지, 데이터 페치 |
| 클라이언트 컴포넌트 | 인터랙션, 상태, 이펙트, 브라우저 API |
| 스트리밍 | 대시보드, 리스트 등 점진적 로딩 |

### 데이터 페치
- **서버에서 페치** — 클라이언트에서 불필요한 API 호출 최소화
- **TanStack Query는 클라이언트 페치에만** — 실시간 데이터, 뮤테이션, 캐싱 필요 시
- **로딩/에러 처리** — `loading.tsx`, `error.tsx` 파일 사용

```tsx
// 서버 컴포넌트에서 페치
async function MatchingPage() {
  const matchings = await fetchMatchings(); // 서버에서 직접
  return <MatchingList matchings={matchings} />;
}

// 클라이언트에서 페치 (실시간/캐싱 필요 시)
'use client';
function MatchingSearch() {
  const { data } = useQuery({ queryKey: ['matchings'], queryFn: fetchMatchings });
  return <MatchingList matchings={data} />;
}
```

### 메타데이터
- **정적 메타**: `export const metadata` — SEO 페이지
- **동적 메타**: `generateMetadata()` — 동적 라우트

```tsx
export const metadata: Metadata = {
  title: 'Ridy — 함께 타는 길',
  description: '카풀 매칭 서비스',
};
```

---

## shadcn/ui

### 컴포넌트 사용
- **shadcn/ui를 기본으로** — `src/components/ui/`에 설치된 컴포넌트 우선 사용
- **바닥부터 만들지 않기** — shadcn에 없는 컴포넌트는 shadcn 기반으로 조합
- **Variants**: `class-variance-authority` 사용 — shadcn 패턴 준수

```bash
# 컴포넌트 추가
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add sheet
npx shadcn@latest add toast
```

### 컴포넌트 분류
| 디렉토리 | 내용 | 예시 |
|---|---|---|
| `components/ui/` | shadcn/ui 원본 컴포넌트 | `Button`, `Card`, `Input` |
| `components/layout/` | 레이아웃 컴포넌트 | `Header`, `BottomNav`, `Sidebar` |
| `components/domain/` | 도메인 컴포넌트 | `MatchingCard`, `ChatBubble`, `RideForm` |
| `components/common/` | 공통 컴포넌트 | `Loading`, `ErrorFallback`, `EmptyState` |

### 커스텀 컴포넌트 작성
```tsx
// components/domain/MatchingCard.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface MatchingCardProps {
  matching: Matching;
  onRequest?: (id: string) => void;
}

export function MatchingCard({ matching, onRequest }: MatchingCardProps) {
  return (
    <Card>
      <CardHeader>
        <Avatar>
          <AvatarImage src={matching.driver.avatarUrl} />
          <AvatarFallback>{matching.driver.name[0]}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>...</CardContent>
    </Card>
  );
}
```

---

## Tailwind CSS

### 디자인 토큰
- **`tailwind.config.ts`에 정의된 토큰만 사용** — 임의 값(`[...]`) 최소화
- **색상**: `text-primary`, `bg-blue-600`, `border-emerald-500` 등 토큰 사용
- **간격**: `p-4`, `gap-2`, `mt-6` 등 스케일 사용
- **타이포**: `text-sm`, `font-semibold`, `leading-relaxed` 등

### 반응형
- **모바일 퍼스트** — 기본 스타일이 모바일, `sm:` → `md:` → `lg:` → `xl:`로 확장
- **브레이크포인트**: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`

```tsx
// ✅ Good — 모바일 퍼스트
<div className="flex flex-col gap-4 p-4 md:flex-row md:p-6 lg:p-8">

// ❌ Bad — 데스크탑 퍼스트, 임의 값
<div className="flex flex-row gap-[16px] p-[24px] lg:flex-col lg:p-4">
```

### 클래스 정렬 순서
1. 레이아웃: `flex`, `grid`, `block`, `hidden`
2. 위치: `items-center`, `justify-between`, `relative`
3. 간격: `gap-4`, `p-4`, `m-2`
4. 크기: `w-full`, `h-screen`, `max-w-lg`
5. 타이포그래피: `text-sm`, `font-bold`, `leading-tight`
6. 색상: `text-gray-900`, `bg-white`, `border-gray-200`
7. 효과: `rounded-lg`, `shadow-sm`, `opacity-50`
8. 반응형/상태: `md:`, `hover:`, `focus:`, `dark:`

---

## API 연동

### API 클라이언트 구조
```typescript
// lib/api/client.ts — 공통 fetcher
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
}

// lib/api/matching.ts — 도메인별 API
export const matchingApi = {
  search: (params: SearchParams) =>
    fetcher<MatchingSearchResponse>('/matchings/search', { params }),
  getById: (id: string) =>
    fetcher<MatchingDetailResponse>(`/matchings/${id}`),
  request: (id: string, body: RequestBody) =>
    fetcher<RequestResponse>(`/matchings/${id}/request`, { method: 'POST', body }),
};
```

### TanStack Query 패턴
```typescript
// hooks/useMatchingSearch.ts
export function useMatchingSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['matching', 'search', params],
    queryFn: () => matchingApi.search(params),
    staleTime: 30_000,
  });
}

// hooks/useMatchingRequest.ts
export function useMatchingRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RequestBody }) =>
      matchingApi.request(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matching'] });
    },
  });
}
```

---

## 테스트

### Vitest 유닛/통합 테스트
- **MSW로 API 모킹** — 실제 API 호출 금지
- **`@testing-library/react`** — `render`, `screen`, `waitFor`
- **사용자 관점** — 내부 상태가 아닌 화면에 보이는 것을 검증
- **describe/it 한국어** — `it('매칭 결과를 렌더링한다', ...)`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '__tests__/mocks/server';

describe('MatchingCard', () => {
  it('운전자 이름과 평점을 표시한다', () => {
    render(<MatchingCard matching={mockMatching} />);
    expect(screen.getByText('박준서')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('탑승 요청 버튼을 클릭하면 onRequest가 호출된다', async () => {
    const onRequest = vi.fn();
    render(<MatchingCard matching={mockMatching} onRequest={onRequest} />);
    await userEvent.click(screen.getByRole('button', { name: '탑승 요청' }));
    expect(onRequest).toHaveBeenCalledWith(mockMatching.id);
  });
});
```

### Playwright E2E 테스트
- **사용자 플로우 중심** — 로그인 → 검색 → 요청 → 채팅
- **page.goto로 시작** — 시드 데이터 기반
- **data-testid 보다 role/text 우선** — 접근성 준수 테스트 겸용

```typescript
test('로그인 후 매칭 검색 플로우', async ({ page }) => {
  await page.goto('/login');
  await page.click('[data-provider="kakao"]');
  await page.waitForURL('/home');
  await page.fill('[placeholder="출발지"]', '강남역');
  await page.fill('[placeholder="도착지"]', '수원역');
  await page.click('text=검색');
  await expect(page.locator('.matching-card')).toBeVisible();
});
```

---

## 파일 네이밍

| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase.tsx | `MatchingCard.tsx` |
| 훅 | camelCase + use 접두사 | `useMatchingSearch.ts` |
| 유틸리티 | camelCase.ts | `formatFare.ts` |
| 타입 | camelCase.ts | `api.ts`, `domain.ts` |
| 상수 | camelCase.ts | `constants.ts` |
| 테스트 | 대상.test.tsx | `MatchingCard.test.tsx` |
| E2E 테스트 | 플로우.spec.ts | `matching-flow.spec.ts` |
| 스타일 | 글로벌만 | `globals.css` |
| 페이지 | page.tsx (디렉토리 라우트) | `app/(main)/matching/page.tsx` |
| 레이아웃 | layout.tsx | `app/(main)/layout.tsx` |
| 로딩 | loading.tsx | `app/(main)/matching/loading.tsx` |
| 에러 | error.tsx | `app/(main)/matching/error.tsx` |
