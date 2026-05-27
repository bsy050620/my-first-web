import React from "react";
import PostForm from "@/components/PostForm";
import ErrorState from "@/components/ErrorState";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function EditPage({ params }: Props) {
  const { id } = await Promise.resolve(params);

  const cookieJar = await cookies();
  const cookieStore = {
    getAll: () => cookieJar.getAll().map((c) => ({ name: c.name, value: c.value })),
    setAll: (newCookies: Array<any>) => newCookies.forEach((c) => cookieJar.set(c)),
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore },
  );

  const { data, error } = await supabase
    .from("posts")
    .select("id,title,content,user_id,created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Failed to fetch post for edit:", error);
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <ErrorState
          title="게시글을 불러올 수 없습니다"
          message="요청하신 게시글이 존재하지 않거나 접근 권한이 없습니다."
          action={
            <Link href="/posts" className="inline-block text-blue-600 hover:underline text-sm font-medium">
              목록으로 돌아가기
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>
      <PostForm initialData={{ title: data.title, content: data.content }} postId={String(id)} />
    </div>
  );
}
