"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  initialData?: { title?: string; content?: string };
  postId?: string;
};

export default function PostForm({ initialData, postId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    if (!user) {
      setError("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const payload: any = { title, content, user_id: user.id };
      const url = postId ? `/api/posts/${postId}` : "/api/posts";
      const method = postId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message ?? err?.error ?? "서버 오류");
      }

      router.push("/posts");
    } catch (err: any) {
      setError(err?.message ?? String(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 rounded bg-red-50 text-red-600 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          제목
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          내용
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={8}
          className="w-full rounded-lg border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
          disabled={loading}
        />
      </div>

      <div className="flex items-center space-x-3">
        <Button type="submit" disabled={loading}>
          {loading ? (postId ? "수정 중..." : "저장 중...") : postId ? "수정 저장" : "저장"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/posts")}
          disabled={loading}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
