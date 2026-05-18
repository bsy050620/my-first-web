@AGENTS.md

추가 지침 (Claude 에게 전달할 내용):

- Ch10 작업은 Ch7·Ch8 교재 기준을 우선합니다. 실제 패키지 버전 차이가 있을 경우 `교재 기준` 및 `현재 설치`를 모두 문서화하세요.
- Supabase 연결은 `lib/supabase/client.ts`를 사용하고, 인증은 `contexts/AuthContext.tsx`의 `AuthProvider`/`useAuth`를 재사용합니다.
- App Router만 사용하며 `next/router`는 사용하지 마세요.
- posts CRUD 변경 시 Ch8 마이그레이션과 컬럼명을 존중하고, 권한 검증은 Ch11 RLS에서 처리될 예정임을 명시하세요.
