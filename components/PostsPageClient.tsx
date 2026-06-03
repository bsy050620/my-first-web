"use client";

import { useEffect, useState } from "react";
import { type Post } from "@/lib/posts";
import NewPostButton from "@/components/NewPostButton";
import PostListItem from "@/components/PostListItem";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";

export default function PostsPageClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

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

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">블로그</h1>
        <NewPostButton />
      </div>

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

      {!loading && !error && posts.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </section>
      )}
    </div>
  );
}
