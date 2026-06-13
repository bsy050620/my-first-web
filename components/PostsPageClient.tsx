"use client";

import { useEffect, useState } from "react";
import { type Post } from "@/lib/posts";
import NewPostButton from "@/components/NewPostButton";
import PostListItem from "@/components/PostListItem";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PostsPageClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/posts", { cache: "no-store" });
      
      if (!response.ok) {
        console.error(
          `[PostsPageClient] API error: ${response.status}`,
          response.statusText
        );
        
        // 에러 응답 상세 정보 로깅
        const responseText = await response.text();
        try {
          const errorData = JSON.parse(responseText);
          console.error("[PostsPageClient] API error details:", errorData);
        } catch {
          console.error("[PostsPageClient] Raw error response:", responseText);
        }
        
        throw new Error("게시글을 불러오는 데 실패했습니다");
      }

      // 응답 텍스트를 먼저 확인한 후 JSON으로 파싱
      const responseText = await response.text();
      if (!responseText) {
        console.error("[PostsPageClient] Empty response from API");
        setPosts([]);
        return;
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseErr) {
        console.error(
          "[PostsPageClient] JSON parse error:",
          parseErr,
          "Response preview:",
          responseText.substring(0, 300)
        );
        throw new Error("서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.");
      }

      if (!responseData || typeof responseData !== "object") {
        console.error(
          "[PostsPageClient] Invalid response format:",
          responseData
        );
        throw new Error("서버 응답 형식이 올바르지 않습니다");
      }

      setPosts(responseData?.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
      setError(message);
      console.error("[PostsPageClient] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">블로그</h1>
        <NewPostButton />
      </div>

      {/* 검색 바 */}
      {!loading && !error && posts.length > 0 && (
        <div className="mb-6 max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <Input
              type="text"
              placeholder="제목 또는 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2 h-10 w-full rounded-xl border border-gray-200 focus-visible:ring-primary/20 dark:border-gray-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="검색어 지우기"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {error && !loading && (
        <ErrorState
          message={error}
          onRetry={fetchPosts}
        />
      )}

      {!loading && !error && posts.length === 0 && (
        <EmptyState
          icon="✍️"
          title="게시글이 없습니다"
          description="첫 번째 게시글을 작성해보세요!"
          action={<NewPostButton />}
        />
      )}

      {!loading && !error && posts.length > 0 && filteredPosts.length === 0 && (
        <EmptyState
          icon="🔍"
          title="검색 결과가 없습니다"
          description={`"${searchQuery}"에 해당하는 게시글을 찾을 수 없습니다. 다른 키워드로 검색해보세요.`}
          action={
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              검색 초기화
            </Button>
          }
        />
      )}

      {!loading && !error && filteredPosts.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </section>
      )}
    </div>
  );
}
