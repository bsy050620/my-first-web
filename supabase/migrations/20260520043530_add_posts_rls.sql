-- ============================================================================
-- Migration: posts 테이블 RLS (Row Level Security) 정책 정의
-- 
-- 목적: 
--   - SELECT: 모든 사용자가 모든 포스트 조회 가능 (공개 블로그)
--   - INSERT: 인증된 사용자만 자신의 ID로 포스트 생성
--   - UPDATE: 포스트 작성자만 수정 가능 (user_id는 변경 불가)
--   - DELETE: 포스트 작성자만 삭제 가능
--
-- 주의:
--   - 기존 정책이 있으면 DROP됩니다 (중복 방지)
--   - RLS는 이미 활성화되어 있을 수 있습니다
-- ============================================================================

-- RLS 활성화 (이미 활성화된 경우 무해)
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 기존 정책 삭제 (중복 방지)
-- ============================================================================
DROP POLICY IF EXISTS "Allow public select on posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated inserts on posts" ON public.posts;
DROP POLICY IF EXISTS "Allow owners update posts" ON public.posts;
DROP POLICY IF EXISTS "Allow owners modify posts" ON public.posts;
DROP POLICY IF EXISTS "Allow owners delete posts" ON public.posts;

-- ============================================================================
-- SELECT 정책: 모든 사용자가 공개 포스트 조회 가능
-- ============================================================================
CREATE POLICY "Allow public select on posts"
  ON public.posts
  FOR SELECT
  USING (true);

-- ============================================================================
-- INSERT 정책: 인증된 사용자만 자신의 ID로 포스트 생성 가능
-- ============================================================================
CREATE POLICY "Allow authenticated inserts on posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- ============================================================================
-- UPDATE 정책: 포스트 작성자만 수정 가능 (user_id는 변경 불가)
-- ============================================================================
CREATE POLICY "Allow owners update posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- DELETE 정책: 포스트 작성자만 삭제 가능
-- ============================================================================
CREATE POLICY "Allow owners delete posts"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);
