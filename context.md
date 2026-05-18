# Context — my-first-web 프로젝트 상태

## 현재 상태

- 마지막 작업일: 2026-05-18
- 완료된 작업: 홈 페이지, 헤더/푸터 레이아웃, 포스트 목록, 이메일/비밀번호 인증 흐름, 서버 API(포스트 생성)
- 진행 중: 포스트 상세 페이지 데이터 연결 검증 및 문서 정비
- 미착수: 일부 고급 기능(이미지 업로드, 댓글, 마이페이지 고도화)

## 기술 결정 사항

- 인증: Supabase Auth (Email) — `@supabase/supabase-js` 2.47.12, `@supabase/ssr` 0.5.2 기준으로 구현
- 상태관리: React Context (`contexts/AuthContext.tsx`) — `AuthProvider` / `useAuth`
- 서버/클라이언트: Server-side는 `createServerClient`(cookies), 클라이언트는 `createBrowserClient` 사용

## 해결된 이슈(최근)

- Invalid Refresh Token / AuthSessionMissing 오류에 대응: `Header`와 `/posts/new`에서 `getUser()` 호출을 안전하게 처리하도록 수정
- 인증 구조 중앙화: `lib/auth.ts`와 `contexts/AuthContext.tsx` 추가
- 서버 API를 통해 포스트 삽입 처리 및 미들웨어로 보호 경로 적용 (`app/api/posts/route.ts`, `middleware.ts`)
- 중복된 브라우저 클라이언트 파일(`lib/supabaseClient.ts`) 제거, `lib/supabase/client.ts`로 통합

## 알게 된 점 / 주의 사항

- Next.js 미들웨어는 동작하지만 deprecate 경고가 표시됩니다(권장: `proxy` 방식 고려).
- 브라우저에 남아 있는 만료된 Supabase 토큰(로컬스토리지/쿠키)은 Auth 관련 오류를 유발할 수 있으니 테스트 전 제거 권장.
- ch09a 교재 기준(코드 구조·설명)은 따랐으나, 실제 패키지 버전에 맞춰 API 사용을 조정했습니다.

---

### 2026-05-18 — 오늘 작업 요약

- 변경한 파일들(주요):
	- `package.json` (Supabase 버전 고정)
	- `lib/auth.ts` (signInWithEmail, signUpWithEmail, signOut)
	- `contexts/AuthContext.tsx` (AuthProvider, useAuth)
	- `lib/supabase/client.ts` (브라우저용 createBrowserClient)
	- `app/api/posts/route.ts` (서버 API로 posts insert)
	- `app/posts/new/page.tsx`, `app/login/LoginClient.tsx`, `app/signup/page.tsx`, `components/Header.tsx` (AuthProvider 사용으로 리팩터링)
	- `middleware.ts` (서버 보호 라우트)
	- `todo.md`, `context.md` (상태 업데이트)

- 빌드: `npx next build` 성공, 개발 서버 실행 확인 (포트 충돌 시 포트 변경 발생 가능)

### 미해결 / 다음 작업

- 문서 정비: `.github/copilot-instructions.md`, `ARCHITECTURE.md` 등 ch09a 권장 문서 업데이트 필요
- `middleware` deprecation 관련 조치(선택): `proxy` 방식으로 전환
- 통합 테스트: 로그인/회원가입/글쓰기 시나리오를 브라우저로 검증

---

## Ch10 준비 상태 및 요구사항 정리

- 기준 요약:
	- Ch7·Ch8 교재 기준 패키지를 따릅니다.
	- Supabase 연결은 `lib/supabase/client.ts`를 사용합니다.
	- 인증은 Ch9의 `useAuth`/`AuthProvider`를 재사용합니다.
	- posts 컬럼명/스키마는 Ch8 마이그레이션을 따릅니다(확인: `supabase/migrations/`).
	- App Router만 사용하며 `next/router` 사용 금지입니다.

- 현재 상태(Ch10 시작 전 해야 할 일):
	1. `posts` CRUD에 필요한 페이지/서버 엔드포인트 정리 및 미비점 확인
	2. `PostForm`(작성/수정) UI와 서버 API(생성/수정/삭제)를 Ch8 스키마에 맞춰 구현
	3. 인증 흐름(`AuthProvider`)에서 사용자 ID를 일관되게 전달하는지 확인
	4. RLS 적용 전, UX 레벨의 수정/삭제 버튼 노출 정책을 문서화(Ch11에서 보안 처리)
	5. `package.json` 버전과 교재 권장 버전 차이 여부 확인(현재 동일하게 명시되어 있음)

	---

	## Ch8 스키마(고정)

	Ch10 작업에서는 아래 컬럼명을 절대 변경하지 마세요. 코드, 마이그레이션, API 응답은 이 명칭을 사용해야 합니다.

	- `profiles`:
		- `id` (uuid) — `auth.users(id)` 참조
		- `username` (text)
		- `avatar_url` (text)
		- `role` (text)

	- `posts`:
		- `id` (uuid primary key)
		- `user_id` (uuid references profiles(id))
		- `title` (text)
		- `content` (text)
		- `created_at` (timestamptz)

	필요한 확장은 마이그레이션 파일을 통해 명시적으로 추가하고, 기존 컬럼명은 절대 변경하지 마세요.

---

### Ch8/Ch9에서 반영한 항목 (참고)
- `lib/supabase/client.ts` 통합 사용 완료
- `contexts/AuthContext.tsx`(`AuthProvider`, `useAuth`) 추가 및 페이지 리팩터링 적용

문서를 기준으로 Ch10 작업을 시작할 수 있도록 위 항목들을 우선 검토하세요.
