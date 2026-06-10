-- ============================================================================
-- Migration: comments 테이블 생성 및 RLS 정책 정의
-- ============================================================================

-- 1. comments 테이블 생성
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. RLS 활성화
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;

-- 3. 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Allow public select on comments" ON public.comments;
DROP POLICY IF EXISTS "Allow authenticated inserts on comments" ON public.comments;
DROP POLICY IF EXISTS "Allow owners update comments" ON public.comments;
DROP POLICY IF EXISTS "Allow owners delete comments" ON public.comments;

-- 4. SELECT 정책: 모든 사용자가 댓글을 조회 가능
CREATE POLICY "Allow public select on comments"
  ON public.comments
  FOR SELECT
  USING (true);

-- 5. INSERT 정책: 인증된 사용자만 본인 명의로 댓글 생성 가능
CREATE POLICY "Allow authenticated inserts on comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- 6. UPDATE 정책: 댓글 작성자만 내용 수정 가능
CREATE POLICY "Allow owners update comments"
  ON public.comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. DELETE 정책: 댓글 작성자만 삭제 가능
CREATE POLICY "Allow owners delete comments"
  ON public.comments
  FOR DELETE
  USING (auth.uid() = user_id);
