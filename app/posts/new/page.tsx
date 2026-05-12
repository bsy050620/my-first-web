"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (title.trim() === "") {
      setError("제목을 입력해주세요.");
      return;
    }

    try {
      // 현재 로그인한 사용자의 id를 가져옵니다
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        const msg = userError?.message ?? "로그인 정보가 없습니다.";
        setError(msg);
        console.error("getUser error", userError);
        return;
      }

      const user_id = userData.user.id;

      // posts 테이블에 insert
      const { data, error: insertError } = await supabase.from("posts").insert([{
        title,
        content,
        user_id,
      }]);

      if (insertError) {
        setError(insertError.message);
        console.error("insert error", insertError);
        return;
      }

      // 성공 시 이동
      router.push("/posts");
    } catch (err: any) {
      setError(err?.message ?? String(err));
      console.error(err);
    }
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
