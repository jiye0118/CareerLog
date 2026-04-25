@AGENTS.md

# CareerLog — 프로젝트 가이드

## 서비스 개요
직장인이 매일/매주 짧게 업무 기록을 남기면,
AI 에이전트가 이력서·포트폴리오에 바로 쓸 수 있는 형태로 자동 정리해주는 서비스.

- **핵심 가치:** 일하면서 자연스럽게 쌓이는 커리어 기록장 — 필요할 때 꺼내 쓰는 이력서·포트폴리오 엔진
- **타겟 유저:** 이직을 고려 중이거나 커리어 관리를 원하는 현직 직장인
- **입력 방식 (MVP):** AI 대화 붙여넣기, 직접 입력

---

## 기술 스택
- **Frontend/Backend:** Next.js 15 (App Router, TypeScript, Tailwind CSS)
- **DB / Auth:** Supabase (PostgreSQL + Supabase Auth)
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **배포:** Vercel

---

## 프로젝트 구조

```
CareerLog/
├── app/                    # Next.js App Router 페이지 및 API
│   └── api/intake/         # POST /api/intake — 업무 기록 접수 + AI 분석
├── agents/                 # AI 에이전트 모듈 (각각 독립)
│   ├── intakeAgent.ts      # 입력 수신·정제·분류 (MVP 완료)
│   ├── hrExpertAgent.ts    # 직무·어필 포인트 분석 (Stage 03)
│   └── resumeAgent.ts      # 이력서 항목 생성 (Stage 03)
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # 브라우저(클라이언트 컴포넌트)용
│   │   └── server.ts       # 서버 컴포넌트·Route Handler·Server Action용
│   └── anthropic.ts        # Anthropic 클라이언트 싱글턴
├── types/index.ts          # 전체 공통 타입 정의
└── supabase/schema.sql     # DB 스키마 (Supabase SQL Editor에서 실행)
```

---

## 개발 규칙

### 에이전트 추가 시
- `agents/` 폴더에 독립 파일로 생성
- 입력/출력 타입은 `types/index.ts`에 추가
- 다른 에이전트에 직접 의존하지 않을 것 (느슨한 결합 유지)

### Supabase 클라이언트 사용 규칙
- 클라이언트 컴포넌트(`"use client"`) → `lib/supabase/client.ts`
- 서버 컴포넌트, Route Handler, Server Action → `lib/supabase/server.ts`
- 절대 혼용 금지 (인증 쿠키 처리 방식이 다름)

### Git 브랜치 전략
- `main` 브랜치 = 항상 실제로 동작하는 안정된 코드만 유지
- Stage 01, 02는 기반 공사 단계로 `main`에 직접 작업
- **Stage 03부터는 기능 브랜치를 만들어서 작업**
  - 브랜치 이름 규칙: `feat/stage03-resume-agent`, `fix/버그이름` 등
  - 작업 완료 + 테스트 통과 후 `main`에 병합
  - 병합 후 브랜치 삭제
- 새 Stage 또는 독립적인 기능 작업 시작 전 반드시 브랜치 생성

### 절대 하지 말 것
- `src/` 디렉토리 사용 금지
- import alias (`@/`) 사용 금지 — 상대경로 사용
- Turbopack 사용 금지
- 환경 변수를 코드에 직접 하드코딩 금지

### 코드 작성 원칙
- 구조와 타입은 처음부터 제대로 (나중에 고치기 어려움)
- UI 완성도·에러 메시지·로딩 처리는 기능 완성 후 다듬기
- 에이전트는 독립 모듈로 분리 — 추후 추가/교체 용이하게

---

## MVP 개발 로드맵

| Stage | 목표 | 상태 |
|-------|------|------|
| 01 | 프로젝트 세팅 + DB 설계 + Intake Agent | ✅ 완료 |
| 02 | Work Log 저장/조회 + 대시보드 UI | 🔄 진행 중 |
| 03 | Resume Agent + 이력서 항목 생성 | 🔲 예정 |
| 04 | 주간 요약 리포트 + UI 다듬기 | 🔲 예정 |
| 05 | 베타 배포 (Vercel) | 🔲 예정 |

---

## 환경 변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

---

## 자주 쓰는 명령어
```bash
npm run dev       # 개발 서버 실행 (localhost:3000)
npm run lint      # ESLint 검사
npx tsc --noEmit  # TypeScript 타입 체크
```
