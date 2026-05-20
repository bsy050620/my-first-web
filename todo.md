# 프로젝트 TODO (블로그 기준)

**진행률:** 64% (16/25 완료, 0 진행 중)

---

## 기본 구조

- [x] 앱 구조 설정 (app/ 기반)
- [x] Tailwind CSS 설정
- [x] 디자인 토큰 정의 (`--primary`, `--background`)
- [x] 레이아웃(헤더/푸터) 구현
- [x] 홈 페이지 구현
- [x] 포스트 목록 구현
- [x] 포스트 상세 페이지 UI 구현 — 데이터 연결 일부 완료

## 핵심 기능 (Ch9 완료, Ch10/Ch11 진행중)

- [x] 인증: Supabase Auth (Email) — 기본 이메일/비밀번호 흐름 구현
- [x] `AuthProvider` / React Context 구현 (`contexts/AuthContext.tsx`)
- [x] 로그인/회원가입 페이지 리팩터링 (중앙 `lib/auth.ts` 사용)
- [x] 서버 API로 포스트 생성 구현 (`app/api/posts/route.ts`)
- [x] 보호 라우트: `middleware.ts`로 `/posts/new` 및 `/api/posts` 보호 추가

### Ch10 — Posts CRUD & UX

- [ ] 포스트 조회 API (`app/api/posts/[id]/route.ts`) — GET
- [ ] 포스트 수정 API (`app/api/posts/[id]/route.ts`) — PUT
- [ ] 포스트 삭제 API (`app/api/posts/[id]/route.ts`) — DELETE
- [ ] 포스트 상세 페이지 데이터 연결 (`app/posts/[id]/page.tsx`)
- [ ] 포스트 수정 페이지 (`app/posts/[id]/edit/page.tsx`)
- [ ] 포스트 에디터(작성/수정) UI — 마크다운 지원 (선택)
- [ ] 수정/삭제 UI: 작성자 전용 버튼 및 확인 다이얼로그 구현 (보안은 Ch11 RLS 예정)
- [ ] 포스트 목록에서 필터링/검색 기능 개선

### Ch11 — RLS (행 수준 보안) & 데이터 보호

- [ ] **RLS 마이그레이션 파일 작성** (`supabase/migrations/`)
  - [ ] `posts` 테이블 SELECT 정책: 모든 사용자 공개 조회 가능
  - [ ] `posts` 테이블 INSERT 정책: 인증된 사용자만 삽입 가능
  - [ ] `posts` 테이블 UPDATE 정책: 작성자(`user_id` = `auth.uid()`)만 수정 가능
  - [ ] `posts` 테이블 DELETE 정책: 작성자만 삭제 가능
- [ ] **RLS 정책 테스트** — Supabase Dashboard 또는 CLI로 검증
- [ ] **서버 API 검증** (선택): 정책 위반 시 서버 측 추가 검증 (예: 사용자 ID 확인)
- [ ] **문서화**: RLS 정책 명세 및 적용 프로세스 기록

---

## 고급 기능

- [ ] 이미지 업로드 (Supabase Storage 연동)
- [ ] 댓글 시스템
- [ ] 태그 및 필터링
- [ ] 검색 기능 (SearchBar 연동)
- [ ] 페이징 / 무한 스크롤
- [ ] 마이 페이지 / 프로필 (기본 뼈대 존재)
- [ ] 알림(이메일 / 웹 푸시)
- [ ] SEO / 메타데이터 최적화
- [ ] 분석(Analytics) 설정
- [ ] 배포 및 CI/CD 구성 (Vercel, GitHub Actions)
- [ ] 테스트 (유닛, 통합, E2E)
- [ ] 접근성(A11y) 개선
- [ ] 성능 최적화 (이미지 CDN, 캐싱)
- [ ] 다국어(i18n) 지원

---

## 최근 완료된 작업 (요약)

- `package.json`에서 Supabase 버전을 ch09a 권장 버전으로 고정 (`@supabase/supabase-js` 2.47.12, `@supabase/ssr` 0.5.2)
- 중앙 인증 래퍼 추가: `lib/auth.ts`
- 전역 인증 공급자 추가: `contexts/AuthContext.tsx`
- 로그인/회원가입 페이지를 중앙 auth 호출로 리팩터링
- 서버 API 추가: `app/api/posts/route.ts` (서버에서 Supabase 사용)
- 클라이언트 중복 Supabase 파일 제거 및 `lib/supabase/client.ts` 사용으로 통합
- 보호 라우트 추가: `middleware.ts` (`/posts/new`, `/api/posts`) — 서버 측 리다이렉트 처리

---

참고 및 다음 단계:
- 문서 정비(`.github/copilot-instructions.md`, `context.md`, `ARCHITECTURE.md`)가 필요합니다.
- 브라우저 쿠키/로컬스토리지 초기화 후 기능(로그인/가입/글쓰기) 검증 권장.

- Ch10 시작 전 확인 항목:
	- `lib/supabase/client.ts`가 브라우저/클라이언트 코드에서 사용되고 있는지 확인
	- `contexts/AuthContext.tsx`의 `AuthProvider`가 `app/layout.tsx`나 상위에 적용되어 있는지 확인
	- `supabase/migrations/`의 `posts` 스키마 컬럼명이 코드와 일치하는지 검증
	- 라우터가 `app/` 기반으로만 작성되었는지(예: `next/router` 미사용) 확인

	- 스키마 고정(중요): `profiles`와 `posts`의 컬럼명은 Ch8 기준으로 고정됩니다. 임의 변경 금지.
		- `profiles.id`, `profiles.username`, `profiles.avatar_url`, `profiles.role`
		- `posts.id`, `posts.user_id`, `posts.title`, `posts.content`, `posts.created_at`

