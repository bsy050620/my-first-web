@AGENTS.md

추가 지침 (Claude 에게 전달할 내용):

## Ch10 작업 기준

- Ch10 작업은 Ch7·Ch8 교재 기준을 우선합니다. 실제 패키지 버전 차이가 있을 경우 `교재 기준` 및 `현재 설치`를 모두 문서화하세요.
- Supabase 연결은 `lib/supabase/client.ts`를 사용하고, 인증은 `contexts/AuthContext.tsx`의 `AuthProvider`/`useAuth`를 재사용합니다.
- App Router만 사용하며 `next/router`는 사용하지 마세요.
- posts CRUD 변경 시 Ch8 마이그레이션과 컬럼명을 존중하고, 권한 검증은 Ch11 RLS에서 처리될 예정임을 명시하세요.
- 스키마 고정: `profiles`와 `posts`의 핵심 컬럼명은 Ch8 기준으로 고정됩니다. 컬럼명을 변경하지 마세요: `profiles.id`, `posts.user_id`, `posts.title`, `posts.content`, `posts.created_at`.

## Ch11 RLS 작업 기준

- **RLS는 Supabase CLI 마이그레이션으로만 적용**: `supabase/migrations/` 디렉토리에 SQL 파일로 정책을 작성합니다. SQL Editor에서 직접 실행하지 않습니다.
- **posts 테이블 정책**:
  - `SELECT`: 모든 사용자가 공개 포스트 조회 가능
  - `INSERT`: 인증된 사용자(`auth.uid() IS NOT NULL`)만 삽입 가능
  - `UPDATE`: 작성자(`user_id = auth.uid()`)만 수정 가능
  - `DELETE`: 작성자만 삭제 가능
- **클라이언트 UI 분기는 UX일 뿐**: 수정/삭제 버튼을 숨기거나 다이얼로그를 보여도 이것은 UX 레벨입니다. 실제 데이터 보호는 RLS 정책이 담당합니다.
- **service_role 키 사용 금지**: 클라이언트 코드(`lib/supabase/client.ts`, `contexts/AuthContext.tsx`, `app/` 페이지)에서 `service_role` 키를 사용하면 안 됩니다. 공개 키(`anon`)를 사용하세요.
- **서버 API 검증** (선택): RLS 정책 적용 후, 필요시 서버 API에서 추가 검증을 구현할 수 있습니다(예: 사용자 ID 재확인).

