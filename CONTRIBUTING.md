# Ridy Frontend — 기여 가이드

## 🤖 에이전트 의무 지침

> Developer / Designer 에이전트는 이 문서의 규칙을 **반드시** 따릅니다.

### 작업 흐름 (필수)

**모든 작업은 GitHub Organization Project에서 관리됩니다.**
📍 프로젝트 보드: https://github.com/orgs/project-ridy/projects/1

```
1. Project 이슈 할당 → 2. 이슈 In Progress → 3. 브랜치 생성 → 4. TDD 사이클 → 5. PR 생성 → 6. 이슈 Done
```

- **main 브랜치에 직접 커밋 금지** — 모든 변경은 PR로
- **Project 이슈 없이 작업 금지** — 모든 작업은 Organization Project의 이슈에서 시작
- **기능 작업 후 반드시 후속 테스트 이슈 진행** — 기능 PR 머지 후 Project에서 대응 테스트 이슈를 In Progress로 변경
- **이슈 상태 관리**: 작업 시작 시 `In Progress`, PR 머지 후 `Done`으로 변경

### 에이전트 스킬

Developer 에이전트는 다음 스킬을 로드 후 작업합니다:

| 스킬 | 용도 |
|---|---|
| `tdd` | TDD Red→Green→Refactor 사이클 강제 |
| `react-expert` | React 19 패턴, 훅 규칙, 성능 최적화 |
| `nextjs-expert` | App Router, RSC, 렌더링 전략 |
| `typescript-expert` | 타입 안전성, 제네릭 패턴 |
| `code-review-expert` | PR 셀프 리뷰 |

Designer 에이전트는 다음 스킬을 로드 후 작업합니다:

| 스킬 | 용도 |
|---|---|
| `ux-researcher-designer` | UX 패턴, 접근성, 사용자 흐름 |
| `apple-hig-expert` | 모바일 UI/UX 가이드라인 |
| `a11y-audit` | 접근성 감사 및 수정 |

### TDD (필수)

모든 기능/버그 수정은 **Red → Green → Refactor** 사이클을 따른다:

1. **🔴 Red** — 실패하는 테스트를 먼저 작성한다
2. **🟢 Green** — 테스트를 통과하는 최소 구현을 작성한다
3. **🔵 Refactor** — 테스트가 여전히 통과하는 상태로 코드를 정리한다
4. **✅ Verify** — `npm run test` 전체 통과 확인 후 커밋

**절대 금지:**
- 구현 먼저 하고 테스트 나중에 작성하기
- Red 없이 Green 단계로 진입하기
- Red → Green → Refactor 완료 전 커밋하기

---

## 🛠 기술 스택

| 기술 | 버전 | 용도 |
|---|---|---|
| Next.js | 15 (App Router) | 웹 프레임워크 |
| React | 19 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 4.x | 스타일링 |
| shadcn/ui | 최신 | UI 컴포넌트 라이브러리 |
| TanStack Query | 5.x | 서버 상태 관리 |
| Socket.IO Client | 4.x | 실시간 채팅 |
| Vitest | 최신 | 유닛/통합 테스트 |
| Playwright | 최신 | E2E 테스트 |

---

## 📂 프로젝트 구조

```
frontend/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # 인증 관련 페이지 그룹
│   │   ├── (main)/         # 메인 앱 페이지 그룹
│   │   ├── layout.tsx      # 루트 레이아웃
│   │   └── page.tsx        # 홈페이지
│   ├── components/
│   │   ├── ui/             # shadcn/ui 컴포넌트
│   │   ├── layout/         # 레이아웃 컴포넌트 (Header, Nav 등)
│   │   ├── domain/         # 도메인 컴포넌트 (MatchingCard 등)
│   │   └── common/         # 공통 컴포넌트 (Loading, Error 등)
│   ├── hooks/              # 커스텀 훅
│   ├── lib/                # 유틸리티, API 클라이언트
│   │   ├── api/            # API 호출 함수
│   │   ├── utils.ts        # 유틸리티 함수
│   │   └── constants.ts    # 상수
│   ├── stores/             # 클라이언트 상태 (Zustand)
│   ├── types/              # TypeScript 타입 정의
│   │   ├── api.ts          # API 응답 타입
│   │   └── domain.ts       # 도메인 타입
│   └── styles/             # 글로벌 스타일
├── __tests__/              # 테스트 파일
│   ├── unit/               # 유닛 테스트
│   ├── integration/        # 통합 테스트
│   └── e2e/                # E2E 테스트 (Playwright)
├── public/                 # 정적 자산
└── tailwind.config.ts      # Tailwind + 디자인 토큰
```

---

## 📝 코딩 컨벤션

### 네이밍

| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase | `MatchingCard.tsx` |
| 훅 | camelCase + `use` 접두사 | `useMatchingSearch.ts` |
| 유틸리티 함수 | camelCase | `formatFare.ts` |
| 타입/인터페이스 | PascalCase | `MatchingResult`, `User` |
| 상수 | UPPER_SNAKE_CASE | `MAX_SEATS` |
| CSS 클래스 | Tailwind 유틸리티 우선 | `className="flex items-center"` |
| 파일명 (컴포넌트) | PascalCase | `MatchingCard.tsx` |
| 파일명 (훅/유틸) | camelCase | `useAuth.ts`, `formatDate.ts` |
| 파일명 (테스트) | 대상파일명.test.tsx | `MatchingCard.test.tsx` |

### TypeScript

- **`any` 사용 금지** — 모든 값은 명시적 타입 또는 타입 추론
- **인터페이스 > 타입 별칭** — 객체 타입은 `interface` 사용
- **API 응답은 `types/api.ts`에 정의** — 컴포넌트 내 인라인 타입 금지
- **`enum` 대신 `as const` 객체** 사용

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

// ❌ Bad
enum MatchingStatus { OPEN, MATCHED, ... }
// ❌ Bad
const status: any = 'OPEN';
```

### React / Next.js

- **서버 컴포넌트가 기본** — `'use client'`는 상태/이펙트/API 호출이 필요할 때만
- **컴포넌트는 단일 책임** — 한 컴포넌트당 하나의 역할
- **Props는 인터페이스로 정의** — `type Props = {}` 대신 `interface Props {}`
- **이벤트 핸들러는 `handle` 접두사** — `handleClick`, `handleSubmit`
- **조건부 렌더링은 early return** — 중첩 삼항 연산자 금지

```tsx
// ✅ Good
function MatchingCard({ matching }: MatchingCardProps) {
  if (!matching.availableSeats) return <SoldOutCard />;
  return <AvailableCard matching={matching} />;
}

// ❌ Bad
function MatchingCard({ matching }: any) {
  return matching.availableSeats ? <AvailableCard /> : <SoldOutCard />;
}
```

### shadcn/ui

- **shadcn/ui 컴포넌트를 기본으로 사용** — `src/components/ui/`에 설치
- **커스텀 컴포넌트는 shadcn 기반으로 조합** — 바닥부터 만들지 않기
- **Variants는 `class-variance-authority` 사용** — shadcn 패턴 준수
- **shadcn 컴포넌트 수정 시 `components.json` 설정 확인**

```bash
# shadcn 컴포넌트 추가
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

### Tailwind CSS

- **디자인 토큰은 `tailwind.config.ts`에 정의** — 임의 값(`[...]`) 최소화
- **반응형은 모바일 퍼스트** — `sm:` → `md:` → `lg:` → `xl:`
- **클래스 정렬 순서**: 레이아웃 → 간격 → 크기 → 타이포 → 색상 → 효과

```tsx
// ✅ Good — 모바일 퍼스트, 토큰 사용
<div className="flex items-center gap-4 p-4 md:p-6 text-sm text-gray-900 bg-white rounded-lg shadow-sm">

// ❌ Bad — 임의 값, 데스크탑 퍼스트
<div className="flex items-center gap-[16px] p-[24px] lg:p-4 text-[14px] text-[#111827]">
```

### API 호출

- **TanStack Query로 서버 상태 관리** — `useQuery`, `useMutation`
- **API 함수는 `lib/api/`에 분리** — 컴포넌트 내 직접 fetch 금지
- **에러 처리는 TanStack Query의 `onError`** — try/catch 대신

```typescript
// lib/api/matching.ts
export const matchingApi = {
  search: (params: SearchParams) =>
    fetcher<MatchingSearchResponse>('/matchings/search', { params }),
  request: (id: string, body: RequestBody) =>
    fetcher<RequestResponse>(`/matchings/${id}/request`, { method: 'POST', body }),
};

// hooks/useMatchingSearch.ts
export function useMatchingSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['matching', 'search', params],
    queryFn: () => matchingApi.search(params),
  });
}
```

---

## 🧪 테스트 컨벤션

### 테스트 구조

```
__tests__/
├── unit/                    # 순수 함수, 훅, 컴포넌트 테스트
│   ├── components/          # 컴포넌트 테스트
│   ├── hooks/               # 훅 테스트
│   └── lib/                 # 유틸리티 테스트
├── integration/             # API 연동, 라우팅 테스트
└── e2e/                     # Playwright E2E 테스트
```

### 테스트 작성 규칙

- **describe/it 구조** — `describe('단위', () => { it('동작', ...) })`
- **한 it당 하나의 검증** — 여러 assert는 허용하나 하나의 동작만 검증
- **테스트 설명은 한국어** — `it('매칭 결과를 렌더링한다', ...)`
- **MSW로 API 모킹** — 실제 API 호출 금지
- **`@testing-library/react` 사용** — `render`, `screen`, `fireEvent`
- **사용자 관점으로 테스트** — 내부 상태가 아닌 화면에 보이는 것을 검증

```typescript
// ✅ Good
describe('MatchingCard', () => {
  it('운전자 이름과 평점을 표시한다', () => {
    render(<MatchingCard matching={mockMatching} />);
    expect(screen.getByText('박준서')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });
});

// ❌ Bad — 내부 상태 검증
it('state가 업데이트된다', () => {
  const { result } = renderHook(() => useState(0));
  expect(result.current[0]).toBe(0);
});
```

---

## 🌿 브랜치 & 커밋 컨벤션

### 브랜치 네이밍

| 타입 | 형식 | 예시 |
|---|---|---|
| 기능 | `feat/<이슈번호>-<설명>` | `feat/12-auth-login` |
| 버그 | `fix/<이슈번호>-<설명>` | `fix/15-matching-crash` |
| 테스트 | `test/<이슈번호>-<설명>` | `test/14-auth-unit-test` |
| 디자인 | `design/<이슈번호>-<설명>` | `design/13-login-ui` |
| 리팩토링 | `refactor/<이슈번호>-<설명>` | `refactor/16-api-client` |

### 커밋 메시지 (Conventional Commits)

```
<type>(<scope>): <subject>

<body>
```

| type | 설명 |
|---|---|
| feat | 새로운 기능 |
| fix | 버그 수정 |
| test | 테스트 추가/수정 |
| design | UI/스타일 변경 |
| refactor | 리팩토링 |
| docs | 문서 변경 |
| chore | 빌드/설정 변경 |

**예시:**
```
feat(auth): 카카오 소셜 로그인 구현

- 카카오 OAuth 토큰 검증
- JWT 발급 로직
- 리다이렉트 처리

Closes #12
```

---

## 📋 체크리스트 (PR 생성 전)

- [ ] Project 이슈가 할당되어 있는가?
- [ ] TDD 사이클을 따랐는가? (Red → Green → Refactor)
- [ ] `npm run lint` 에러가 없는가?
- [ ] `npm run test` 전체 통과하는가?
- [ ] TypeScript 타입 에러가 없는가?
- [ ] 디자인 시스템 토큰을 사용했는가?
- [ ] 기능 작업인 경우 후속 테스트 이슈를 In Progress로 변경했는가?
