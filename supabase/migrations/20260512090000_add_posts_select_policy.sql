-- ============================================================================
-- Migration: posts 테이블 기존 정책 정리
-- 
-- 목적:
--   - 이전 버전의 불완전한 RLS 정책 제거
--   - 새 마이그레이션에서 올바른 정책 생성 준비
-- ============================================================================

-- RLS 활성화 (이미 활성화된 경우 무해)
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 기존 정책 정리 (새 정책을 위한 사전 작업)
-- ============================================================================
DROP POLICY IF EXISTS "Allow public select on posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated inserts on posts" ON public.posts;
DROP POLICY IF EXISTS "Allow owners modify posts" ON public.posts;
DROP POLICY IF EXISTS "Allow owners update posts" ON public.posts;
DROP POLICY IF EXISTS "Allow owners delete posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
