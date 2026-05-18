## Tech Stack

- Next.js 16.2.1 (App Router only)
- React 19.2.4
- Tailwind CSS 4
- shadcn/ui (components/ui/ 경로에 설치됨)

## Coding Conventions

- Default to Server Components unless a Client Component is required.
- Use Tailwind CSS for styling.
- Keep components simple and easy to verify.
- Prefer files inside `app/` for routes.

## Design Tokens

- Primary color: shadcn/ui --primary
- Background: --background
- Card: shadcn/ui Card 컴포넌트 사용 (rounded-lg shadow-sm)
- Spacing: 컨텐츠 간격 space-y-6, 카드 내부 p-6
- Max width: max-w-4xl mx-auto (메인 컨텐츠)
- 반응형: md 이상 2열 그리드, 모바일 1열

## Component Rules

- UI 컴포넌트는 shadcn/ui 사용 (components/ui/)
- Button, Card, Input, Dialog 등 shadcn/ui 컴포넌트 우선
- 커스텀 컴포넌트는 components/ 루트에 배치
- Tailwind 기본 컬러 직접 사용 금지 → CSS 변수(디자인 토큰) 사용

## Known AI Mistakes

- Do not use `next/router`; use `next/navigation` when navigation is needed.
- Do not create `pages/` router files; this project uses the App Router.
- Do not add `"use client"` unless interactivity or browser APIs are actually needed.

## Ch10 전용 규칙 (교재 기준에 맞춘 작업 전 확인 사항)

- 교재 버전 기준: Ch7·Ch8 권장 패키지를 따릅니다. 아래는 권장/현재 버전 표기입니다.
	- **교재 권장**: `next` 16.2.1, `react` 19.2.4, `@supabase/supabase-js` 2.47.12, `@supabase/ssr` 0.5.2, `tailwindcss` v4
	- **현재 설치**: 확인된 `package.json`에 동일 버전이 명시되어 있습니다(버전 충돌 시 두 기준을 모두 문서에 기재).

- Supabase 연결: 프로젝트는 `lib/supabase/client.ts`(브라우저용 `createBrowserClient`)와 서버 사이드용 서버 클라이언트를 Ch8 기준대로 사용합니다. 새로운 파일을 만들지 말고 해당 경로를 재사용하세요.
- 인증: Ch9에서 도입한 `useAuth`/`AuthProvider`를 사용합니다. 전역 인증 컨텍스트를 우선 활용하고, 개별 컴포넌트에서 직접 Supabase 인증을 호출하지 마세요.
- posts 스키마: 컬럼명/타입은 Ch8 스키마(ARCHITECTURE.md의 `posts` 섹션에 명시된 컬럼)와 동일하게 유지합니다. 마이그레이션 파일(`supabase/migrations/`)을 확인하세요.
- 라우터: App Router(`app/`)만 사용합니다. `next/router` 사용은 금지입니다.
- 수정/삭제 UI: UX 차원에서 UI를 구현하되, 실제 권한/데이터 보호는 Ch11의 RLS 단계에서 처리됩니다. 즉, UI에서 버튼을 숨기거나 확인 다이얼로그를 보여도 서버 검증을 별도로 준비하세요.

-- 스키마 고정 주의: `profiles` 및 `posts`의 컬럼명은 Ch8 기준으로 고정됩니다. 절대 임의로 컬럼명을 변경하지 마세요 (`profiles.id`, `posts.user_id`, `posts.title`, `posts.content`, `posts.created_at`).
- 라우터: App Router(`app/` 기반)만 사용합니다. `next/router` 사용은 금지입니다.
- 수정/삭제 UI: UX 차원에서 UI를 구현하되, 실제 권한/데이터 보호는 Ch11의 RLS 단계에서 처리됩니다. 즉, UI에서 버튼을 숨기거나 확인 다이얼로그를 보여도 서버 검증을 별도로 준비하세요.

- 문서화 규칙: 실제 `package.json`이 교재보다 최신이면 절대 삭제하지 마세요. 대신 `교재 기준`과 `현재 설치 기준`을 문서에 함께 명시합니다.

---