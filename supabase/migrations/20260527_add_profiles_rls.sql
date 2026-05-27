-- ============================================================================
-- Migration: profiles 테이블 RLS (Row Level Security) 정책 정의
-- 
-- 목적: 
--   - SELECT: 모든 사용자가 모든 프로필 조회 가능 (공개 블로그)
--   - UPDATE: 자신의 프로필만 수정 가능
--   - DELETE: 자신의 프로필만 삭제 가능
--
-- 주의:
--   - 기존 정책이 있으면 DROP됩니다 (중복 방지)
-- ============================================================================

-- RLS 활성화
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Allow public select on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users delete own profile" ON public.profiles;

-- ============================================================================
-- SELECT 정책: 모든 사용자가 모든 프로필 조회 가능
-- ============================================================================
CREATE POLICY "Allow public select on profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- ============================================================================
-- UPDATE 정책: 사용자는 자신의 프로필만 수정 가능
-- ============================================================================
CREATE POLICY "Allow users update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- DELETE 정책: 사용자는 자신의 프로필만 삭제 가능
-- ============================================================================
CREATE POLICY "Allow users delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);
