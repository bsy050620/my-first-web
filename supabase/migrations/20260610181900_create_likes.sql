-- ============================================================================
-- Migration: likes 테이블 생성 및 RLS 정책 정의
-- 사용자별 게시글 좋아요 (user_id + post_id 유니크 제약으로 중복 방지)
-- ============================================================================

-- 1. likes 테이블 생성
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  -- 한 사용자가 같은 게시글에 중복 좋아요 방지
  UNIQUE (post_id, user_id)
);

-- 2. 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes (post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes (user_id);

-- 3. RLS 활성화
ALTER TABLE IF EXISTS public.likes ENABLE ROW LEVEL SECURITY;

-- 4. 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Allow public select on likes" ON public.likes;
DROP POLICY IF EXISTS "Allow authenticated inserts on likes" ON public.likes;
DROP POLICY IF EXISTS "Allow owners delete likes" ON public.likes;

-- 5. SELECT 정책: 모든 사용자가 좋아요를 조회 가능
CREATE POLICY "Allow public select on likes"
  ON public.likes
  FOR SELECT
  USING (true);

-- 6. INSERT 정책: 인증된 사용자만 본인 명의로 좋아요 생성 가능
CREATE POLICY "Allow authenticated inserts on likes"
  ON public.likes
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- 7. DELETE 정책: 본인이 누른 좋아요만 취소(삭제) 가능
CREATE POLICY "Allow owners delete likes"
  ON public.likes
  FOR DELETE
  USING (auth.uid() = user_id);
