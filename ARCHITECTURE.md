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
  - `/auth/login` — 로그인 (Supabase Auth 연동)
  - `/auth/register` — 회원가입
  - `/auth/reset` — 비밀번호 재설정

- 작성자 전용(인증 필요)
  - `/me` — 마이 페이지 (요약)
  - `/me/posts` — 내 포스트 목록
  - `/posts/new` — 새 포스트 작성
  - `/posts/[id]/edit` — 포스트 편집
  - `/me/settings` — 프로필 설정

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

- 컴포넌트 구조: TODO: 추가 예정 (shadcn/ui 설치 후 상세 작성)
- 데이터 모델(Posts/Users/Comments): TODO: 추가 예정 (Ch8 대비)

---

## 구현 메모

- UI 가이드: Server Components 우선, 클라이언트 상호작용 필요 시 `"use client"` 사용
- 내비게이션: `next/navigation` API 사용
- 디자인 토큰: `globals.css`에 CSS 변수 정의(`--primary`, `--background` 등)
- 우선 구현 권장 순서: 포스트 상세 데이터 연결 → 인증 → 에디터 → 이미지 업로드 → 검색/필터

---

필요하시면 이 문서를 더 상세한 아키텍처 다이어그램(mermaid)으로 변환하거나, 각 섹션을 작업 항목으로 분해해 드리겠습니다.
