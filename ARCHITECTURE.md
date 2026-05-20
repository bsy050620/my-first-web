# ARCHITECTURE

## 1. 프로젝트 목표

- 목적: 개인 기술/일상 블로그로서 콘텐츠 작성·공유를 간편하게 하고, 검색·태깅·이미지 관리를 통해 좋은 읽기 경험을 제공한다.
- 주요 요구사항:
  - 빠른 읽기 성능(서버 사이드 렌더링/캐싱 고려)
  - 간편한 글 작성 및 이미지 업로드
  - 인증 기반의 작성자 전용 기능(작성/수정/초안)
  - 확장성: 태그/검색/분석/다국어 지원

## 2. 페이지 맵 (Next.js App Router 기준)

- 퍼블릭
  - `/` — 홈 (최신/추천 포스트)
  - `/posts` — 포스트 목록 (페이징/필터)
  - `/posts/[id]` — 포스트 상세 (SSR/ISG 또는 Server Components)
  - `/search` — 검색 결과(검색어 쿼리 `?q=`)
  - `/tags/[tag]` — 태그별 목록
  - `/about` — 소개
  - `/contact` — 연락처/폼
  - `app/not-found` — 404

- 인증 관련
  - `/login` — 로그인 (Supabase Auth 연동)
  - `/signup` — 회원가입
  - `/auth/reset` — 비밀번호 재설정 (미구현)

- 작성자 전용(인증 필요)
  - `/me` — 마이 페이지 (요약)
  - `/me/posts` — 내 포스트 목록
  - `/posts/new` — 새 포스트 작성
  - `/posts/[id]/edit` — 포스트 편집
  - `/me/settings` — 프로필 설정

## Ch10/Ch11 기준 추가 (요약)

### 패키지/버전
- 교재 기준: `next` 16.2.1, `react` 19.2.4, `@supabase/supabase-js` 2.47.12, `@supabase/ssr` 0.5.2, `tailwindcss` v4
- 현재 설치: `package.json`과 교재 기준이 동일하게 명시되어 있습니다.

### Supabase 연결
- 클라이언트: `lib/supabase/client.ts` (`createBrowserClient`) 사용
- 서버: Ch8 방식의 서버 클라이언트/마이그레이션 재사용

### 인증 & 상태관리
- Ch9 `useAuth`/`AuthProvider` (`contexts/AuthContext.tsx`) 재사용
- 전역 인증 컨텍스트 우선 활용, 개별 컴포넌트에서 직접 Supabase 인증 호출 금지

### 라우터
- App Router(`app/`) 기반 **필수**, `next/router` 사용 금지

### 스키마 고정
- `profiles`: `id`, `username`, `avatar_url`, `role`, `created_at` — 변경 금지
- `posts`: `id`, `user_id`, `title`, `content`, `created_at` — 변경 금지

### Ch10 (Posts CRUD)
- 포스트 작성/수정/삭제 UI와 서버 API 구현
- 수정/삭제 버튼은 UX 수준에서만 노출(보안은 Ch11에서 처리)

### Ch11 (RLS) — **현재 준비 단계**
- RLS 정책은 Supabase CLI 마이그레이션으로 남김
- `posts` 테이블에 대해 `user_id`와 `auth.uid()` 기준의 정책 생성
- 클라이언트 UI 분기(버튼 숨김 등)는 보안이 아니며, 실제 보안은 RLS가 담당
- `service_role` 키는 클라이언트에서 절대 사용 금지

- 운영/관리(선택)
  - `/admin` — 운영 대시보드(선택적)

> 구현 참고: App Router 경로는 `app/` 디렉터리 기반으로 구성합니다. 서버 컴포넌트를 기본으로 사용하고, 클라이언트 상호작용이 필요한 컴포넌트에만 `"use client"`를 붙입니다.

## 3. 유저 플로우

### 3.1 글 읽기(방문자)

1. 진입: 홈(`/`) 또는 검색(`/search?q=...`)으로 접속
2. 목록에서 포스트 미리보기(제목/요약/썸네일) 확인
3. 포스트 선택 → `/posts/[id]` 로 이동
4. 포스트 읽기 → 추천/태그 클릭으로 관련 글 탐색

성공 기준: 포스트 콘텐츠 로드 및 읽기(컨텐츠 노출), 공유/태그 탐색 가능

### 3.2 글 작성(인증된 작성자)

1. 로그인: `/auth/login` (Supabase Auth)
2. `New Post` (`/posts/new`) 진입
3. 제목/본문 입력 (마크다운/리치 편집기 선택)
4. 이미지 업로드: Supabase Storage에 업로드 후 URL 삽입
5. 저장 옵션: 임시저장(초안) 또는 공개(Publish)
6. 공개 시 리다이렉트 `/posts/[id]`로 이동하여 공개 확인

필요 엔드포인트/서비스:
- Auth: Supabase Auth
- Storage: Supabase Storage
- Posts API: Create/Update/Publish 엔드포인트

### 3.3 마이 페이지 (프로필/포스트 관리)

1. `/me` 접속 — 개인 요약(최근 작성, 통계)
2. `/me/posts`에서 내 글 목록 확인
3. 글 선택 → 편집(`/posts/[id]/edit`) 또는 삭제
4. `/me/settings`에서 프로필/계정 정보 수정 (아바타 업로드 등)

권장: 편집 시 자동 임시저장(로컬 또는 서버)와 변경 내역(버전) 지원

---

## 미작성 섹션
## 4. 컴포넌트 구조 (shadcn/ui 기반)

설계 목표: 깔끔하고 재사용 가능한 UI 컴포넌트를 중앙에서 관리하고, Server Components 우선 전략을 유지하되 클라이언트 상호작용이 필요한 부분에만 클라이언트 컴포넌트를 적용합니다.

- 디렉토리 구조 권장
  - `components/ui/` — shadcn에서 생성한 디자인 토큰과 기본 UI 컴포넌트(`Button`, `Card`, `Input`, `Dialog` 등). 재사용 가능한 스타일/래퍼만 위치.
  - `components/` — 앱 전용 조합 컴포넌트(예: `NewPostButton`, `PostActions`, `PostCardPreview`). 클라이언트 상호작용(삭제 다이얼로그, 편집 버튼 등)이 필요한 컴포넌트는 해당 파일 맨 위에 `"use client"`를 명시.
  - `app/...` 페이지 내부에서는 레이아웃·데이터 페칭을 서버 컴포넌트로 두고, 작은 클라이언트 컴포넌트(입력, 버튼, 다이얼로그 트리거 등)를 조합하여 사용.

- shadcn/ui 컴포넌트 사용 가이드
  - `Button`: 페이지 상단의 `글쓰기` 버튼, 폼의 `저장/취소`, 카드 내의 보조 액션(상세 이동 등)에 사용. 기본 variant(차분한 톤)을 사용하고, 파괴적 동작에는 `destructive` variant 사용.
  - `Card`: 글 목록의 각 항목(프리뷰)과 카드형 위젯(추천 포스트, 작성자 위젯)에 사용. 카드에는 `CardHeader`(제목·메타), `CardContent`(요약), `CardFooter`(액션 버튼)를 구조적으로 사용.
  - `Input`: 검색 입력, 간단한 폼 필드(제목, 소제목 등)에 사용. 리치 편집기(본문)는 별도의 에디터 컴포넌트를 사용하되, 제목/메타는 `Input` 사용.
  - `Dialog`: 삭제 확인, 중요한 확인, 이미지 업로드 설정 등 모달 상호작용에 사용. `DialogTrigger`는 버튼으로 감싸고, `DialogContent` 내부에 확인/취소 버튼을 배치.

- 컴포넌트 책임 분리 (권장)
  - Presentational(순수 UI): `components/ui/*` — 스타일과 아토믹한 구조만 담당, 상태 없음.
  - Container/Behavior: `components/*` — 서버/클라이언트 데이터를 받아 UI에 주입, 사용자 이벤트(삭제 API 호출 등) 처리.
  - Page: `app/posts/*` 등 라우트 단위에서 데이터 페칭(서버) 및 하위 컴포넌트에 데이터 전달.

예시 적용 위치
  - `app/posts/page.tsx`: 서버에서 포스트 리스트를 페칭 → 각 포스트에 대해 `PostCardPreview`(Card)를 렌더링. 페이지 헤더에 `NewPostButton`(`Button`) 배치.
  - `app/posts/SearchBar.tsx`: 검색 입력은 `Input`, 결과 리스트는 `Card`로 표시. 삭제 시 `Dialog`를 트리거하여 확인 후 클라이언트 상태 또는 API 호출로 삭제.
  - `app/posts/new/page.tsx`: 제목은 `Input`, 내용은 에디터(또는 textarea). 제출/취소는 `Button` 사용.

> 유의사항: 디자인 목표에 따라 과한 그림자/그라디언트 사용을 지양하고, 버튼 색상은 `globals.css`의 디자인 토큰(`--primary`, `--secondary`)을 통해 통일합니다.

## 5. 데이터 모델 (Ch8 기준)

설계 목표: Ch8 마이그레이션 기준으로 `profiles`와 `posts` 테이블의 컬럼명을 고정하여 일관된 DB 접근을 보장합니다. **컬럼명을 임의로 변경하지 마세요.**

- `profiles` 테이블 (auth.users 확장)
  - `id` UUID PRIMARY KEY REFERENCES auth.users(id)
  - `username` TEXT
  - `avatar_url` TEXT
  - `role` TEXT
  - `created_at` TIMESTAMPTZ DEFAULT now()

- `posts` 테이블 (Ch8 고정 스키마)
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `user_id` UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
  - `title` TEXT NOT NULL
  - `content` TEXT NOT NULL
  - `created_at` TIMESTAMPTZ DEFAULT now()
  
  **주의**: 위 컬럼명은 Ch8 기준으로 고정되며, 코드·마이그레이션·API 응답에서 이 명칭을 반드시 사용해야 합니다. `slug`, `excerpt`, `status`, `published_at`, `updated_at` 등의 컬럼은 현재 존재하지 않습니다.

관계 및 확장
- 관계: `profiles (1) — (N) posts`
- 확장 원칙:
  - 태그·이미지·댓글 등은 별도 테이블로 확장
  - 기존 컬럼명(`profiles.id`, `posts.id`, `posts.user_id`, `posts.title`, `posts.content`, `posts.created_at`)은 **절대 변경 금지**
  - 새 컬럼 추가는 마이그레이션 파일로만 처리하고 문서에 기록

운영 및 보안 고려사항
- 인증은 Supabase Auth에서 관리하며, `profiles.id`는 `auth.users(id)`를 참조합니다.
- 삭제 정책: 소프트 삭제(`deleted_at`)를 도입할 경우 기존 칼럼을 보존하고 확장 방식으로 처리하세요.

> 참고: 이 섹션의 컬럼명은 Ch8 마이그레이션과 일치해야 하며, 코드에서 이 명칭을 사용하도록 유지합니다.
---
---

## Tech Stack

- **프레임워크**: Next.js 16 (App Router)
- **스타일**: Tailwind CSS v4
- **UI**: shadcn/ui (Radix primitives + Tailwind)
- **DB / Auth / Storage**: Supabase (Postgres + Auth + Storage)
- **배포**: Vercel 또는 유사 플랫폼

## Component Hierarchy (권장)

- `components/ui/*` (Atomic)
  - `Button`, `Input`, `Card`, `Dialog`, `Toast` 등 — shadcn에서 생성된 래퍼와 design-token 연결
- `components/common/*` (Shared)
  - `Header`, `Footer`, `Avatar`, `SearchBar` — 레이아웃 공통 컴포넌트
- `components/posts/*` (Domain)
  - `PostCard` (`Card` 기반) — 목록/추천용 프리뷰
  - `PostList` / `PostGrid` — 그리드/리스트 레이아웃 래퍼
  - `PostForm` — 작성 및 편집(제목: `Input`, 메타: `Input`, 내용: 에디터)
  - `PostActions` — 편집/삭제/공개 토글 (클라이언트 컴포넌트)
- `app/...` (Pages)
  - 각 route 폴더는 Server Component로 데이터 페칭 담당, 클라이언트 상호작용은 하위 컴포넌트에 위임

컴포넌트 책임 요약:
- Presentational (`components/ui/*`): 스타일과 API만 제공
- Behavioral (`components/*`): 데이터 호출, 이벤트 핸들링, 서버 액션 호출

## 디자인 토큰

디자인 토큰은 `app/globals.css`에 정의하며, 전역으로 다음 변수를 사용합니다:
- 색상: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--card`, `--border`, `--accent`, `--destructive`
- 반경: `--radius`, `--radius-md` 등
- 포커스/링: `--ring` (투명도 낮게 설정)

규칙:
- Tailwind 클래스 사용시 직접 `text-gray-...` 대신 토큰 기반 유틸(`text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`)을 우선 사용합니다(프로젝트 규칙: copilot-instructions.md).
- 버튼/인풋/카드의 색상·윤곽은 토큰을 통해 통일하고, 그라디언트/강한 그림자 사용 금지.

## DB 스키마 (Supabase / Postgres 권장)

아래는 최소한의 `users` / `posts` 스키마 설계(타입은 Postgres 표기 기준).

- `users` table
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `email` TEXT UNIQUE NOT NULL
  - `username` TEXT UNIQUE
  - `name` TEXT
  - `bio` TEXT
  - `avatar_url` TEXT
  - `role` TEXT DEFAULT 'user'
  - `created_at` TIMESTAMP WITH TIME ZONE DEFAULT now()
  - `updated_at` TIMESTAMP WITH TIME ZONE

  > 인증은 Supabase Auth를 사용하므로 비밀번호 해시 관리는 Supabase에서 처리합니다. `users` 테이블은 프로필 중심 필드 보유.

- `posts` table
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `author_id` UUID REFERENCES users(id) ON DELETE SET NULL
  - `title` TEXT NOT NULL
  - `slug` TEXT UNIQUE NOT NULL
  - `excerpt` TEXT
  - `content` TEXT NOT NULL
  - `status` TEXT DEFAULT 'draft' -- enum: draft/published/archived
  - `published_at` TIMESTAMP WITH TIME ZONE
  - `created_at` TIMESTAMP WITH TIME ZONE DEFAULT now()
  - `updated_at` TIMESTAMP WITH TIME ZONE

인덱스/성능:
- `posts(slug)` 유니크 인덱스
- `posts(author_id)` 인덱스
- 전체 텍스트 검색이 필요하면 Postgres FTS 또는 외부 검색(Algolia, Meilisearch) 고려

## 인증 (Email / Password with Supabase)

- 가입 흐름
  1. 클라이언트에서 `/signup` 폼 제출 → Supabase Auth의 `signUp({ email, password })`
  2. 이메일 확인(옵션) → Supabase가 관리
  3. 성공 시 `users` 프로필 레코드 생성(웹훅 또는 서버 함수에서 동기화)

- 로그인 흐름
  1. `/login` 폼에서 `signInWithPassword({ email, password })`
  2. 성공하면 Supabase가 세션/쿠키 발급(또는 액세스 토큰 반환)
  3. 서버에서 인증이 필요한 API 호출 시 Supabase JWT/서비스 키로 검증

- 세션 / 보호 라우트
  - Server Components에서 쿠키 또는 Supabase Server SDK로 세션 확인 후 접근 제어
  - 클라이언트(예: `PostActions`)는 로그인 여부에 따라 UI 분기

## 각 페이지의 주요 컴포넌트 및 데이터 흐름

- `/` (홈)
  - 주요 컴포넌트: `Header`, `Hero`, `PostGrid`(최신/추천), `Footer`
  - 데이터 흐름: Server Component가 최신/추천 포스트를 페칭 → `PostCard`로 렌더링

- `/posts` (포스트 목록)
  - 주요 컴포넌트: `Header`, `SearchBar`(클라이언트), `PostList`/`PostGrid`, `Pagination`
  - 데이터 흐름: Server Component가 필터/페이지 파라미터로 DB 쿼리 → 클라이언트측 `SearchBar`는 로컬 필터 또는 서버 API 호출로 검색

- `/posts/new` (포스트 작성)
  - 주요 컴포넌트: `PostForm`(클라이언트), `Input`(제목), 에디터(본문), `Button`(저장)
  - 데이터 흐름: 클라이언트에서 폼 제출 → 서버 액션 또는 API 라우트로 전달 → DB에 `posts` 레코드 생성 → redirect `/posts/[id]`

- `/posts/[id]` (포스트 상세)
  - 주요 컴포넌트: `PostContent`, `PostMeta`, `PostActions`(클라이언트, 작성자 전용), `Comments`(선택)
  - 데이터 흐름: Server Component가 `posts` 레코드와 작성자 프로필을 함께 페칭 → 렌더링. `PostActions`는 클라이언트에서 삭제/편집 액션 처리(확인 다이얼로그 후 API 호출).

---

## 구현 메모

- UI 가이드: Server Components 우선, 클라이언트 상호작용 필요 시 `"use client"` 사용
- 내비게이션: `next/navigation` API 사용
- 디자인 토큰: `globals.css`에 CSS 변수 정의(`--primary`, `--background` 등)
- 우선 구현 권장 순서: 포스트 상세 데이터 연결 → 인증 → 에디터 → 이미지 업로드 → 검색/필터

---

필요하시면 이 문서를 더 상세한 아키텍처 다이어그램(mermaid)으로 변환하거나, 각 섹션을 작업 항목으로 분해해 드리겠습니다.
