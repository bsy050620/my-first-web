/**
 * Supabase/네트워크 에러를 사용자 친화적인 메시지로 변환
 */
export function convertErrorToUserMessage(error: any): string {
  if (!error) {
    return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }

  const errorString = String(error.message || error || "");
  const lowerError = errorString.toLowerCase();

  // RLS(Row-level security) 에러
  if (errorString.includes("42501") || lowerError.includes("row-level security")) {
    return "이 작업을 수행할 권한이 없습니다.";
  }

  // 네트워크 에러
  if (lowerError.includes("failed to fetch")) {
    return "인터넷 연결을 확인해주세요.";
  }

  // Not found 관련 에러
  if (
    lowerError.includes("not found") ||
    lowerError.includes("no rows") ||
    errorString.includes("404")
  ) {
    return "요청한 게시글을 찾을 수 없습니다.";
  }

  // 기본값: 원본 메시지가 있으면 그것을 반환, 없으면 일반 메시지
  if (errorString && errorString.trim()) {
    return errorString;
  }

  return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}
