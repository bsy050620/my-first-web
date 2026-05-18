@AGENTS.md

추가 지침 (Claude 에게 전달할 내용):

- Ch10 작업은 Ch7·Ch8 교재 기준을 우선합니다. 실제 패키지 버전 차이가 있을 경우 `교재 기준` 및 `현재 설치`를 모두 문서화하세요.
- Supabase 연결은 `lib/supabase/client.ts`를 사용하고, 인증은 `contexts/AuthContext.tsx`의 `AuthProvider`/`useAuth`를 재사용합니다.
- App Router만 사용하며 `next/router`는 사용하지 마세요.
- posts CRUD 변경 시 Ch8 마이그레이션과 컬럼명을 존중하고, 권한 검증은 Ch11 RLS에서 처리될 예정임을 명시하세요.

- 스키마 고정: `profiles`와 `posts`의 핵심 컬럼명은 Ch8 기준으로 고정됩니다. 컬럼명을 변경하지 마세요: `profiles.id`, `posts.user_id`, `posts.title`, `posts.content`, `posts.created_at`.
