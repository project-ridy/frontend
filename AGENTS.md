# AGENTS.md — Ridy Frontend

이 파일은 이 레포에서 작업하는 에이전트가 반드시 따라야 할 규칙을 정의합니다.

## 에이전트 역할

이 레포의 에이전트는 **Developer**와 **Designer**입니다. Orchestrator가 docs에 설계한 내용을 기반으로 구현합니다.

## 필수 규칙

### 작업 흐름
1. 모든 작업은 **GitHub Organization Project**의 이슈에서 시작 — https://github.com/orgs/project-ridy/projects/1
2. 이슈를 `In Progress`로 변경 후 작업 시작
3. 브랜치 생성: `<type>/<이슈번호>-<설명>` (feat, fix, test, design, refactor)
4. PR 생성 후 머지, 이슈를 `Done`으로 변경
5. main 브랜치에 직접 커밋 금지
6. 기능 작업 후 대응 테스트 이슈를 반드시 이어서 진행

### TDD (절대 불변)
모든 기능/버그 수정은 **Red → Green → Refactor** 사이클을 따른다:
1. 🔴 **Red** — 실패하는 테스트를 먼저 작성
2. 🟢 **Green** — 테스트를 통과하는 최소 구현 작성
3. 🔵 **Refactor** — 테스트가 여전히 통과하는 상태로 코드 정리
4. ✅ **Verify** — `npm run test` 전체 통과 확인 후 커밋

**금지**: 구현 먼저 하고 테스트 나중에 작성 / Red 없이 Green 진입 / 사이클 완료 전 커밋

### docs 기반 구현
- 작업 시작 전 **반드시** 관련 docs 문서를 읽는다:
  - API 연동: `docs/api/` 스펙을 정확히 따름
  - UI 구현: `docs/design/DESIGN_SYSTEM.md` 토큰 사용
  - 화면 구현: `docs/design/SCREENS.md` 정의 준수
  - 와이어프레임: `docs/design/WIREFRAMES.md` 기준
- docs에 정의되지 않은 내용은 임의로 추가하지 않음 — Orchestrator에 BLOCKED 보고

### 기술 스택 준수
- **Next.js 15 App Router** — 서버 컴포넌트가 기본, `'use client'`는 필요할 때만
- **shadcn/ui** — 컴포넌트는 shadcn 기반으로 조합, 바닥부터 만들지 않기
- **Tailwind CSS 4** — 디자인 토큰 사용, 임의 값(`[...]`) 최소화, 모바일 퍼스트
- **TanStack Query** — 서버 상태 관리, 컴포넌트 내 직접 fetch 금지
- **TypeScript 5.x** — `any` 금지, `interface` 우선, `enum` 대신 `as const`

### 코딩 컨벤션
- 컴포넌트: PascalCase 파일명, 단일 책임, early return 조건부 렌더링
- 훅: `use` 접두사 + camelCase
- 이벤트 핸들러: `handle` 접두사
- API 함수: `lib/api/`에 분리, 컴포넌트 내 직접 fetch 금지
- 타입: `types/api.ts`, `types/domain.ts`에 정의, 인라인 타입 금지
- 테스트: `describe/it` 구조, 설명은 한국어, MSW로 API 모킹

### 커밋 메시지
```
<type>(<scope>): <subject>

Closes #<이슈번호>
```
type: feat | fix | test | design | refactor | docs | chore

### 사용 스킬
- Developer: `tdd`, `react-expert`, `nextjs-expert`, `typescript-expert`, `code-review-expert`
- Designer: `ux-researcher-designer`, `apple-hig-expert`, `a11y-audit`

### PR 체크리스트
- [ ] Project 이슈가 할당되어 있는가?
- [ ] TDD 사이클을 따랐는가?
- [ ] `npm run lint` 에러 없는가?
- [ ] `npm run test` 전체 통과하는가?
- [ ] TypeScript 타입 에러 없는가?
- [ ] 디자인 시스템 토큰을 사용했는가?
- [ ] 기능 작업인 경우 후속 테스트 이슈를 In Progress로 변경했는가?
