<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent 행동 규칙 (Ch10 준비)

- 레포지토리 작업 시 다음을 항상 따르세요:
	- App Router 기반(`app/`) 경로만 사용. `next/router` 사용 금지.
	- Supabase 클라이언트는 `lib/supabase/client.ts`를 재사용.
	- 인증 로직은 `contexts/AuthContext.tsx`(`AuthProvider`, `useAuth`)를 우선 사용.
	- posts 관련 변경은 Ch8 마이그레이션(`supabase/migrations/`)과 컬럼 규격을 준수.
	- 패키지 버전 차이가 있으면 문서에 `교재 기준`과 `현재 설치` 정보를 병기.

	- 스키마 고정: `profiles` 및 `posts`의 핵심 컬럼명은 Ch8 기준으로 고정합니다. 에이전트는 다음 컬럼명을 변경할 수 없습니다: `profiles.id`, `posts.user_id`, `posts.title`, `posts.content`, `posts.created_at`.

---
