# Context — my-first-web 프로젝트 상태

## 현재 상태

- 마지막 작업일: 2026-05-27 (Ch12 에러 처리 & UX 개선)
- 완료된 작업: 홈 페이지, 헤더/푸터 레이아웃, 포스트 목록, 이메일/비밀번호 인증 흐름, 서버 API(포스트 생성), 에러 메시지 변환, 폼 검증
- 진행 중: 화면별 loading/error/empty 상태 구현
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

### 2026-05-27 — Ch12 에러 처리 & UX 개선 작업 요약

- 추가된 파일들:
	- `lib/error-message.ts` (Supabase/네트워크 에러 → 사용자 메시지 변환)
	
- 수정된 파일들:
	- `app/login/LoginClient.tsx` (에러 메시지 변환 적용, console.error 유지)
	- `app/signup/page.tsx` (에러 메시지 변환 적용, console.error 유지)

- 에러 메시지 변환 규칙 (lib/error-message.ts):
	- 42501 또는 "row-level security" → "이 작업을 수행할 권한이 없습니다."
	- "Failed to fetch" → "인터넷 연결을 확인해주세요."
	- "not found", "no rows", 404 → "요청한 게시글을 찾을 수 없습니다."
	- 기본값 → "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."

- 폼 검증 규칙:
	- 로그인: 이메일, 비밀번호 필수 입력
	- 회원가입: 이메일, 비밀번호(6자 이상), 비밀번호 확인 필수 입력 + 일치 확인

### 2026-05-18 — 이전 작업 요약 (Ch9/Ch10 인증 구현)

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

- 화면별 loading/error/empty 상태 구현 (error.tsx, loading.tsx 추가)
- `middleware` deprecation 관련 조치(선택): `proxy` 방식으로 전환
- 통합 테스트: 로그인/회원가입/글쓰기 시나리오를 브라우저로 검증

---

## Ch10/Ch11 기준 정리

### 기술 기준
- **패키지 버전**:
  - 교재 기준: `next` 16.2.1, `react` 19.2.4, `@supabase/supabase-js` 2.47.12, `@supabase/ssr` 0.5.2, `tailwindcss` v4
  - 현재 설치: 동일 버전으로 명시됨 (충돌 없음)
- **Supabase 클라이언트**: `lib/supabase/client.ts` (브라우저) + 서버 클라이언트 (Ch8 방식)
- **인증**: `contexts/AuthContext.tsx` (`AuthProvider`, `useAuth`)
- **라우터**: App Router (`app/` 기반) — `next/router` 금지
- **스키마**: Ch8 마이그레이션 기준(컬럼명 변경 금지)

### 스키마 고정 (절대 변경 금지)

**`profiles` (auth.users 확장)**
- `id` (uuid) PRIMARY KEY REFERENCES auth.users(id)
- `username` (text)
- `avatar_url` (text)
- `role` (text)
- `created_at` (timestamptz)

**`posts` (블로그 콘텐츠)**
- `id` (uuid) PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` (uuid) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
- `title` (text) NOT NULL
- `content` (text) NOT NULL
- `created_at` (timestamptz) DEFAULT now()

> 확장이 필요한 경우, 마이그레이션 파일로만 처리하고 문서에 기록하세요.

### Ch11 준비 사항 (RLS)

**현재 상태**:
- ✅ 기본 인증/인가 구조 완성 (Ch9)
- ✅ 포스트 생성 API 구현 (`app/api/posts/route.ts`)
- ✅ 미들웨어로 보호 라우트 적용 (`middleware.ts`)
- ⏳ **RLS 정책 미적용** — 다음 단계

**RLS 적용 원칙**:
1. RLS 정책은 **Supabase CLI 마이그레이션** (`supabase/migrations/`) 파일로 남김 (SQL Editor X)
2. `posts` 테이블: `user_id` = `auth.uid()` 기준으로 정책 생성
3. **클라이언트 UI 분기는 보안이 아님** — 버튼 숨김/다이얼로그는 UX일 뿐, 실제 보안은 RLS가 담당
4. `service_role` 키는 **클라이언트에서 절대 사용하지 않음**

### Ch11에서 구현할 RLS 정책(요약)

| 테이블 | 대상 사용자 | 작업 | 조건 |
|--------|-----------|------|------|
| `posts` | 인증된 사용자 | SELECT | 모든 공개 포스트 조회 가능 |
| `posts` | 포스트 작성자 | UPDATE/DELETE | `user_id` = `auth.uid()` |
| `posts` | 작성자 외 | UPDATE/DELETE | 거부 |

---

### 다음 작업 순서

1. **포스트 CRUD 완성** (Ch10):
   - 포스트 조회/수정/삭제 API 구현
   - UI 분기: 작성자 전용 버튼(수정/삭제) 노출 (보안 X)

2. **RLS 정책 추가** (Ch11):
   - 마이그레이션 파일 작성 (SQL)
   - Supabase CLI로 적용 및 테스트
   - 서버 API에서 RLS 정책 검증(선택)

3. **통합 테스트**:
   - 로그인한 사용자: 자신의 포스트 수정/삭제 가능
   - 다른 사용자: 수정/삭제 불가 (RLS 차단)

---

### 참고: Ch8/Ch9 적용 완료 항목
- ✅ `lib/supabase/client.ts` 통합 사용
- ✅ `contexts/AuthContext.tsx` (`AuthProvider`, `useAuth`) 적용
- ✅ 기본 인증 흐름 (이메일/비밀번호)
- ✅ 서버 API로 포스트 생성 및 보호 라우트
