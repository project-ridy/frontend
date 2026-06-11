# Ridy Frontend 🎨

**함께 타는 길, Ridy** — 카풀 매칭 서비스 프론트엔드

## 기술 스택

| 기술 | 버전 | 용도 |
|---|---|---|
| Next.js | 15 (App Router) | 웹 프레임워크 |
| React | 19 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 4.x | 스타일링 |
| TanStack Query | 5.x | 서버 상태 관리 |
| Socket.IO Client | 4.x | 실시간 채팅 |

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트
npm run lint
```

## 프로젝트 구조

```
frontend/
├── src/
│   ├── app/           # Next.js App Router 페이지
│   ├── components/    # 공통 컴포넌트
│   │   └── ui/        # 디자인 시스템 컴포넌트
│   ├── hooks/         # 커스텀 훅
│   ├── lib/           # 유틸리티, API 클라이언트
│   ├── stores/        # 클라이언트 상태 관리
│   └── types/         # TypeScript 타입 정의
├── public/            # 정적 자산
└── tailwind.config.ts # 디자인 토큰
```

## 에이전트 작업 가이드

- 작업 지시서: [docs/agents/DEVELOPER_TASKS.md](https://github.com/project-ridy/docs/blob/main/agents/DEVELOPER_TASKS.md)
- 디자인 시스템: [docs/design/DESIGN_SYSTEM.md](https://github.com/project-ridy/docs/blob/main/design/DESIGN_SYSTEM.md)
- 화면 정의서: [docs/design/SCREENS.md](https://github.com/project-ridy/docs/blob/main/design/SCREENS.md)
- API 스펙: [docs/api/](https://github.com/project-ridy/docs/tree/main/api)

## 브랜치 규칙

- `feat/<task-id>-<설명>` — 기능 개발
- `fix/<task-id>-<설명>` — 버그 수정
- `design/<task-id>-<설명>` — 디자인 구현
- main 직접 커밋 금지 — PR 필수

---

*Project by 손정원*
