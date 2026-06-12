# AGENTS.md — Ridy Frontend

이 파일은 이 레포에서 작업하는 에이전트가 반드시 따라야 할 규칙을 정의합니다.

## 에이전트 역할

이 레포의 에이전트는 **Frontend Developer**와 **Designer**입니다. Orchestrator가 docs에 설계한 내용을 기반으로 구현합니다.

## 필수 규칙

### 공통 작업 규칙
- 모든 레포 공통 규칙은 [`project-ridy/docs/WORKFLOW.md`](https://github.com/project-ridy/docs/blob/main/WORKFLOW.md)를 최우선으로 따른다.
- 이 파일은 frontend 레포 전용 세부 규칙만 보완한다.

### 작업 흐름
1. 모든 작업은 **GitHub Organization Project**의 이슈에서 시작 — https://github.com/orgs/project-ridy/projects/1
2. 작업 시작 전 **이슈에 자신을 어사인** (`gh issue edit <번호> --add-assignee @me`)
3. 이슈를 `In Progress`로 변경 후 작업 시작
4. **기획서 확인** — `project-ridy/docs/planning/implementation/`의 해당 구현 계획서를 읽고 코드 구조, 예외 처리, 테스트 시나리오를 파악
5. 브랜치 생성: `<type>/<이슈번호>-<설명>` (feat, fix, test, design, refactor)
6. PR 생성 후 머지, 이슈를 `Done`으로 변경
7. **머지 완료 후 작업 브랜치 삭제** — 로컬/원격 모두 정리 (`git branch -d <branch> && git push origin --delete <branch>`)
8. main 브랜치에 직접 커밋 금지
9. 기능 작업 후 대응 테스트 이슈를 반드시 이어서 진행

### TDD (절대 불변)
모든 기능/버그 수정은 **Red → Green → Refactor** 사이클을 따른다:
1. 🔴 **Red** — 실패하는 테스트를 먼저 작성
2. 🟢 **Green** — 테스트를 통과하는 최소 구현 작성
3. 🔵 **Refactor** — 테스트가 여전히 통과하는 상태로 코드 정리
4. ✅ **Verify** — `npm run test` 전체 통과 확인 후 커밋

**금지**: 구현 먼저 하고 테스트 나중에 작성 / Red 없이 Green 진입 / 사이클 완료 전 커밋

### 구현/테스트 케이스 추적 (절대 불변)
- 작업 시작 전 구현 계획서의 **구현/테스트 케이스 등록표**를 확인한다.
- 계획서에 등록된 모든 케이스 ID를 구현 대상과 테스트 대상으로 처리한다.
- 새 page, component, hook, API 함수, GraphQL operation은 반드시 케이스 ID와 대응 테스트를 가져야 한다.
- 케이스별 테스트는 테스트 파일과 `describe/it` 이름이 계획서에 적힌 내용과 연결되어야 한다.
- 대응 테스트가 없는 기능 코드는 완료 처리할 수 없다.
- 구현 중 새 기능 코드 항목이 생기면 계획서 또는 PR 확인표에 케이스를 추가하고, 테스트 파일/테스트명을 함께 적는다.
- PR에는 케이스 ID별 구현 파일, 테스트 파일, 테스트 이름, 확인 결과를 표로 작성한다.

### docs 기반 구현
- 작업 시작 전 **반드시** 관련 docs 문서를 읽는다:
  - API 연동: `docs/api/` 스펙을 정확히 따름
  - UI 구현: `docs/design/DESIGN_SYSTEM.md` 토큰 사용
  - 화면 구현: `docs/design/SCREENS.md` 정의 준수
  - 와이어프레임: `docs/design/WIREFRAMES.md` 기준
- docs에 정의되지 않은 내용은 임의로 추가하지 않음 — Orchestrator에 BLOCKED 보고

### 기술 스택 준수
- **최신 안정 버전 우선** — 작업 시작 전 `npm outdated`로 확인하고, 특별한 호환성 이슈가 없으면 latest 사용
- **Next.js 16 App Router** — 서버 컴포넌트가 기본, `'use client'`는 필요할 때만
- **GraphQL schema-first 연동** — 백엔드 `src/graphql/schema.graphql`을 먼저 확인하고, 프론트는 직접 타입을 손으로 만들지 않음
- **GraphQL Code Generator 필수** — GraphQL 작업 전후 `npm run codegen` 실행, generated 타입/문서를 기준으로 구현
- **shadcn/ui** — 컴포넌트는 shadcn 기반으로 조합, 바닥부터 만들지 않기
- **Tailwind CSS 4** — 디자인 토큰 사용, 임의 값(`[...]`) 최소화, 모바일 퍼스트
- **TanStack Query** — 서버 상태 관리, 컴포넌트 내 직접 fetch 금지
- **TypeScript 6.x** — `any` 금지, `interface` 우선, `enum` 대신 `as const`

### 코딩 컨벤션
- 컴포넌트: PascalCase 파일명, 단일 책임, early return 조건부 렌더링
- 훅: `use` 접두사 + camelCase
- 이벤트 핸들러: `handle` 접두사
- GraphQL operation: `src/graphql/operations/*.graphql`에 먼저 작성
- API 함수: `lib/api/`에 분리, 컴포넌트 내 직접 fetch 금지
- API 타입: `src/graphql/generated/`의 codegen 산출물을 사용, 손작성 타입 금지
- 테스트: `describe/it` 구조, 설명은 한국어, MSW로 API 모킹

### 커밋 메시지
```
<type>(<scope>): <subject 한글>

Closes #<이슈번호>
```
- **subject는 반드시 한국어**로 작성, **type은 영어** (예: `feat(auth): 로그인 리졸버 구현`, `docs(setup): 초기 셋업 가이드 추가`)
- type: feat | fix | test | design | refactor | docs | chore

### PR 제목
- **PR 제목도 동일한 형식** — type은 영어, subject는 한국어 (예: `feat(auth): 로그인 리졸버 구현`)
- 커밋 메시지와 동일한 형식 사용

### 사용 스킬
- Frontend Developer: `tdd`, `react-expert`, `nextjs-expert`, `typescript-expert`, `code-review-expert`
- Designer: `ux-researcher-designer`, `apple-hig-expert`, `a11y-audit`

### PR 체크리스트
- [ ] Project 이슈가 할당되어 있는가?
- [ ] TDD 사이클을 따랐는가?
- [ ] 기획서의 구현/테스트 케이스 등록표에 있는 모든 케이스를 구현했는가?
- [ ] 모든 기능 코드 케이스가 대응 테스트 파일과 테스트 이름을 가지는가?
- [ ] PR 본문에 케이스 ID별 구현/테스트 확인표를 작성했는가?
- [ ] `npm run lint` 에러 없는가?
- [ ] `npm run test` 전체 통과하는가?
- [ ] TypeScript 타입 에러 없는가?
- [ ] GraphQL 작업 시 `npm run codegen`을 실행했는가?
- [ ] 손작성 API 타입 대신 generated 타입을 사용했는가?
- [ ] 디자인 시스템 토큰을 사용했는가?
- [ ] 기능 작업인 경우 후속 테스트 이슈를 In Progress로 변경했는가?
