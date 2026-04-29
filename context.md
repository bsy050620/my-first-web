# Context — my-first-web 프로젝트 상태

## 현재 상태

- 마지막 작업일: 2026-04-29
- 완료된 작업: 홈 페이지, 헤더/푸터 레이아웃, 포스트 목록
- 진행 중: 포스트 상세 페이지 (UI 완료, 데이터 연결 미완)
- 미착수: 마이페이지

## 기술 결정 사항

- 인증: Supabase Auth (Email)
- 상태관리: React Context (AuthProvider)
- 이미지: Supabase Storage 사용 예정

## 해결된 이슈

- shadcn/ui Button variant가 디자인 토큰과 불일치 → globals.css의 --primary 수정으로 해결
- 모바일 헤더 메뉴가 겹침 → Sheet 컴포넌트로 교체

## 알게 된 점

- Tailwind CSS 4 기준에서는 `@import "tailwindcss"` + `@theme` 블록으로 설정 (`tailwind.config.js` 불필요)
- Server Component에서 useRouter 사용 불가 → redirect() 사용

---

### 2026-04-29 — 오늘 작업 요약

- 변경된 파일: [.github/copilot-instructions.md](.github/copilot-instructions.md#L1) — 프로젝트 개발 지침(Tech Stack, Coding Conventions, Design Tokens, Component Rules, Known AI Mistakes) 대폭 보강
- 해결한 이슈: 코드 버그 직접 해결 없음 — 문서 정리로 개발 규칙·일관성 문제 완화
- 새로 알게 된 점:
	- Next.js 16.2.1 (App Router), React 19.2.4 사용
	- Tailwind CSS 4와 shadcn/ui 조합으로 UI 구성 권장
	- 기본은 Server Components, 클라이언트 기능 필요 시에만 `"use client"` 사용
	- 내비게이션: `next/navigation` 사용(구식 `next/router` 사용 금지)
	- 디자인 토큰(예: `--primary`, `--background`)을 우선 사용하고 Tailwind 기본 컬러 직접 사용 금지