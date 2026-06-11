-- ============================================================================
-- Migration: posts 테이블에 image_url 컬럼 추가 및 이미지 스토리지 설정
-- ============================================================================

-- 1. posts 테이블에 image_url 컬럼 추가
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS image_url text;

-- 2. post-images 버킷 생성 (이미 존재하는 경우 skip)
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. storage.objects 테이블 RLS 정책 정의 (post-images 버킷용)
-- 기존 중복 정책 삭제
DROP POLICY IF EXISTS "Public Access to post-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to post-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images in post-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images from post-images" ON storage.objects;

-- 3-1. SELECT 정책: 모든 사람이 이미지 조회 가능
CREATE POLICY "Public Access to post-images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-images');

-- 3-2. INSERT 정책: 인증된 모든 사용자가 업로드 가능
CREATE POLICY "Authenticated users can upload to post-images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

-- 3-3. UPDATE 정책: 본인 파일만 수정 가능 (owner_id와 owner 모두 호환 가능하게 검사)
CREATE POLICY "Users can update their own images in post-images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'post-images' 
    AND (owner_id::text = auth.uid()::text OR owner::text = auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'post-images' 
    AND (owner_id::text = auth.uid()::text OR owner::text = auth.uid()::text)
  );

-- 3-4. DELETE 정책: 본인 파일만 삭제 가능
CREATE POLICY "Users can delete their own images from post-images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-images' 
    AND (owner_id::text = auth.uid()::text OR owner::text = auth.uid()::text)
  );
