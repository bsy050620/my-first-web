"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === "") {
      setError("제목을 입력해주세요.");
      return;
    }

    // TODO: 실제 저장 로직을 연결하세요 (API 호출 또는 서버 액션)
    alert("저장되었습니다");
    router.push("/posts");
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">새 게시글 작성</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={8}
            className="w-full rounded-lg border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Button type="submit">저장</Button>

          <Button variant="ghost" onClick={() => router.push("/posts")}>취소</Button>
        </div>
      </form>
    </div>
  );
}
