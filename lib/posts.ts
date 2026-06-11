/**
 * 포스트 타입 정의
 * 실제 데이터는 Supabase DB에서 조회됩니다.
 * API에서 profiles 테이블과 조인하여 username을 포함합니다.
 */
export type Post = {
  id: string; // UUID, Supabase에서 자동 생성
  title: string;
  content: string;
  user_id: string; // profiles.id 외래키 (UUID)
  created_at: string; // ISO 8601 타임스탬프
  image_url?: string | null; // 이미지 URL (선택)
  profiles?: {
    username: string | null; // 프로필에서 조인된 사용자명
  };
};

/**
 * API 응답에서 username을 추출하는 헬퍼 함수
 */
export function getDisplayName(post: Post): string {
  return post.profiles?.username || 'Unknown User';
};
